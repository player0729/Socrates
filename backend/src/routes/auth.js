const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('Warning: JWT_SECRET not set, using insecure fallback for development');
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'fallback-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = '7d';

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    EFFECTIVE_JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('用户名长度需在2到30个字符之间'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('请输入有效的邮箱地址'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码至少需要6个字符'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const db = getDb();

    try {
      const existing = db.prepare(
        'SELECT id FROM users WHERE username = ? OR email = ?'
      ).get(username, email);

      if (existing) {
        return res.status(409).json({ error: '用户名或邮箱已被注册' });
      }

      const password_hash = await bcrypt.hash(password, 12);
      const id = uuidv4();

      db.prepare(
        'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
      ).run(id, username, email, password_hash);

      const user = { id, username, email };
      const token = signToken(user);

      res.status(201).json({ token, user });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: '注册失败，请稍后重试' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').notEmpty().withMessage('请输入密码'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getDb();

    try {
      const user = db.prepare(
        'SELECT id, username, email, password_hash FROM users WHERE email = ?'
      ).get(email);

      if (!user) {
        return res.status(401).json({ error: '邮箱或密码不正确' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: '邮箱或密码不正确' });
      }

      const tokenUser = { id: user.id, username: user.username, email: user.email };
      const token = signToken(tokenUser);

      res.json({ token, user: tokenUser });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: '登录失败，请稍后重试' });
    }
  }
);

module.exports = router;
