const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/proposals
router.get('/', (req, res) => {
  const { project_id, designer_id, homeowner_id } = req.query;

  let query = `
    SELECT pr.*, 
           p.title as project_title, p.room_type, p.budget as project_budget,
           d.studio_name, du.name as designer_name, du.avatar as designer_avatar,
           hu.name as homeowner_name, hu.avatar as homeowner_avatar
    FROM proposals pr
    JOIN projects p ON pr.project_id = p.id
    JOIN designer_profiles d ON pr.designer_id = d.id
    JOIN users du ON d.user_id = du.id
    JOIN users hu ON pr.homeowner_id = hu.id
    WHERE 1=1
  `;
  const params = [];

  if (project_id) {
    query += ` AND pr.project_id = ?`;
    params.push(project_id);
  }
  if (designer_id) {
    query += ` AND (pr.designer_id = ? OR d.user_id = ?)`;
    params.push(designer_id, designer_id);
  }
  if (homeowner_id) {
    query += ` AND pr.homeowner_id = ?`;
    params.push(homeowner_id);
  }

  query += ` ORDER BY pr.created_at DESC`;

  const proposals = db.prepare(query).all(...params);
  res.json({ proposals });
});

// POST /api/proposals - Designer submits proposal
router.post('/', (req, res) => {
  const { project_id, designer_id, amount, estimated_weeks, scope_description, deliverables_summary } = req.body;

  if (!project_id || !designer_id || !amount) {
    return res.status(400).json({ error: 'Project ID, designer ID, and amount are required' });
  }

  const project = db.prepare('SELECT homeowner_id FROM projects WHERE id = ?').get(project_id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Resolve designer profile ID
  let resolvedDesId = designer_id;
  const dProf = db.prepare('SELECT id FROM designer_profiles WHERE id = ? OR user_id = ?').get(designer_id, designer_id);
  if (dProf) resolvedDesId = dProf.id;

  const propId = 'prop-' + Date.now();

  db.prepare(`
    INSERT INTO proposals (
      id, project_id, designer_id, homeowner_id, amount, estimated_weeks,
      scope_description, deliverables_summary, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', datetime('now'))
  `).run(
    propId,
    project_id,
    resolvedDesId,
    project.homeowner_id,
    parseFloat(amount),
    parseInt(estimated_weeks) || 4,
    scope_description || 'Custom tailored interior design package',
    deliverables_summary || '2D Layouts, 3D Renders, Material Moodboard, FF&E Schedule'
  );

  // Update project status to 'Proposal Received' if still in 'Inquiry'
  db.prepare(`
    UPDATE projects 
    SET status = 'Proposal Received', updated_at = datetime('now')
    WHERE id = ? AND status = 'Inquiry'
  `).run(project_id);

  res.status(201).json({ message: 'Proposal submitted successfully', proposalId: propId });
});

// PUT /api/proposals/:id/accept - Homeowner accepts proposal
router.put('/:id/accept', (req, res) => {
  const { id } = req.params;

  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

  // Mark this proposal as accepted
  db.prepare("UPDATE proposals SET status = 'Accepted' WHERE id = ?").run(id);

  // Mark any other proposals for this project as declined
  db.prepare("UPDATE proposals SET status = 'Declined' WHERE project_id = ? AND id != ?").run(proposal.project_id, id);

  // Update project with designer and set to 'Concept Phase'
  db.prepare(`
    UPDATE projects 
    SET designer_id = ?, status = 'Concept Phase', progress = 25, updated_at = datetime('now')
    WHERE id = ?
  `).run(proposal.designer_id, proposal.project_id);

  // Automatically generate Phase 1 Retainer Invoice
  const invId = 'inv-' + Date.now();
  const invNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
  const retainerAmount = Math.round(proposal.amount * 0.4); // 40% initial retainer

  db.prepare(`
    INSERT INTO invoices (
      id, invoice_number, project_id, designer_id, homeowner_id, title,
      amount, due_date, status, items, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, date('now', '+14 days'), 'Pending', ?, datetime('now'))
  `).run(
    invId,
    invNumber,
    proposal.project_id,
    proposal.designer_id,
    proposal.homeowner_id,
    'Phase 1 Design Retainer & Concept Launch',
    retainerAmount,
    JSON.stringify([
      { desc: 'Initial Space Planning & Concept Discovery', amount: Math.round(retainerAmount * 0.5) },
      { desc: 'Material Swatches & 3D Architectural Prep', amount: Math.round(retainerAmount * 0.5) }
    ])
  );

  res.json({ message: 'Proposal accepted! Project is now active with Phase 1 retainer generated.', proposalId: id });
});

// PUT /api/proposals/:id/decline
router.put('/:id/decline', (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE proposals SET status = 'Declined' WHERE id = ?").run(id);
  res.json({ message: 'Proposal declined' });
});

module.exports = router;
