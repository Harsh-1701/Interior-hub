const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/moodboards
router.get('/', (req, res) => {
  const { userId } = req.query;

  let query = `
    SELECT m.*, u.name as user_name, u.avatar as user_avatar
    FROM moodboards m
    JOIN users u ON m.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (userId) {
    query += ` AND (m.user_id = ? OR m.is_public = 1)`;
    params.push(userId);
  } else {
    query += ` AND m.is_public = 1`;
  }

  query += ` ORDER BY m.created_at DESC`;

  const rows = db.prepare(query).all(...params);

  const moodboards = rows.map(mb => {
    try { mb.palette = JSON.parse(mb.palette || '[]'); } catch (e) {}
    const items = db.prepare('SELECT * FROM moodboard_items WHERE moodboard_id = ? ORDER BY order_index ASC').all(mb.id);
    return {
      ...mb,
      items
    };
  });

  res.json({ moodboards });
});

// GET /api/moodboards/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const mb = db.prepare(`
    SELECT m.*, u.name as user_name, u.avatar as user_avatar
    FROM moodboards m
    JOIN users u ON m.user_id = u.id
    WHERE m.id = ?
  `).get(id);

  if (!mb) return res.status(404).json({ error: 'Moodboard not found' });

  try { mb.palette = JSON.parse(mb.palette || '[]'); } catch (e) {}
  mb.items = db.prepare('SELECT * FROM moodboard_items WHERE moodboard_id = ? ORDER BY order_index ASC').all(mb.id);

  res.json({ moodboard: mb });
});

// POST /api/moodboards - Create moodboard
router.post('/', (req, res) => {
  const { user_id, title, description, room_type, palette } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: 'User ID and title are required' });
  }

  const mbId = 'mb-' + Date.now();
  const defaultPalette = palette && palette.length > 0 ? palette : ['#EAE6E1', '#C6B7A6', '#877B6F', '#39342F'];

  db.prepare(`
    INSERT INTO moodboards (id, user_id, title, description, room_type, palette, is_public, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
  `).run(
    mbId,
    user_id,
    title,
    description || 'Custom interior curation and material palette',
    room_type || 'Living Room',
    JSON.stringify(defaultPalette)
  );

  res.status(201).json({ message: 'Moodboard created successfully', moodboardId: mbId });
});

// POST /api/moodboards/:id/items - Add item to moodboard
router.post('/:id/items', (req, res) => {
  const { id } = req.params;
  const { title, image_url, item_type, price, brand_or_source } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ error: 'Title and image URL are required' });
  }

  const itemId = 'mbi-' + Date.now();
  const count = db.prepare('SELECT COUNT(*) as count FROM moodboard_items WHERE moodboard_id = ?').get(id).count;

  db.prepare(`
    INSERT INTO moodboard_items (id, moodboard_id, title, image_url, item_type, price, brand_or_source, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    itemId,
    id,
    title,
    image_url,
    item_type || 'furniture',
    parseFloat(price) || 0,
    brand_or_source || 'Interior Hub Curation',
    count + 1
  );

  res.status(201).json({ message: 'Item pinned to moodboard', itemId });
});

// DELETE /api/moodboards/:id/items/:itemId - Remove item
router.delete('/:id/items/:itemId', (req, res) => {
  const { itemId } = req.params;
  db.prepare('DELETE FROM moodboard_items WHERE id = ?').run(itemId);
  res.json({ message: 'Item removed from moodboard' });
});

// DELETE /api/moodboards/:id - Delete moodboard
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM moodboards WHERE id = ?').run(id);
  res.json({ message: 'Moodboard deleted' });
});

module.exports = router;
