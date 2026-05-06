const express = require('express');
const { db } = require('../database');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Search across forums, wiki, and events
router.get('/', optionalAuth, (req, res) => {
  const { q, type = 'all', page = 1, limit = 20 } = req.query;
  if (!q || q.length < 2) return res.json({ results: [], total: 0 });

  const offset = (page - 1) * limit;
  const searchTerm = `%${q}%`;
  let results = [];

  try {
    if (type === 'all' || type === 'forums') {
      // Search threads
      const threads = db.prepare(`
        SELECT 'thread' as type, ft.id, ft.title, ft.content, ft.created_at,
               u.username, fc.name as category_name, fc.id as category_id
        FROM forum_threads ft
        JOIN users u ON u.id = ft.user_id
        JOIN forum_categories fc ON fc.id = ft.category_id
        WHERE ft.title LIKE ? OR ft.content LIKE ?
        ORDER BY ft.created_at DESC
        LIMIT ?
      `).all(searchTerm, searchTerm, limit);

      // Search posts
      const posts = db.prepare(`
        SELECT 'post' as type, fp.id, ft.title as thread_title, fp.content, fp.created_at,
               u.username, fc.name as category_name, ft.id as thread_id
        FROM forum_posts fp
        JOIN forum_threads ft ON ft.id = fp.thread_id
        JOIN users u ON u.id = fp.user_id
        JOIN forum_categories fc ON fc.id = ft.category_id
        WHERE fp.content LIKE ?
        ORDER BY fp.created_at DESC
        LIMIT ?
      `).all(searchTerm, limit);

      results.push(...threads.map(t => ({ ...t, url: `/thread?id=${t.id}` })));
      results.push(...posts.map(p => ({ ...p, url: `/thread?id=${p.thread_id}` })));
    }

    if (type === 'all' || type === 'wiki') {
      // Search wiki pages
      const wiki = db.prepare(`
        SELECT 'wiki' as type, id, title, content, slug, season, category, updated_at as created_at, updated_at,
               (SELECT username FROM users WHERE id = created_by) as author
        FROM wiki_pages
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY updated_at DESC
        LIMIT ?
      `).all(searchTerm, searchTerm, limit);

      results.push(...wiki.map(w => ({ ...w, url: `/wiki?page=${w.slug}` })));
    }

    if (type === 'all' || type === 'events') {
      // Search events
      const events = db.prepare(`
        SELECT 'event' as type, id, title, description, event_date, location, created_at,
               (SELECT username FROM users WHERE id = created_by) as creator
        FROM events
        WHERE title LIKE ? OR description LIKE ?
        ORDER BY event_date DESC
        LIMIT ?
      `).all(searchTerm, searchTerm, limit);

      results.push(...events.map(e => ({ ...e, url: `/events` })));
    }

    // Sort all results by date and limit
    results.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || '1970-01-01');
      const dateB = new Date(b.created_at || b.updated_at || '1970-01-01');
      return dateB - dateA;
    });
    results = results.slice(0, limit);

    res.json({ results, total: results.length, query: q, type });
  } catch (e) {
    console.error('Search error:', e);
    res.status(500).json({ error: 'שגיאת חיפוש' });
  }
});

module.exports = router;