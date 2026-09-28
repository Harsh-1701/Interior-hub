# Interior Hub — Full-Stack Architectural Interior Design Platform

An end-to-end, production-ready interior design platform connecting discerning homeowners with verified architectural interior designers. Includes full project management, photorealistic 3D deliverable workflows, milestone-based escrow invoicing, real-time messaging, direct consultation bookings, interactive aesthetic quiz, and renovation cost estimator.

---

## 🚀 Quickstart for VSCode

### 1. Extract and Open in VSCode
Open the unzipped `Interior-hub` folder in Visual Studio Code.

### 2. Install Dependencies
Open a terminal in VSCode (`Ctrl + \`` or `Cmd + \``) and run:
```bash
npm install
```

### 3. Run the Application
Start the full-stack server and application:
```bash
npm start
```
*(Or for hot-reloading development mode: `npm run dev`)*

### 4. Open in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 👥 Demo Accounts (1-Click Instant Login)

Interior Hub comes pre-loaded with realistic, rich interior design data. You can switch between roles and personas at any time using the **Floating Demo Role Switcher** at the bottom-left of the screen, or via the user profile dropdown:

1. **Sarah Jenkins (Homeowner Demo)**
   - **Email:** `sarah@interiorhub.demo` | **Password:** `password123`
   - **Active Projects:** Tribeca Penthouse Living & Dining Overhaul ($45k budget, 65% completed with 3D renders & floor plans), Brooklyn Brownstone Japandi Guest Suite ($22k).
   - **Features:** Track milestones, download 3D scenes & FF&E lists, pay invoices via escrow, book consultations, curate moodboards.

2. **Marcus Vance (Designer Pro Demo — Studio Vance NYC)**
   - **Email:** `marcus@interiorhub.demo` | **Password:** `password123`
   - **Features:** Manage active client projects, update phase workflows (Concept → 3D Modeling → Execution), upload deliverables (CAD floor plans, 3D daytime/evening renders, procurement schedules), review incoming leads, issue invoices, track $42k+ revenue.

3. **Elena Rostova (Designer Demo — Kanso Studio Japandi)**
   - **Email:** `elena@interiorhub.demo` | **Password:** `password123`
   - **Features:** Japandi and Scandinavian residential portfolio, manage consultations, submit project proposals.

*You can also register brand new accounts as either a Homeowner or an Interior Designer with custom credentials.*

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express.js REST API with CORS and Multer for file uploads.
- **Database:** SQLite with `better-sqlite3` and automatic schema initialization & seeding.
- **Serving:** Unified Express production server serving both `/api/*` endpoints and the optimized Vite React SPA on port 3000.

---

## 📁 Project Structure

