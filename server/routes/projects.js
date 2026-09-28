const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/projects - List projects with filters
router.get('/', (req, res) => {
  const { homeowner_id, designer_id, status, openInquiries } = req.query;

  let query = `
    SELECT p.*, 
           u.name as homeowner_name, u.avatar as homeowner_avatar, u.email as homeowner_email,
           d.studio_name, du.name as designer_name, du.avatar as designer_avatar
    FROM projects p
    JOIN users u ON p.homeowner_id = u.id
    LEFT JOIN designer_profiles d ON p.designer_id = d.id
    LEFT JOIN users du ON d.user_id = du.id
    WHERE 1=1
  `;
  const params = [];

  if (openInquiries === 'true' || openInquiries === '1') {
    query += ` AND (p.designer_id IS NULL OR p.status = 'Inquiry')`;
  } else {
    if (homeowner_id) {
      query += ` AND p.homeowner_id = ?`;
      params.push(homeowner_id);
    }
    if (designer_id) {
      // Check both designer profile ID or designer user_id
      query += ` AND (p.designer_id = ? OR d.user_id = ?)`;
      params.push(designer_id, designer_id);
    }
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
  }

  query += ` ORDER BY p.updated_at DESC`;

  const projects = db.prepare(query).all(...params);

  // Attach milestone summary and deliverable counts
  const enriched = projects.map(proj => {
    const milestones = db.prepare('SELECT * FROM project_milestones WHERE project_id = ? ORDER BY order_index ASC').all(proj.id);
    const deliverables = db.prepare('SELECT * FROM project_deliverables WHERE project_id = ?').all(proj.id);
    const proposals = db.prepare('SELECT * FROM proposals WHERE project_id = ?').all(proj.id);

    return {
      ...proj,
      milestones,
      deliverables,
      proposalsCount: proposals.length
    };
  });

  res.json({ projects: enriched });
});

// GET /api/projects/:id - Single Project Detail
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const project = db.prepare(`
    SELECT p.*, 
           u.name as homeowner_name, u.avatar as homeowner_avatar, u.email as homeowner_email, u.phone as homeowner_phone,
           d.studio_name, d.hourly_rate, du.name as designer_name, du.avatar as designer_avatar, du.email as designer_email
    FROM projects p
    JOIN users u ON p.homeowner_id = u.id
    LEFT JOIN designer_profiles d ON p.designer_id = d.id
    LEFT JOIN users du ON d.user_id = du.id
    WHERE p.id = ?
  `).get(id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const milestones = db.prepare('SELECT * FROM project_milestones WHERE project_id = ? ORDER BY order_index ASC').all(project.id);
  const deliverables = db.prepare('SELECT * FROM project_deliverables WHERE project_id = ? ORDER BY created_at DESC').all(project.id);
  const proposals = db.prepare(`
    SELECT pr.*, d.studio_name, u.name as designer_name, u.avatar as designer_avatar
    FROM proposals pr
    JOIN designer_profiles d ON pr.designer_id = d.id
    JOIN users u ON d.user_id = u.id
    WHERE pr.project_id = ?
    ORDER BY pr.created_at DESC
  `).all(project.id);

  const invoices = db.prepare('SELECT * FROM invoices WHERE project_id = ? ORDER BY created_at DESC').all(project.id);
  const formattedInvoices = invoices.map(inv => {
    try { inv.items = JSON.parse(inv.items || '[]'); } catch (e) {}
    return inv;
  });

  res.json({
    project: {
      ...project,
      milestones,
      deliverables,
      proposals,
      invoices: formattedInvoices
    }
  });
});

