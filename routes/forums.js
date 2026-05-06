const express = require('express');
const { db } = require('../database');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/categories', (req, res) => {
  const cats = db.prepare(`
    SELECT fc.*,
      COUNT(DISTINCT ft.id) as thread_count,
      MAX(ft.updated_at) as last_activity
    FROM forum_categories fc
    LEFT JOIN forum_threads ft ON ft.category_id = fc.id
    GROUP BY fc.id
    ORDER BY fc.order_num
  `).all();
  res.json(cats);
});

router.get('/threads', optionalAuth, (req, res) => {
  const { category_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = '';
  let params = [];
  if (category_id) { where = 'WHERE ft.category_id = ?'; params.push(category_id); }

  const threads = db.prepare(`
    SELECT ft.*, u.username, u.avatar, fc.name as category_name,
      (SELECT COUNT(*) FROM forum_posts fp WHERE fp.thread_id = ft.id) as post_count,
      (SELECT u2.username FROM forum_posts fp2
       JOIN users u2 ON u2.id = fp2.user_id
       WHERE fp2.thread_id = ft.id
       ORDER BY fp2.created_at DESC LIMIT 1) as last_poster
    FROM forum_threads ft
    JOIN users u ON u.id = ft.user_id
    JOIN forum_categories fc ON fc.id = ft.category_id
    ${where}
    ORDER BY ft.is_pinned DESC, ft.updated_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset));

  const total = db.prepare(`SELECT COUNT(*) as c FROM forum_threads ft ${where}`).get(...params)?.c || 0;
  res.json({ threads, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.get('/threads/:id', optionalAuth, (req, res) => {
  const thread = db.prepare(`
    SELECT ft.*, u.username, u.avatar, u.role, u.created_at as user_joined, fc.name as category_name,
      (SELECT COUNT(*) FROM forum_posts fp WHERE fp.thread_id = ft.id) as post_count
    FROM forum_threads ft
    JOIN users u ON u.id = ft.user_id
    JOIN forum_categories fc ON fc.id = ft.category_id
    WHERE ft.id = ?
  `).get(req.params.id);
  if (!thread) return res.status(404).json({ error: 'שרשור לא נמצא' });

  db.prepare('UPDATE forum_threads SET views = views + 1 WHERE id = ?').run(req.params.id);

  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const posts = db.prepare(`
    SELECT fp.*, u.username, u.avatar, u.role,
      (SELECT COUNT(*) FROM forum_posts fp2 WHERE fp2.user_id = fp.user_id) as user_post_count
    FROM forum_posts fp
    JOIN users u ON u.id = fp.user_id
    WHERE fp.thread_id = ?
    ORDER BY fp.created_at ASC
    LIMIT ? OFFSET ?
  `).all(req.params.id, Number(limit), Number(offset));

  const total = db.prepare('SELECT COUNT(*) as c FROM forum_posts WHERE thread_id = ?').get(req.params.id)?.c || 0;
  res.json({ thread, posts, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.post('/threads', authMiddleware, (req, res) => {
  const { category_id, title, content } = req.body;
  if (!category_id || !title || !content)
    return res.status(400).json({ error: 'כל השדות נדרשים' });
  if (title.length < 5)
    return res.status(400).json({ error: 'כותרת חייבת להכיל לפחות 5 תווים' });

  const cat = db.prepare('SELECT id FROM forum_categories WHERE id = ?').get(category_id);
  if (!cat) return res.status(404).json({ error: 'קטגוריה לא נמצאה' });

  const result = db.prepare(
    'INSERT INTO forum_threads (category_id, user_id, title, content) VALUES (?, ?, ?, ?)'
  ).run(category_id, req.user.id, title, content);

  res.json({ id: result.lastInsertRowid, success: true });
});

router.post('/threads/:id/posts', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content || content.length < 2)
    return res.status(400).json({ error: 'תוכן התגובה נדרש' });

  const thread = db.prepare('SELECT id, is_locked FROM forum_threads WHERE id = ?').get(req.params.id);
  if (!thread) return res.status(404).json({ error: 'שרשור לא נמצא' });
  if (thread.is_locked) return res.status(403).json({ error: 'שרשור נעול' });

  const result = db.prepare(
    'INSERT INTO forum_posts (thread_id, user_id, content) VALUES (?, ?, ?)'
  ).run(req.params.id, req.user.id, content);

  db.prepare('UPDATE forum_threads SET updated_at = ?, reply_count = reply_count + 1 WHERE id = ?').run(new Date().toISOString().slice(0,19).replace('T',' '), req.params.id);
  res.json({ id: result.lastInsertRowid, success: true });
});

router.delete('/posts/:id', authMiddleware, (req, res) => {
  const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'תגובה לא נמצאה' });
  if (post.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'אין הרשאה' });

  db.prepare('DELETE FROM forum_posts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.patch('/threads/:id/pin', adminMiddleware, (req, res) => {
  const thread = db.prepare('SELECT id, is_pinned FROM forum_threads WHERE id = ?').get(req.params.id);
  if (!thread) return res.status(404).json({ error: 'שרשור לא נמצא' });
  db.prepare('UPDATE forum_threads SET is_pinned = ? WHERE id = ?').run(thread.is_pinned ? 0 : 1, req.params.id);
  res.json({ success: true });
});

router.patch('/threads/:id/lock', adminMiddleware, (req, res) => {
  const thread = db.prepare('SELECT id, is_locked FROM forum_threads WHERE id = ?').get(req.params.id);
  if (!thread) return res.status(404).json({ error: 'שרשור לא נמצא' });
  db.prepare('UPDATE forum_threads SET is_locked = ? WHERE id = ?').run(thread.is_locked ? 0 : 1, req.params.id);
  res.json({ success: true });
});

router.delete('/threads/:id', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM forum_posts WHERE thread_id = ?').run(req.params.id);
  db.prepare('DELETE FROM forum_threads WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