```
Interior-hub/
├── README.md                      # Project setup & documentation
├── package.json                   # Scripts and dependencies
├── vite.config.js                 # Vite bundler configuration & proxy
├── tailwind.config.js             # Warm architectural interior color palette
├── postcss.config.js
├── index.html                     # HTML5 entry with Playfair Display & Plus Jakarta Sans
├── uploads/                       # Directory for uploaded CAD floor plans and files
├── server/
│   ├── db.js                      # SQLite database tables & foreign keys
│   ├── seed.js                    # Rich database seed data (Unsplash photography)
│   ├── server.js                  # Express API server & static file host
│   └── routes/
│       ├── auth.js                # Auth, demo logins, registration
│       ├── designers.js           # Designer directory, portfolio, reviews
│       ├── projects.js            # Homeowner & designer project workflows
│       ├── consultations.js       # Booking calendar & meeting links
│       ├── proposals.js           # Designer lead quoting & homeowner acceptance
│       ├── invoices.js            # Billing, line items & escrow milestone payments
│       ├── moodboards.js          # Studio moodboard curation & palette swatches
│       ├── messages.js            # Real-time chat threads & history
│       ├── gallery.js             # Curated room inspiration library
│       ├── quiz.js                # Aesthetic style evaluation engine
│       └── estimator.js           # Renovation budget calculator engine
└── src/
    ├── main.jsx                   # React root entry
    ├── App.jsx                    # Core application router & state manager
    ├── index.css                  # Global styles & Tailwind directives
    ├── context/
    │   ├── AuthContext.jsx        # User session & 1-click persona switching
    │   └── ToastContext.jsx       # Floating notifications
    ├── components/
    │   ├── Navbar.jsx             # Navigation bar with role badge & controls
    │   ├── Footer.jsx             # Brand footer, newsletter & links
    │   ├── RoleSwitcher.jsx       # Floating 1-click demo switcher
    │   ├── Modals/
    │   │   ├── BookConsultationModal.jsx
    │   │   ├── PostProjectModal.jsx
    │   │   ├── SendProposalModal.jsx
    │   │   ├── CreateInvoiceModal.jsx
    │   │   ├── AddPortfolioModal.jsx
    │   │   ├── AddMoodboardModal.jsx
    │   │   ├── RoomDetailModal.jsx
    │   │   └── LoginModal.jsx
    │   └── ui/
    │       ├── Button.jsx
    │       ├── Badge.jsx
    │       └── RatingStars.jsx
    ├── pages/
    │   ├── Home.jsx               # Landing page with hero, search, trending rooms
    │   ├── Explore.jsx            # Inspiration gallery with room & style filters
    │   ├── Designers.jsx          # Designer directory with filters
    │   ├── DesignerDetail.jsx     # Full designer profile, before/after, packages
    │   ├── StyleQuiz.jsx          # 5-step visual quiz & matching recommendations
    │   ├── CostEstimator.jsx      # Interactive room renovation cost estimator
    │   ├── HomeownerDashboard.jsx # Homeowner workspace (projects, deliverables, invoices)
    │   ├── DesignerDashboard.jsx  # Designer studio (leads, workflow, billing, portfolio)
    │   └── HowItWorks.jsx         # Platform guide, escrow guarantee & FAQs
    └── services/
        └── api.js                 # API client for backend communication
```

---

## 🎨 Key Features & Interactive Webpages

1. **Explore Inspiration Gallery (`/explore`)**
   - High-resolution spaces across Living Room, Kitchen, Bedroom, Bathroom, Dining Room, Home Office, Outdoor.
   - Filter by styles: Japandi, Modern Minimalist, Scandinavian, Luxury Contemporary, Mid-Century Modern, Bohemian Chic.
   - Lightbox modal displaying architectural description, color harmony swatches, materials used, dimensions, and direct "Save to Moodboard" action.

2. **Designer Directory & Profile Showcase (`/designers`, `/designer/:id`)**
   - Filter by specialty, price tier, minimum rating, and location.
   - Profile with before/after transformation slider, pricing packages, verified reviews, and design philosophy.
   - Direct booking of virtual calls or on-site space assessments.

3. **Style Quiz (`/style-quiz`)**
   - 5-step visual quiz diagnosing your architectural archetype.
   - Generates signature color palette swatches, recommended materials, styling commandments, and top matched designers.

4. **Renovation Cost Estimator (`/cost-estimator`)**
   - Interactive sliders for square footage (100–2,500+ sq ft), finish tiers (Standard, Premium, Luxury), and included scopes (Joinery, Furniture, Civil/Tile, Lighting, Wall finishes).
   - Generates itemized cost breakdowns and pre-fills project inquiries.

5. **Homeowner Command Center (`/homeowner-dashboard`)**
   - Track milestone progress with visual checklists.
   - Preview and download 3D renders, CAD floor plans, and FF&E procurement spreadsheets.
   - Review and pay designer invoices with held escrow release.
   - Interactive chat inbox with assigned designers.

6. **Designer Studio Workspace (`/designer-dashboard`)**
   - Advance projects through Concept → 3D Modeling → Material Selection → Execution → Completed.
   - Upload deliverables with preview images and descriptions.
   - Review incoming community project inquiries and submit custom proposals.
   - Manage portfolio projects and issue formal line-item invoices.

---

## 📜 License
MIT License. Free to use, modify, and build upon.