// POST /api/projects - Homeowner creates project
router.post('/', (req, res) => {
  const {
    homeowner_id, designer_id, title, room_type, style_preference,
    square_feet, budget, location, timeline, description, floor_plan_url
  } = req.body;

  if (!homeowner_id || !title || !room_type || !budget) {
    return res.status(400).json({ error: 'Title, room type, budget, and homeowner ID are required' });
  }

  const projId = 'proj-' + Date.now();
  const status = designer_id ? 'Concept Phase' : 'Inquiry';
  const progress = designer_id ? 20 : 10;

  db.prepare(`
    INSERT INTO projects (
      id, homeowner_id, designer_id, title, room_type, style_preference,
      square_feet, budget, spent, location, timeline, description,
      floor_plan_url, status, progress, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    projId,
    homeowner_id,
    designer_id || null,
    title,
    room_type,
    style_preference || 'Modern Minimalist',
    parseInt(square_feet) || 500,
    parseFloat(budget),
    location || 'New York, NY',
    timeline || '2-3 Months',
    description || '',
    floor_plan_url || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    status,
    progress
  );

  // Generate standard milestone roadmap
  const defaultMilestones = [
    { title: 'Phase 1: Project Scope & Space Planning', due: 'In 2 weeks', completed: 1, desc: 'Detailed measurements and initial 2D layout options.' },
    { title: 'Phase 2: Concept Moodboard & Palette Approval', due: 'In 4 weeks', completed: 0, desc: 'Color swatches, textures, and material boards.' },
    { title: 'Phase 3: 3D Visualization & Technical Details', due: 'In 6 weeks', completed: 0, desc: 'Photorealistic views and custom millwork specifications.' },
    { title: 'Phase 4: FF&E Procurement & Site Execution', due: 'In 10 weeks', completed: 0, desc: 'Purchasing items with trade discounts and coordinating contractor.' },
    { title: 'Phase 5: Final Styling & Project Handover', due: 'In 12 weeks', completed: 0, desc: 'On-site white glove styling, art hanging, and handover.' }
  ];

  const insertMilestone = db.prepare(`
    INSERT INTO project_milestones (id, project_id, title, due_date, completed, description, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  defaultMilestones.forEach((m, idx) => {
    insertMilestone.run('ms-' + Date.now() + '-' + idx, projId, m.title, m.due, m.completed, m.desc, idx + 1);
  });

  res.status(201).json({ message: 'Project created successfully', projectId: projId });
});

// PUT /api/projects/:id - Update project status or progress
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, progress, spent, designer_id } = req.body;

  const current = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Project not found' });

  const newStatus = status || current.status;
  const newProgress = progress !== undefined ? parseInt(progress) : current.progress;
  const newSpent = spent !== undefined ? parseFloat(spent) : current.spent;
  const newDesignerId = designer_id || current.designer_id;

  db.prepare(`
    UPDATE projects 
    SET status = ?, progress = ?, spent = ?, designer_id = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(newStatus, newProgress, newSpent, newDesignerId, id);

  res.json({ message: 'Project updated successfully' });
});

// POST /api/projects/:id/milestones - Add milestone
router.post('/:id/milestones', (req, res) => {
  const { id } = req.params;
  const { title, due_date, description, completed } = req.body;

  if (!title) return res.status(400).json({ error: 'Milestone title is required' });

  const msId = 'ms-' + Date.now();
  const count = db.prepare('SELECT COUNT(*) as count FROM project_milestones WHERE project_id = ?').get(id).count;

  db.prepare(`
    INSERT INTO project_milestones (id, project_id, title, due_date, completed, description, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(msId, id, title, due_date || 'TBD', completed ? 1 : 0, description || '', count + 1);

  res.status(201).json({ message: 'Milestone added', milestoneId: msId });
});

// PUT /api/projects/:id/milestones/:mId - Toggle milestone
router.put('/:id/milestones/:mId', (req, res) => {
  const { mId } = req.params;
  const { completed } = req.body;

  db.prepare('UPDATE project_milestones SET completed = ? WHERE id = ?').run(completed ? 1 : 0, mId);
  res.json({ message: 'Milestone status updated' });
});

// POST /api/projects/:id/deliverables - Designer uploads deliverable
router.post('/:id/deliverables', (req, res) => {
  const { id } = req.params;
  const { designer_id, title, category, file_url, preview_image, description } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  const delId = 'del-' + Date.now();
  const img = preview_image || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80';

  db.prepare(`
    INSERT INTO project_deliverables (id, project_id, designer_id, title, category, file_url, preview_image, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    delId,
    id,
    designer_id || 'des-1',
    title,
    category,
    file_url || '#download',
    img,
    description || ''
  );

  res.status(201).json({ message: 'Deliverable added successfully', deliverableId: delId });
});

module.exports = router;
