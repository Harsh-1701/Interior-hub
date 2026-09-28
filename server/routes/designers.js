const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/designers - List designers with rich filtering
router.get('/', (req, res) => {
  const { search, style, specialty, city, priceRange, minRating, verified } = req.query;

  let query = `
    SELECT d.*, u.name as designer_name, u.email, u.avatar, u.bio as user_bio
    FROM designer_profiles d
    JOIN users u ON d.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (d.studio_name LIKE ? OR u.name LIKE ? OR d.tagline LIKE ? OR d.location LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  if (city && city !== 'all') {
    query += ` AND d.location LIKE ?`;
    params.push(`%${city}%`);
  }

  if (priceRange && priceRange !== 'all') {
    query += ` AND d.price_range = ?`;
    params.push(priceRange);
  }

  if (minRating) {
    query += ` AND d.rating >= ?`;
    params.push(parseFloat(minRating));
  }

  if (verified === '1' || verified === 'true') {
    query += ` AND d.verified = 1`;
  }

  query += ` ORDER BY d.rating DESC, d.completed_projects DESC`;

  const rows = db.prepare(query).all(...params);

  const designers = rows.map(row => {
    let styles = [];
    let specialties = [];
    let awards = [];
    try { styles = JSON.parse(row.styles || '[]'); } catch (e) {}
    try { specialties = JSON.parse(row.specialties || '[]'); } catch (e) {}
    try { awards = JSON.parse(row.awards || '[]'); } catch (e) {}

    // Fetch sample portfolio images
    const portfolioSamples = db.prepare(`
      SELECT id, title, cover_image, category, style 
      FROM portfolio_items 
      WHERE designer_id = ? 
      ORDER BY featured DESC, created_at DESC 
      LIMIT 3
    `).all(row.id);

    return {
      ...row,
      styles,
      specialties,
      awards,
      portfolioSamples
    };
  }).filter(d => {
    if (style && style !== 'all') {
      return d.styles.some(s => s.toLowerCase().includes(style.toLowerCase()));
    }
    return true;
  });

  res.json({ designers });
});

// GET /api/designers/:id - Full Designer Detail
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const designer = db.prepare(`
    SELECT d.*, u.name as designer_name, u.email, u.avatar, u.phone, u.bio as user_bio
    FROM designer_profiles d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ? OR d.user_id = ?
  `).get(id, id);

  if (!designer) {
    return res.status(404).json({ error: 'Designer not found' });
  }

  try { designer.styles = JSON.parse(designer.styles || '[]'); } catch (e) {}
  try { designer.specialties = JSON.parse(designer.specialties || '[]'); } catch (e) {}
  try { designer.awards = JSON.parse(designer.awards || '[]'); } catch (e) {}

  // Fetch Packages
  const packages = db.prepare('SELECT * FROM pricing_packages WHERE designer_id = ? ORDER BY price ASC').all(designer.id);
  designer.packages = packages.map(pkg => {
    try { pkg.features = JSON.parse(pkg.features || '[]'); } catch (e) {}
    return pkg;
  });

  // Fetch Portfolio items
  const portfolio = db.prepare('SELECT * FROM portfolio_items WHERE designer_id = ? ORDER BY featured DESC, created_at DESC').all(designer.id);
  designer.portfolio = portfolio.map(item => {
    try { item.images = JSON.parse(item.images || '[]'); } catch (e) {}
    return item;
  });

  // Fetch Reviews
  const reviews = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
    FROM reviews r
    JOIN users u ON r.homeowner_id = u.id
    WHERE r.designer_id = ?
    ORDER BY r.created_at DESC
  `).all(designer.id);
  designer.reviews = reviews;

  res.json({ designer });
});

// POST /api/designers/:id/reviews - Submit review
router.post('/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { homeowner_id, rating, comment, project_title, room_type } = req.body;

  if (!homeowner_id || !rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const reviewId = 'rev-' + Date.now();
  db.prepare(`
    INSERT INTO reviews (id, designer_id, homeowner_id, project_title, rating, comment, room_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    reviewId,
    id,
    homeowner_id,
    project_title || 'Residential Interior Design',
    parseInt(rating),
    comment,
    room_type || 'Full Space'
  );

  // Recalculate average rating & review count for designer
  const stats = db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as count 
    FROM reviews 
    WHERE designer_id = ?
  `).get(id);

  if (stats) {
    db.prepare(`
      UPDATE designer_profiles 
      SET rating = ?, review_count = ? 
      WHERE id = ?
    `).run(
      Math.round(stats.avg_rating * 100) / 100,
      stats.count,
      id
    );
  }

  res.status(201).json({ message: 'Review submitted successfully', reviewId });
});

// POST /api/designers/:id/portfolio - Add project to portfolio
router.post('/:id/portfolio', (req, res) => {
  const { id } = req.params;
  const { title, category, style, budget, square_feet, location, cover_image, images, before_image, after_image, description } = req.body;

  if (!title || !category || !style || !cover_image) {
    return res.status(400).json({ error: 'Title, category, style, and cover image are required' });
  }

  const portId = 'port-' + Date.now();
  db.prepare(`
    INSERT INTO portfolio_items (
      id, designer_id, title, category, style, budget, square_feet, location,
      cover_image, images, before_image, after_image, description, featured, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
  `).run(
    portId,
    id,
    title,
    category,
    style,
    parseFloat(budget) || 0,
    parseInt(square_feet) || 0,
    location || '',
    cover_image,
    JSON.stringify(images || [cover_image]),
    before_image || null,
    after_image || cover_image,
    description || '',
  );

  // Increment completed projects
  db.prepare('UPDATE designer_profiles SET completed_projects = completed_projects + 1 WHERE id = ?').run(id);

  res.status(201).json({ message: 'Portfolio item added successfully', portId });
});

module.exports = router;
