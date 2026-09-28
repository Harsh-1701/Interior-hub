const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/messages/conversations - List active chat conversations
router.get('/conversations', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'user-h1';

  // Find all distinct users that this user has messaged with
  const contactIds = db.prepare(`
    SELECT DISTINCT 
      CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as contact_id
    FROM messages
    WHERE sender_id = ? OR receiver_id = ?
  `).all(userId, userId, userId);

  const conversations = contactIds.map(c => {
    const contact = db.prepare(`
      SELECT u.id, u.name, u.avatar, u.role, d.studio_name
      FROM users u
      LEFT JOIN designer_profiles d ON u.id = d.user_id
      WHERE u.id = ?
    `).get(c.contact_id);

    if (!contact) return null;

    // Get latest message
    const lastMsg = db.prepare(`
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId, c.contact_id, c.contact_id, userId);

    // Get unread count
    const unread = db.prepare(`
      SELECT COUNT(*) as count FROM messages
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `).get(c.contact_id, userId);

    return {
      contact,
      lastMessage: lastMsg,
      unreadCount: unread ? unread.count : 0
    };
  }).filter(Boolean);

  res.json({ conversations });
});

// GET /api/messages/thread/:otherUserId - Get full message history
router.get('/thread/:otherUserId', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'user-h1';
  const { otherUserId } = req.params;

  const messages = db.prepare(`
    SELECT m.*, 
           su.name as sender_name, su.avatar as sender_avatar,
           ru.name as receiver_name, ru.avatar as receiver_avatar
    FROM messages m
    JOIN users su ON m.sender_id = su.id
    JOIN users ru ON m.receiver_id = ru.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
  `).all(userId, otherUserId, otherUserId, userId);

  // Mark unread messages as read
  db.prepare(`
    UPDATE messages 
    SET is_read = 1 
    WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
  `).run(otherUserId, userId);

  const otherUser = db.prepare(`
    SELECT u.id, u.name, u.avatar, u.role, d.studio_name
    FROM users u
    LEFT JOIN designer_profiles d ON u.id = d.user_id
    WHERE u.id = ?
  `).get(otherUserId);

  res.json({ messages, otherUser });
});

// POST /api/messages - Send message
router.post('/', (req, res) => {
  const { sender_id, receiver_id, content, project_id, attachment_url } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: 'Sender, receiver, and message content are required' });
  }

  const msgId = 'msg-' + Date.now();

  db.prepare(`
    INSERT INTO messages (id, sender_id, receiver_id, project_id, content, attachment_url, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
  `).run(
    msgId,
    sender_id,
    receiver_id,
    project_id || null,
    content,
    attachment_url || null
  );

  const message = db.prepare(`
    SELECT m.*, su.name as sender_name, su.avatar as sender_avatar
    FROM messages m
    JOIN users su ON m.sender_id = su.id
    WHERE m.id = ?
  `).get(msgId);

  res.status(201).json({ message });
});

module.exports = router;
