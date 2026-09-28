const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/consultations
router.get('/', (req, res) => {
  const { userId, role } = req.query;

  let query = `
    SELECT c.*,
           hu.name as homeowner_name, hu.avatar as homeowner_avatar, hu.email as homeowner_email, hu.phone as homeowner_phone,
           d.studio_name, du.name as designer_name, du.avatar as designer_avatar, du.email as designer_email
    FROM consultations c
    JOIN users hu ON c.homeowner_id = hu.id
    JOIN designer_profiles d ON c.designer_id = d.id
    JOIN users du ON d.user_id = du.id
    WHERE 1=1
  `;
  const params = [];

  if (userId) {
    if (role === 'designer') {
      query += ` AND (c.designer_id = ? OR d.user_id = ?)`;
      params.push(userId, userId);
    } else {
      query += ` AND c.homeowner_id = ?`;
      params.push(userId);
    }
  }

  query += ` ORDER BY c.date ASC, c.time ASC`;

  const consultations = db.prepare(query).all(...params);
  res.json({ consultations });
});

// POST /api/consultations - Book new consultation
router.post('/', (req, res) => {
  const { homeowner_id, designer_id, service_type, date, time, price, notes } = req.body;

  if (!homeowner_id || !designer_id || !date || !time) {
    return res.status(400).json({ error: 'Homeowner, designer, date, and time are required' });
  }

  // Find designer profile id if user_id was passed
  let resolvedDesignerId = designer_id;
  const dProfile = db.prepare('SELECT id FROM designer_profiles WHERE id = ? OR user_id = ?').get(designer_id, designer_id);
  if (dProfile) {
    resolvedDesignerId = dProfile.id;
  }

  const conId = 'con-' + Date.now();
  const meetingLink = `https://meet.interiorhub.demo/session-${Math.floor(100000 + Math.random() * 900000)}`;

  db.prepare(`
    INSERT INTO consultations (
      id, homeowner_id, designer_id, service_type, date, time, price, status, meeting_link, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, ?, datetime('now'))
  `).run(
    conId,
    homeowner_id,
    resolvedDesignerId,
    service_type || 'Virtual Video Call (45m)',
    date,
    time,
    parseFloat(price) || 150,
    meetingLink,
    notes || 'Initial consultation and space overview'
  );

  // Send an automatic confirmation message in the chat
  const msgId = 'msg-' + Date.now();
  const dUser = db.prepare('SELECT user_id FROM designer_profiles WHERE id = ?').get(resolvedDesignerId);
  if (dUser) {
    db.prepare(`
      INSERT INTO messages (id, sender_id, receiver_id, content, is_read, created_at)
      VALUES (?, ?, ?, ?, 1, datetime('now'))
    `).run(
      msgId,
      dUser.user_id,
      homeowner_id,
      `Hello! Thank you for booking a ${service_type || 'consultation'} on ${date} at ${time}. I am looking forward to discussing your project! Feel free to share any inspiration photos or questions here in advance.`
    );
  }

  res.status(201).json({
    message: 'Consultation booked successfully!',
    consultationId: conId,
    meetingLink
  });
});

// PUT /api/consultations/:id - Update status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  db.prepare('UPDATE consultations SET status = ? WHERE id = ?').run(status, id);
  res.json({ message: 'Consultation status updated to ' + status });
});

module.exports = router;
