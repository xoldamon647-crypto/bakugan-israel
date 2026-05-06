const express = require('express');
const { db } = require('../database');
const { adminMiddleware, optionalAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const { season, category } = req.query;
  let where = [];
  let params = [];
  if (season !== undefined) { where.push('season = ?'); params.push(Number(season)); }
  if (category) { where.push('category = ?'); params.push(category); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const pages = db.prepare(`
    SELECT id, slug, title, season, category, cover_image, updated_at
    FROM wiki_pages ${whereStr} ORDER BY season ASC, title ASC
  `).all(...params);
  res.json(pages);
});

router.get('/:slug', (req, res) => {
  const page = db.prepare(`
    SELECT wp.*, u.username as author FROM wiki_pages wp
    LEFT JOIN users u ON u.id = wp.created_by
    WHERE wp.slug = ?
  `).get(req.params.slug);
  if (!page) return res.status(404).json({ error: 'עמוד לא נמצא' });
  res.json(page);
});

router.post('/', adminMiddleware, (req, res) => {
  const { slug, title, content, season, category, cover_image } = req.body;
  if (!slug || !title || !content) return res.status(400).json({ error: 'slug, כותרת ותוכן נדרשים' });

  try {
    db.prepare(`
      INSERT INTO wiki_pages (slug, title, content, season, category, cover_image, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(slug, title, content, season || 0, category || 'general', cover_image || '', req.user.id);
    res.json({ success: true });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return res.status(409).json({ error: 'slug כבר קיים' });
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

router.put('/:slug', adminMiddleware, (req, res) => {
  const { title, content, season, category, cover_image } = req.body;
  const page = db.prepare('SELECT id FROM wiki_pages WHERE slug = ?').get(req.params.slug);
  if (!page) return res.status(404).json({ error: 'עמוד לא נמצא' });

  db.prepare(`
    UPDATE wiki_pages SET title=?, content=?, season=?, category=?, cover_image=?,
    updated_at=datetime('now') WHERE slug=?
  `).run(title, content, season || 0, category || 'general', cover_image || '', req.params.slug);
  res.json({ success: true });
});

router.delete('/:slug', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM wiki_pages WHERE slug = ?').run(req.params.slug);
  res.json({ success: true });
});

module.exports = router;
