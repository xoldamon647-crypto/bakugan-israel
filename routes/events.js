const express = require('express');
const { db } = require('../database');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Auto-complete events whose date has passed
function autoCompleteEvents() {
  db.prepare(`
    UPDATE events SET status = 'completed'
    WHERE status != 'completed' AND event_date IS NOT NULL AND event_date < datetime('now')
  `).run();
}

router.get('/', optionalAuth, (req, res) => {
  autoCompleteEvents();

  const { status, type } = req.query;
  let where = [];
  let params = [];
  if (status) { where.push('e.status = ?'); params.push(status); }
  if (type) { where.push('e.event_type = ?'); params.push(type); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const events = db.prepare(`
    SELECT e.*, u.username as creator_name,
      (SELECT COUNT(*) FROM event_applications ea WHERE ea.event_id = e.id AND ea.is_coming = 1) as participant_count
    FROM events e
    JOIN users u ON u.id = e.created_by
    ${whereStr}
    ORDER BY
      CASE e.status WHEN 'upcoming' THEN 0 WHEN 'ongoing' THEN 1 ELSE 2 END,
      e.event_date ASC
  `).all(...params);
  res.json(events);
});

router.get('/:id', optionalAuth, (req, res) => {
  const event = db.prepare(`
    SELECT e.*, u.username as creator_name,
      (SELECT COUNT(*) FROM event_applications ea WHERE ea.event_id = e.id AND ea.is_coming = 1) as participant_count
    FROM events e
    JOIN users u ON u.id = e.created_by
    WHERE e.id = ?
  `).get(req.params.id);
  if (!event) return res.status(404).json({ error: 'אירוע לא נמצא' });

  const applications = db.prepare(`
    SELECT ea.*, u.username FROM event_applications ea
    LEFT JOIN users u ON u.id = ea.user_id
    WHERE ea.event_id = ?
    ORDER BY ea.created_at ASC
  `).all(req.params.id);

  res.json({ event, applications });
});

router.post('/', adminMiddleware, (req, res) => {
  const { title, description, event_date, location, max_participants, event_type, image, prize } = req.body;
  if (!title || !event_date) return res.status(400).json({ error: 'שם ותאריך נדרשים' });

  const result = db.prepare(`
    INSERT INTO events (title, description, event_date, location, max_participants, event_type, image, prize, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description || '', event_date, location || '', max_participants || 0, event_type || 'tournament', image || '', prize || '', req.user.id);

  res.json({ id: result.lastInsertRowid, success: true });
});

router.put('/:id', adminMiddleware, (req, res) => {
  const { title, description, event_date, location, max_participants, event_type, image, status, prize } = req.body;
  const event = db.prepare('SELECT id FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'אירוע לא נמצא' });

  db.prepare(`
    UPDATE events SET title=?, description=?, event_date=?, location=?, max_participants=?,
    event_type=?, image=?, status=?, prize=? WHERE id=?
  `).run(title, description || '', event_date, location || '', max_participants || 0,
    event_type || 'tournament', image || '', status || 'upcoming', prize || '', req.params.id);

  res.json({ success: true });
});

router.delete('/:id', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM event_applications WHERE event_id = ?').run(req.params.id);
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/apply', (req, res) => {
  const { name, is_coming, notes } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'שם נדרש' });

  const event = db.prepare('SELECT id, max_participants, status FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'אירוע לא נמצא' });
  if (event.status === 'completed') return res.status(400).json({ error: 'האירוע הסתיים' });

  if (event.max_participants > 0) {
    const count = db.prepare('SELECT COUNT(*) as c FROM event_applications WHERE event_id = ? AND is_coming = 1').get(req.params.id)?.c || 0;
    if (count >= event.max_participants) return res.status(400).json({ error: 'האירוע מלא' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  let userId = null;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch {}
  }

  // Prevent duplicate registration for logged-in users
  if (userId) {
    const existing = db.prepare('SELECT id FROM event_applications WHERE event_id = ? AND user_id = ?').get(req.params.id, userId);
    if (existing) return res.status(409).json({ error: 'כבר נרשמת לאירוע זה' });
  }

  const result = db.prepare(
    'INSERT INTO event_applications (event_id, user_id, name, is_coming, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.id, userId, name.trim(), is_coming !== false ? 1 : 0, notes || '');

  res.json({ id: result.lastInsertRowid, success: true });
});

router.delete('/:eventId/apply/:appId', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM event_applications WHERE id = ? AND event_id = ?').run(req.params.appId, req.params.eventId);
  res.json({ success: true });
});

module.exports = router;
