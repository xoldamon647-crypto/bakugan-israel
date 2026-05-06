const express = require('express');
const { db } = require('../database');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', adminMiddleware, (req, res) => {
  const stats = {
    users: db.prepare('SELECT COUNT(*) as c FROM users').get()?.c || 0,
    threads: db.prepare('SELECT COUNT(*) as c FROM forum_threads').get()?.c || 0,
    posts: db.prepare('SELECT COUNT(*) as c FROM forum_posts').get()?.c || 0,
    events: db.prepare('SELECT COUNT(*) as c FROM events').get()?.c || 0,
    wiki: db.prepare('SELECT COUNT(*) as c FROM wiki_pages').get()?.c || 0,
    applications: db.prepare('SELECT COUNT(*) as c FROM event_applications').get()?.c || 0,
  };

  const recentUsers = db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10').all();
  const recentThreads = db.prepare(`
    SELECT ft.id, ft.title, ft.created_at, u.username FROM forum_threads ft
    JOIN users u ON u.id = ft.user_id ORDER BY ft.created_at DESC LIMIT 10
  `).all();

  res.json({ stats, recentUsers, recentThreads });
});

router.get('/users', adminMiddleware, (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, created_at, last_seen FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.patch('/users/:id/role', adminMiddleware, (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin', 'moderator'].includes(role))
    return res.status(400).json({ error: 'תפקיד לא תקין' });
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'לא ניתן לשנות תפקיד עצמי' });

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ success: true });
});

router.delete('/users/:id', adminMiddleware, (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'לא ניתן למחוק את עצמך' });

  db.prepare('DELETE FROM forum_posts WHERE user_id = ?').run(req.params.id);
  db.prepare('DELETE FROM forum_threads WHERE user_id = ?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/categories', adminMiddleware, (req, res) => {
  const { name, description, icon, order_num } = req.body;
  if (!name) return res.status(400).json({ error: 'שם נדרש' });
  const result = db.prepare('INSERT INTO forum_categories (name, description, icon, order_num) VALUES (?, ?, ?, ?)').run(
    name, description || '', icon || '💬', order_num || 0
  );
  res.json({ id: result.lastInsertRowid, success: true });
});

router.delete('/categories/:id', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM forum_categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
