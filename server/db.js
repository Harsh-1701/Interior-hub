const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'interior_hub.db');

let db;
try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
  db.pragma = (cmd) => {
    try { db.exec(`PRAGMA ${cmd};`); } catch (e) {}
  };
} catch (e) {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
}

// Enable foreign keys and WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('homeowner', 'designer')),
      avatar TEXT,
      phone TEXT,
      location TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS designer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      studio_name TEXT NOT NULL,
      tagline TEXT,
      years_experience INTEGER DEFAULT 5,
      rating REAL DEFAULT 4.9,
      review_count INTEGER DEFAULT 0,
      completed_projects INTEGER DEFAULT 0,
      hourly_rate REAL DEFAULT 120,
      price_range TEXT DEFAULT '$$$',
      styles TEXT DEFAULT '[]',
      specialties TEXT DEFAULT '[]',
      location TEXT,
      verified INTEGER DEFAULT 1,
      cover_image TEXT,
      about TEXT,
      design_philosophy TEXT,
      awards TEXT DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pricing_packages (
      id TEXT PRIMARY KEY,
      designer_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      duration TEXT,
      description TEXT,
      features TEXT DEFAULT '[]',
      popular INTEGER DEFAULT 0,
      FOREIGN KEY (designer_id) REFERENCES designer_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS portfolio_items (
      id TEXT PRIMARY KEY,
      designer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      style TEXT NOT NULL,
      budget REAL,
      square_feet INTEGER,
      location TEXT,
      cover_image TEXT NOT NULL,
      images TEXT DEFAULT '[]',
      before_image TEXT,
      after_image TEXT,
      description TEXT,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (designer_id) REFERENCES designer_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      homeowner_id TEXT NOT NULL,
      designer_id TEXT,
      title TEXT NOT NULL,
      room_type TEXT NOT NULL,
      style_preference TEXT,
      square_feet INTEGER,
      budget REAL NOT NULL,
      spent REAL DEFAULT 0,
      location TEXT,
      timeline TEXT,
      description TEXT,
      floor_plan_url TEXT,
      status TEXT DEFAULT 'Inquiry',
      progress INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      description TEXT,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_deliverables (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      designer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_url TEXT NOT NULL,
      preview_image TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      homeowner_id TEXT NOT NULL,
      designer_id TEXT NOT NULL,
      service_type TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      price REAL DEFAULT 0,
      status TEXT DEFAULT 'Confirmed',
      meeting_link TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      designer_id TEXT NOT NULL,
      homeowner_id TEXT NOT NULL,
      amount REAL NOT NULL,
      estimated_weeks INTEGER,
      scope_description TEXT,
      deliverables_summary TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL,
      project_id TEXT NOT NULL,
      designer_id TEXT NOT NULL,
      homeowner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      items TEXT DEFAULT '[]',
      paid_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS moodboards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      room_type TEXT,
      palette TEXT DEFAULT '[]',
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS moodboard_items (
      id TEXT PRIMARY KEY,
      moodboard_id TEXT NOT NULL,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      item_type TEXT DEFAULT 'furniture',
      price REAL,
      brand_or_source TEXT,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (moodboard_id) REFERENCES moodboards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      project_id TEXT,
      content TEXT NOT NULL,
      attachment_url TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      designer_id TEXT NOT NULL,
      homeowner_id TEXT NOT NULL,
      project_title TEXT,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      room_type TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (homeowner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      room_type TEXT NOT NULL,
      style TEXT NOT NULL,
      image_url TEXT NOT NULL,
      designer_id TEXT,
      designer_name TEXT,
      likes INTEGER DEFAULT 0,
      color_palette TEXT DEFAULT '[]',
      materials TEXT DEFAULT '[]',
      estimated_cost REAL,
      square_feet INTEGER,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

initDatabase();

module.exports = db;
