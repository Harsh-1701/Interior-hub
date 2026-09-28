const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to get full user object with designer profile if applicable
function getUserWithProfile(userId) {
  const user = db.prepare('SELECT id, name, email, role, avatar, phone, location, bio, created_at FROM users WHERE id = ?').get(userId);
  if (!user) return null;
  
  if (user.role === 'designer') {
    const profile = db.prepare('SELECT * FROM designer_profiles WHERE user_id = ?').get(user.id);
    if (profile) {
      try {
        profile.styles = JSON.parse(profile.styles || '[]');
        profile.specialties = JSON.parse(profile.specialties || '[]');
        profile.awards = JSON.parse(profile.awards || '[]');
      } catch (e) {}
      user.designerProfile = profile;
    }
  }
  return user;
}

// GET /api/auth/me
router.get('/me', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'user-h1';
  const user = getUserWithProfile(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// GET /api/auth/users (list all demo users)
router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.avatar, u.location,
           d.studio_name, d.id as designer_id
    FROM users u
    LEFT JOIN designer_profiles d ON u.id = d.user_id
    ORDER BY u.role DESC, u.name ASC
  `).all();
  res.json({ users });
});

// POST /api/auth/demo-login
router.post('/demo-login', (req, res) => {
  const { userId } = req.body;
  const targetId = userId || 'user-h1';
  const user = getUserWithProfile(targetId);
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }
  res.json({ user, message: `Switched to ${user.name} (${user.role})` });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const fullUser = getUserWithProfile(user.id);
  res.json({ user: fullUser, message: 'Logged in successfully' });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, studio_name, location, phone, bio } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const userId = 'user-' + Date.now();
  const avatar = role === 'designer' 
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, avatar, phone, location, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    name,
    email.toLowerCase().trim(),
    password,
    role,
    avatar,
    phone || '+1 (555) 000-0000',
    location || 'New York, NY',
    bio || (role === 'designer' ? 'Passionate interior designer creating beautiful bespoke living environments.' : 'Homeowner looking forward to creating my dream home.')
  );

  if (role === 'designer') {
    const desId = 'des-' + Date.now();
    db.prepare(`
      INSERT INTO designer_profiles (
        id, user_id, studio_name, tagline, years_experience, rating, review_count,
        completed_projects, hourly_rate, price_range, styles, specialties,
        location, verified, cover_image, about, design_philosophy, awards
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      desId,
      userId,
      studio_name || `${name} Design Studio`,
      'Thoughtful interior design and spatial architecture',
      3,
      5.0,
      0,
      0,
      120,
      '$$$',
      JSON.stringify(['Modern Minimalist', 'Japandi']),
      JSON.stringify(['Residential Renovation', '3D Visualizations']),
      location || 'New York, NY',
      1,
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'Full service interior design studio committed to crafting beautiful, functional living environments tailored to client lifestyle.',
      'Design should blend comfort, material integrity, and spatial elegance.',
      JSON.stringify([])
    );
  }

  const fullUser = getUserWithProfile(userId);
  res.status(201).json({ user: fullUser, message: 'Account registered successfully' });
});

module.exports = router;
