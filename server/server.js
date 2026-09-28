const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure database is initialized and seeded if empty
const db = require('./db');
const seed = require('./seed');

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  seed();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure uploads folder exists
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer config for mock / local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

// File upload API route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/designers', require('./routes/designers'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/moodboards', require('./routes/moodboards'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/estimator', require('./routes/estimator'));

// Database health check & reset endpoint for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/reset-db', (req, res) => {
  seed();
  res.json({ message: 'Database refreshed with pristine seed data!' });
});

// Serve frontend build if dist folder exists
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Interior Hub Full-Stack Server running at http://0.0.0.0:${PORT}`);
});
