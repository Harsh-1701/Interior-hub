const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/invoices
router.get('/', (req, res) => {
  const { userId, role, projectId } = req.query;

  let query = `
    SELECT i.*, 
           p.title as project_title, p.room_type,
           d.studio_name, du.name as designer_name, du.email as designer_email,
           hu.name as homeowner_name, hu.email as homeowner_email
    FROM invoices i
    JOIN projects p ON i.project_id = p.id
    JOIN designer_profiles d ON i.designer_id = d.id
    JOIN users du ON d.user_id = du.id
    JOIN users hu ON i.homeowner_id = hu.id
    WHERE 1=1
  `;
  const params = [];

  if (projectId) {
    query += ` AND i.project_id = ?`;
    params.push(projectId);
  }

  if (userId) {
    if (role === 'designer') {
      query += ` AND (i.designer_id = ? OR d.user_id = ?)`;
      params.push(userId, userId);
    } else {
      query += ` AND i.homeowner_id = ?`;
      params.push(userId);
    }
  }

  query += ` ORDER BY i.created_at DESC`;

  const rows = db.prepare(query).all(...params);

  const invoices = rows.map(inv => {
    try { inv.items = JSON.parse(inv.items || '[]'); } catch (e) {}
    return inv;
  });

  res.json({ invoices });
});

// POST /api/invoices - Designer creates invoice
router.post('/', (req, res) => {
  const { project_id, designer_id, homeowner_id, title, amount, due_date, items } = req.body;

  if (!project_id || !designer_id || !title || !amount) {
    return res.status(400).json({ error: 'Project, designer, title, and amount are required' });
  }

  // Resolve designer profile
  let resolvedDesId = designer_id;
  const dProf = db.prepare('SELECT id FROM designer_profiles WHERE id = ? OR user_id = ?').get(designer_id, designer_id);
  if (dProf) resolvedDesId = dProf.id;

  // Resolve homeowner ID from project if not passed
  let resolvedHomeownerId = homeowner_id;
  if (!resolvedHomeownerId) {
    const proj = db.prepare('SELECT homeowner_id FROM projects WHERE id = ?').get(project_id);
    if (proj) resolvedHomeownerId = proj.homeowner_id;
  }

  const invId = 'inv-' + Date.now();
  const invNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

  db.prepare(`
    INSERT INTO invoices (
      id, invoice_number, project_id, designer_id, homeowner_id, title,
      amount, due_date, status, items, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, datetime('now'))
  `).run(
    invId,
    invNumber,
    project_id,
    resolvedDesId,
    resolvedHomeownerId,
    title,
    parseFloat(amount),
    due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    JSON.stringify(items || [{ desc: title, amount: parseFloat(amount) }])
  );

  res.status(201).json({ message: 'Invoice created successfully', invoiceId: invId, invoiceNumber: invNumber });
});

// PUT /api/invoices/:id/pay - Pay invoice
router.put('/:id/pay', (req, res) => {
  const { id } = req.params;

  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  db.prepare(`
    UPDATE invoices 
    SET status = 'Paid', paid_at = datetime('now')
    WHERE id = ?
  `).run(id);

  // Update spent amount in the project
  db.prepare(`
    UPDATE projects 
    SET spent = spent + ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(invoice.amount, invoice.project_id);

  res.json({ message: 'Invoice paid successfully!' });
});

module.exports = router;
