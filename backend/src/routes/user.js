const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// GET /api/user/profile - get user profile with stats
router.get('/profile', (req, res) => {
  const db = getDb();
  try {
    const user = db.prepare(
      'SELECT id, username, email, settings, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // Total study minutes
    const studyStats = db.prepare(
      'SELECT COALESCE(SUM(study_minutes), 0) AS total_minutes FROM conversations WHERE user_id = ?'
    ).get(req.user.id);

    // Total sessions
    const sessionStats = db.prepare(
      'SELECT COUNT(*) AS total_sessions FROM conversations WHERE user_id = ?'
    ).get(req.user.id);

    // Selected characters
    const characters = db.prepare(`
      SELECT uc.*, ch.name, ch.avatar_url, ch.personality_tag
      FROM user_characters uc
      JOIN characters ch ON uc.character_id = ch.id
      WHERE uc.user_id = ?
    `).all(req.user.id);

    res.json({
      ...user,
      settings: JSON.parse(user.settings || '{}'),
      stats: {
        totalStudyMinutes: studyStats.total_minutes,
        totalSessions: sessionStats.total_sessions,
      },
      characters,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// PUT /api/user/settings - update user settings
router.put(
  '/settings',
  [body('settings').isObject().withMessage('settings必须是JSON对象')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = getDb();
    try {
      const current = db.prepare('SELECT settings FROM users WHERE id = ?').get(req.user.id);
      if (!current) {
        return res.status(404).json({ error: '用户不存在' });
      }

      const existing = JSON.parse(current.settings || '{}');
      const merged = { ...existing, ...req.body.settings };

      db.prepare('UPDATE users SET settings = ? WHERE id = ?').run(
        JSON.stringify(merged),
        req.user.id
      );

      res.json({ settings: merged });
    } catch (err) {
      console.error('Update settings error:', err);
      res.status(500).json({ error: '更新设置失败' });
    }
  }
);

// GET /api/user/achievements - get user achievements
router.get('/achievements', (req, res) => {
  const db = getDb();
  try {
    const all = db.prepare('SELECT * FROM achievements').all();
    const unlocked = db.prepare(
      'SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?'
    ).all(req.user.id);

    const unlockedMap = Object.fromEntries(
      unlocked.map((u) => [u.achievement_id, u.unlocked_at])
    );

    const result = all.map((ach) => ({
      ...ach,
      unlocked: !!unlockedMap[ach.id],
      unlocked_at: unlockedMap[ach.id] || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ error: '获取成就失败' });
  }
});

// GET /api/user/streak - get study streak
router.get('/streak', (req, res) => {
  const db = getDb();
  try {
    // Fetch distinct study days ordered descending
    const rows = db.prepare(`
      SELECT DISTINCT DATE(created_at) AS study_day
      FROM conversations
      WHERE user_id = ? AND study_minutes > 0
      ORDER BY study_day DESC
    `).all(req.user.id);

    if (rows.length === 0) {
      return res.json({ currentStreak: 0, longestStreak: 0, studyDays: [] });
    }

    const MS_PER_DAY = 86400000;
  const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let streakCount = 0;
    let prevDate = null;

    for (const row of rows) {
      const d = new Date(row.study_day);
      if (!prevDate) {
        // Must have studied today or yesterday to maintain current streak
        const diffFromToday = Math.floor((today - d) / MS_PER_DAY);
        if (diffFromToday <= 1) {
          streakCount = 1;
          currentStreak = 1;
        } else {
          currentStreak = 0;
        }
      } else {
        const diff = Math.floor((prevDate - d) / MS_PER_DAY);
        if (diff === 1) {
          streakCount += 1;
          if (currentStreak > 0) currentStreak = streakCount;
        } else {
          streakCount = 1;
        }
      }
      longestStreak = Math.max(longestStreak, streakCount);
      prevDate = d;
    }

    res.json({
      currentStreak,
      longestStreak,
      studyDays: rows.map((r) => r.study_day),
    });
  } catch (err) {
    console.error('Get streak error:', err);
    res.status(500).json({ error: '获取学习记录失败' });
  }
});

module.exports = router;
