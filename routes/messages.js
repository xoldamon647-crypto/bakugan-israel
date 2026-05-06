const express = require('express');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get conversations for current user
router.get('/conversations', authMiddleware, (req, res) => {
  const conversations = db.prepare(`
    SELECT
      CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
      CASE WHEN sender_id = ? THEN receiver_username ELSE sender_username END as other_username,
      CASE WHEN sender_id = ? THEN receiver_avatar ELSE sender_avatar END as other_avatar,
      last_message, last_message_time, unread_count
    FROM (
      SELECT
        m.sender_id, m.receiver_id,
        su.username as sender_username, su.avatar as sender_avatar,
        ru.username as receiver_username, ru.avatar as receiver_avatar,
        m.content as last_message, m.created_at as last_message_time,
        (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = m.sender_id AND m2.receiver_id = m.receiver_id AND m2.is_read = 0 AND m2.receiver_id = ?) as unread_count
      FROM messages m
      JOIN users su ON su.id = m.sender_id
      JOIN users ru ON ru.id = m.receiver_id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at DESC
    ) GROUP BY other_user_id
    ORDER BY last_message_time DESC
  `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);

  res.json(conversations);
});

// Get unread message count — must be before /:userId to avoid being caught by that route
router.get('/unread/count', authMiddleware, (req, res) => {
  const count = db.prepare(
    'SELECT COUNT(*) as c FROM messages WHERE receiver_id = ? AND is_read = 0'
  ).get(req.user.id)?.c || 0;

  res.json({ count });
});

// Get messages with a specific user
router.get('/:userId', authMiddleware, (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  // Mark messages as read
  db.prepare(
    'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0'
  ).run(req.params.userId, req.user.id);

  const messages = db.prepare(`
    SELECT m.*, u.username, u.avatar
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, req.params.userId, req.params.userId, req.user.id, Number(limit), Number(offset));

  // Get user info
  const user = db.prepare('SELECT id, username, avatar FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

  res.json({ user, messages: messages.reverse() });
});

// Send a message
router.post('/:userId', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content || content.length < 1) return res.status(400).json({ error: 'הודעה ריקה' });
  if (content.length > 1000) return res.status(400).json({ error: 'הודעה ארוכה מדי' });

  const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!receiver) return res.status(404).json({ error: 'משתמש לא נמצא' });
  if (req.params.userId === req.user.id) return res.status(400).json({ error: 'לא ניתן לשלוח הודעה לעצמך' });

  const result = db.prepare(
    'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)'
  ).run(req.user.id, req.params.userId, content.trim());

  res.json({ id: result.lastInsertRowid, success: true });
});


module.exports = router;