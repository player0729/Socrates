const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All course routes require authentication
router.use(authenticateToken);

// GET /api/courses - get user's courses
router.get('/', (req, res) => {
  const db = getDb();
  try {
    const courses = db.prepare(
      'SELECT * FROM courses WHERE user_id = ? ORDER BY updated_at DESC'
    ).all(req.user.id);

    // Attach character info to each course
    const enriched = courses.map((course) => {
      const character = course.character_id
        ? db.prepare('SELECT id, name, avatar_url, personality_tag FROM characters WHERE id = ?')
            .get(course.character_id)
        : null;
      return { ...course, character };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: '获取课程列表失败' });
  }
});

// POST /api/courses - create a new course
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('课程标题不能为空'),
    body('characterId').optional().isString(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, characterId, totalChapters, sourceFile } = req.body;
    const db = getDb();

    try {
      if (characterId) {
        const char = db.prepare('SELECT id FROM characters WHERE id = ?').get(characterId);
        if (!char) {
          return res.status(404).json({ error: '指定的角色不存在' });
        }
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO courses (id, user_id, character_id, title, description, source_file, total_chapters, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        req.user.id,
        characterId || null,
        title,
        description || null,
        sourceFile || null,
        totalChapters || 1,
        now,
        now
      );

      const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
      res.status(201).json(course);
    } catch (err) {
      console.error('Create course error:', err);
      res.status(500).json({ error: '创建课程失败' });
    }
  }
);

// GET /api/courses/:id - get course details
router.get('/:id', (req, res) => {
  const db = getDb();
  try {
    const course = db.prepare(
      'SELECT * FROM courses WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!course) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const character = course.character_id
      ? db.prepare('SELECT id, name, avatar_url, personality_tag FROM characters WHERE id = ?')
          .get(course.character_id)
      : null;

    // Fetch recent conversations for this course
    const conversations = db.prepare(
      'SELECT id, chapter, summary, study_minutes, created_at, updated_at FROM conversations WHERE course_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 20'
    ).all(req.params.id, req.user.id);

    res.json({ ...course, character, conversations });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ error: '获取课程详情失败' });
  }
});

// PUT /api/courses/:id - update course progress
router.put(
  '/:id',
  [
    body('currentChapter').optional().isInt({ min: 1 }),
    body('totalChapters').optional().isInt({ min: 1 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDb();
    try {
      const course = db.prepare(
        'SELECT * FROM courses WHERE id = ? AND user_id = ?'
      ).get(req.params.id, req.user.id);

      if (!course) {
        return res.status(404).json({ error: '课程不存在' });
      }

      const { title, description, currentChapter, totalChapters } = req.body;
      const now = new Date().toISOString();

      db.prepare(`
        UPDATE courses
        SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          current_chapter = COALESCE(?, current_chapter),
          total_chapters = COALESCE(?, total_chapters),
          updated_at = ?
        WHERE id = ? AND user_id = ?
      `).run(
        title || null,
        description || null,
        currentChapter || null,
        totalChapters || null,
        now,
        req.params.id,
        req.user.id
      );

      const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
      res.json(updated);
    } catch (err) {
      console.error('Update course error:', err);
      res.status(500).json({ error: '更新课程失败' });
    }
  }
);

module.exports = router;
