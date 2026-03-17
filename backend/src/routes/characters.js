const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { createMemoryFiles, getMemory } = require('../services/memoryService');

const router = express.Router();

// GET /api/characters - list all characters, with user relationship data if authenticated
router.get('/', optionalAuth, (req, res) => {
  const db = getDb();
  try {
    const characters = db.prepare('SELECT * FROM characters ORDER BY created_at ASC').all();

    if (req.user) {
      const enriched = characters.map((char) => {
        const rel = db.prepare(
          'SELECT * FROM user_characters WHERE user_id = ? AND character_id = ?'
        ).get(req.user.id, char.id);
        return { ...char, relationship: rel || null };
      });
      return res.json(enriched);
    }

    res.json(characters);
  } catch (err) {
    console.error('Get characters error:', err);
    res.status(500).json({ error: '获取角色列表失败' });
  }
});

// GET /api/characters/:id - get character details
router.get('/:id', optionalAuth, (req, res) => {
  const db = getDb();
  try {
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }

    let relationship = null;
    if (req.user) {
      relationship = db.prepare(
        'SELECT * FROM user_characters WHERE user_id = ? AND character_id = ?'
      ).get(req.user.id, req.params.id);
    }

    res.json({ ...character, relationship: relationship || null });
  } catch (err) {
    console.error('Get character error:', err);
    res.status(500).json({ error: '获取角色详情失败' });
  }
});

// POST /api/characters/select - select initial character (create user_character entry)
router.post('/select', authenticateToken, async (req, res) => {
  const { characterId } = req.body;
  if (!characterId) {
    return res.status(400).json({ error: '请指定角色ID' });
  }

  const db = getDb();
  try {
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId);
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }

    const existing = db.prepare(
      'SELECT id FROM user_characters WHERE user_id = ? AND character_id = ?'
    ).get(req.user.id, characterId);

    if (existing) {
      return res.json({ message: '已选择该角色', alreadySelected: true });
    }

    const id = uuidv4();
    const memoryPath = createMemoryFiles(req.user.id, characterId);

    db.prepare(`
      INSERT INTO user_characters (id, user_id, character_id, memory_file_path)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user.id, characterId, memoryPath);

    const userChar = db.prepare('SELECT * FROM user_characters WHERE id = ?').get(id);
    res.status(201).json({ userCharacter: userChar, character });
  } catch (err) {
    console.error('Select character error:', err);
    res.status(500).json({ error: '选择角色失败' });
  }
});

// GET /api/characters/:id/memory - get character memory files
router.get('/:id/memory', authenticateToken, (req, res) => {
  try {
    const memory = getMemory(req.user.id, req.params.id);
    res.json(memory);
  } catch (err) {
    console.error('Get memory error:', err);
    res.status(500).json({ error: '获取记忆文件失败' });
  }
});

module.exports = router;
