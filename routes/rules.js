const express = require('express');
const { db } = require('../database');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const rules = db.prepare('SELECT * FROM rules ORDER BY season ASC, order_num ASC').all();
  const grouped = {};
  for (const rule of rules) {
    const key = rule.season;
    if (!grouped[key]) grouped[key] = { season: rule.season, season_name: rule.season_name, rules: [] };
    grouped[key].rules.push(rule);
  }
  res.json(Object.values(grouped));
});

router.post('/', adminMiddleware, (req, res) => {
  const { season, season_name, title, content, order_num } = req.body;
  if (!season_name || !title || !content) return res.status(400).json({ error: 'שדות חסרים' });
  const result = db.prepare('INSERT INTO rules (season, season_name, title, content, order_num) VALUES (?, ?, ?, ?, ?)').run(
    season || 0, season_name, title, content, order_num || 0
  );
  res.json({ id: result.lastInsertRowid, success: true });
});

router.put('/:id', adminMiddleware, (req, res) => {
  const { title, content, order_num } = req.body;
  db.prepare('UPDATE rules SET title=?, content=?, order_num=? WHERE id=?').run(title, content, order_num || 0, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM rules WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
