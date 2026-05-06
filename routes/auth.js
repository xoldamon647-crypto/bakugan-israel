const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'כל השדות נדרשים' });
  if (username.length < 3)
    return res.status(400).json({ error: 'שם משתמש חייב להכיל לפחות 3 תווים' });
  if (password.length < 6)
    return res.status(400).json({ error: 'סיסמה חייבת להכיל לפחות 6 תווים' });

  try {
    const exists = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (exists) return res.status(409).json({ error: 'שם משתמש או אימייל כבר קיים' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)').run(id, username, email, hash);

    const token = jwt.sign({ id, username, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, username, email, role: 'user' } });
  } catch (e) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'כל השדות נדרשים' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });

  db.prepare('UPDATE users SET last_seen = ? WHERE id = ?').run(new Date().toISOString().slice(0,19).replace('T',' '), user.id);
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, bio: user.bio } });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, avatar, bio, created_at, last_seen FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

  const postCount = db.prepare('SELECT COUNT(*) as c FROM forum_posts WHERE user_id = ?').get(req.user.id)?.c || 0;
  const threadCount = db.prepare('SELECT COUNT(*) as c FROM forum_threads WHERE user_id = ?').get(req.user.id)?.c || 0;
  const eventCount = db.prepare('SELECT COUNT(*) as c FROM event_applications WHERE user_id = ?').get(req.user.id)?.c || 0;
  res.json({ ...user, postCount, threadCount, eventCount });
});

router.put('/me', authMiddleware, (req, res) => {
  const { bio, avatar } = req.body;
  db.prepare('UPDATE users SET bio = ?, avatar = ? WHERE id = ?').run(bio || '', avatar || '', req.user.id);
  res.json({ success: true });
});

router.get('/stats', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get()?.c || 0;
  const threads = db.prepare('SELECT COUNT(*) as c FROM forum_threads').get()?.c || 0;
  const posts = db.prepare('SELECT COUNT(*) as c FROM forum_posts').get()?.c || 0;
  const events = db.prepare("SELECT COUNT(*) as c FROM events WHERE status = 'upcoming'").get()?.c || 0;
  res.json({ users, threads, posts, events });
});

module.exports = router;
