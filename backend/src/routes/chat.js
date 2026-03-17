const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { getMemory, updateMemory, addDiaryEntry } = require('../services/memoryService');
const { buildSystemPrompt, generateResponse, generateDiary } = require('../services/aiService');

const router = express.Router();

router.use(authenticateToken);

// POST /api/chat/send - send a message and get AI response
router.post('/send', async (req, res) => {
  const { characterId, courseId, chapter, message, sessionId } = req.body;

  if (!characterId || !message) {
    return res.status(400).json({ error: '请提供角色ID和消息内容' });
  }

  const db = getDb();

  try {
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId);
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }

    const course = courseId
      ? db.prepare('SELECT * FROM courses WHERE id = ? AND user_id = ?').get(courseId, req.user.id)
      : null;

    // Load or create conversation session
    let conversation;
    if (sessionId) {
      conversation = db.prepare(
        'SELECT * FROM conversations WHERE id = ? AND user_id = ?'
      ).get(sessionId, req.user.id);
    }

    if (!conversation) {
      const newId = uuidv4();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO conversations (id, user_id, character_id, course_id, chapter, messages, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, '[]', ?, ?)
      `).run(newId, req.user.id, characterId, courseId || null, chapter || 1, now, now);
      conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(newId);
    }

    // Parse existing messages
    const messages = JSON.parse(conversation.messages || '[]');

    // Load character memory
    let memory = null;
    try {
      memory = getMemory(req.user.id, characterId);
    } catch {
      // Memory files may not exist yet; proceed without
    }

    const systemPrompt = buildSystemPrompt(character, memory, course);

    // Build OpenAI-format messages
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const aiReply = await generateResponse(apiMessages, character);

    // Append user and assistant messages
    const now = new Date().toISOString();
    const userMsg = { id: uuidv4(), role: 'user', content: message, timestamp: now };
    const assistantMsg = { id: uuidv4(), role: 'assistant', content: aiReply, timestamp: now };
    messages.push(userMsg, assistantMsg);

    db.prepare(`
      UPDATE conversations
      SET messages = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(messages), now, conversation.id);

    res.json({
      sessionId: conversation.id,
      message: assistantMsg,
      userMessage: userMsg,
    });
  } catch (err) {
    console.error('Chat send error:', err);
    res.status(500).json({ error: '发送消息失败，请稍后重试' });
  }
});

// POST /api/chat/end-session - end session, generate summary, update memory/diary
router.post('/end-session', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: '请提供会话ID' });
  }

  const db = getDb();

  try {
    const conversation = db.prepare(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?'
    ).get(sessionId, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(conversation.character_id);
    const messages = JSON.parse(conversation.messages || '[]');

    if (messages.length === 0) {
      return res.json({ message: '会话无内容，已关闭' });
    }

    // Build a plain-text summary of the conversation
    const conversationText = messages
      .map((m) => `${m.role === 'user' ? '学生' : character.name}: ${m.content}`)
      .join('\n');

    let memory = null;
    try {
      memory = getMemory(req.user.id, conversation.character_id);
    } catch {
      // proceed without existing memory
    }

    // Generate diary entry for the character
    const diaryEntry = await generateDiary(character, conversationText, memory);

    // Persist diary
    addDiaryEntry(req.user.id, conversation.character_id, diaryEntry);

    // Calculate study minutes (approx: 1 min per 2 message pairs)
    const studyMinutes = Math.max(1, Math.floor(messages.length / 2));
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE conversations
      SET summary = ?, study_minutes = ?, updated_at = ?
      WHERE id = ?
    `).run(diaryEntry, studyMinutes, now, sessionId);

    // Update user_characters study time
    db.prepare(`
      UPDATE user_characters
      SET total_study_minutes = total_study_minutes + ?, last_interaction = ?
      WHERE user_id = ? AND character_id = ?
    `).run(studyMinutes, now, req.user.id, conversation.character_id);

    // Check and award first_lesson achievement
    const sessionCount = db.prepare(
      'SELECT COUNT(*) as cnt FROM conversations WHERE user_id = ? AND study_minutes > 0'
    ).get(req.user.id);

    if (sessionCount.cnt >= 1) {
      const alreadyHas = db.prepare(
        'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
      ).get(req.user.id, 'first_lesson');

      if (!alreadyHas) {
        db.prepare(
          'INSERT INTO user_achievements (id, user_id, achievement_id) VALUES (?, ?, ?)'
        ).run(uuidv4(), req.user.id, 'first_lesson');
      }
    }

    res.json({ summary: diaryEntry, studyMinutes });
  } catch (err) {
    console.error('End session error:', err);
    res.status(500).json({ error: '结束会话失败' });
  }
});

// GET /api/chat/history/:sessionId - get conversation history
router.get('/history/:sessionId', (req, res) => {
  const db = getDb();
  try {
    const conversation = db.prepare(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?'
    ).get(req.params.sessionId, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const messages = JSON.parse(conversation.messages || '[]');
    res.json({ ...conversation, messages });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: '获取会话历史失败' });
  }
});

// GET /api/chat/sessions - get user's conversation sessions
router.get('/sessions', (req, res) => {
  const db = getDb();
  try {
    const sessions = db.prepare(`
      SELECT c.id, c.character_id, c.course_id, c.chapter, c.summary,
             c.study_minutes, c.created_at, c.updated_at,
             ch.name AS character_name, ch.avatar_url, ch.personality_tag
      FROM conversations c
      LEFT JOIN characters ch ON c.character_id = ch.id
      WHERE c.user_id = ?
      ORDER BY c.updated_at DESC
      LIMIT 50
    `).all(req.user.id);

    res.json(sessions);
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ error: '获取会话列表失败' });
  }
});

module.exports = router;
