const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/gallery
router.get('/', (req, res) => {
  const { room_type, style, search } = req.query;

  let query = 'SELECT * FROM gallery_items WHERE 1=1';
  const params = [];

  if (room_type && room_type !== 'All') {
    query += ' AND room_type = ?';
    params.push(room_type);
  }

  if (style && style !== 'All') {
    query += ' AND style = ?';
    params.push(style);
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR designer_name LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY likes DESC, id ASC';

  const rows = db.prepare(query).all(...params);

  const gallery = rows.map(item => {
    try { item.color_palette = JSON.parse(item.color_palette || '[]'); } catch (e) {}
    try { item.materials = JSON.parse(item.materials || '[]'); } catch (e) {}
    return item;
  });

  res.json({ gallery });
});

// GET /api/gallery/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM gallery_items WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Gallery item not found' });

  try { item.color_palette = JSON.parse(item.color_palette || '[]'); } catch (e) {}
  try { item.materials = JSON.parse(item.materials || '[]'); } catch (e) {}

  res.json({ item });
});

// POST /api/gallery/:id/like
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  db.prepare('UPDATE gallery_items SET likes = likes + 1 WHERE id = ?').run(id);
  const updated = db.prepare('SELECT likes FROM gallery_items WHERE id = ?').get(id);

  if (userId) {
    const existing = db.prepare('SELECT id FROM saved_items WHERE user_id = ? AND item_id = ?').get(userId, id);
    if (!existing) {
      db.prepare(`
        INSERT INTO saved_items (id, user_id, item_id, item_type, created_at)
        VALUES (?, ?, ?, 'gallery', datetime('now'))
      `).run('save-' + Date.now(), userId, id);
    }
  }

  res.json({ likes: updated.likes, message: 'Liked successfully!' });
});

module.exports = router;
