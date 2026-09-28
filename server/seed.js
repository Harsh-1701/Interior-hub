const db = require('./db');

function seed() {
  console.log('Seeding Interior Hub database...');

  // Check if data already exists
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('Database already seeded, clearing existing records for fresh state...');
    db.exec(`
      DELETE FROM saved_items;
      DELETE FROM gallery_items;
      DELETE FROM reviews;
      DELETE FROM messages;
      DELETE FROM moodboard_items;
      DELETE FROM moodboards;
      DELETE FROM invoices;
      DELETE FROM proposals;
      DELETE FROM consultations;
      DELETE FROM project_deliverables;
      DELETE FROM project_milestones;
      DELETE FROM projects;
      DELETE FROM portfolio_items;
      DELETE FROM pricing_packages;
      DELETE FROM designer_profiles;
      DELETE FROM users;
    `);
  }

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, avatar, phone, location, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Homeowner 1 (Primary Demo)
  insertUser.run(
    'user-h1',
    'Sarah Jenkins',
    'sarah@interiorhub.demo',
    'password123',
    'homeowner',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    '+1 (555) 234-8901',
    'Manhattan, New York',
    'Design enthusiast renovating a pre-war loft in Tribeca. Loving warm minimalism, natural textures, and smart storage.'
  );

  // Homeowner 2
  insertUser.run(
    'user-h2',
    'David Miller',
    'david@interiorhub.demo',
    'password123',
    'homeowner',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    '+1 (555) 489-3321',
    'San Francisco, CA',
    'Tech founder seeking a serene, functional Japandi-inspired townhouse living room and home office.'
  );

  // Designer 1 (Primary Designer Demo)
  insertUser.run(
    'user-d1',
    'Marcus Vance',
    'marcus@interiorhub.demo',
    'password123',
    'designer',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    '+1 (555) 782-9912',
    'New York, NY',
    'Founder of Studio Vance. 12+ years delivering timeless, high-end residential interiors and architectural renovations.'
  );

  // Designer 2 (Elena Rostova)
  insertUser.run(
    'user-d2',
    'Elena Rostova',
    'elena@interiorhub.demo',
    'password123',
    'designer',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    '+1 (555) 349-1120',
    'Brooklyn, NY',
    'Principal at Kanso Studio. Specializing in warm Japandi aesthetics, wabi-sabi balance, and bespoke sustainable millwork.'
  );

  // Designer 3 (Julian Thorne)
  insertUser.run(
    'user-d3',
    'Julian Thorne',
    'julian@interiorhub.demo',
    'password123',
    'designer',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    '+1 (555) 901-4478',
    'Austin, TX',
    'Eclectic & Mid-Century Modern interior architect crafting vibrant, lived-in sanctuaries with bold textures.'
  );

  // Designer 4 (Sophia Chen)
  insertUser.run(
    'user-d4',
    'Sophia Chen',
    'sophia@interiorhub.demo',
    'password123',
    'designer',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    '+1 (555) 672-8833',
    'Seattle, WA',
    'Contemporary minimalist interior architect focused on light-filled spaces and biophilic living.'
  );

  // 2. Designer Profiles
  const insertDesigner = db.prepare(`
    INSERT INTO designer_profiles (
      id, user_id, studio_name, tagline, years_experience, rating, review_count,
      completed_projects, hourly_rate, price_range, styles, specialties,
      location, verified, cover_image, about, design_philosophy, awards
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDesigner.run(
    'des-1',
    'user-d1',
    'Studio Vance Architecture & Interiors',
    'Tailored luxury residential spaces with timeless architectural balance',
    12,
    4.96,
    52,
    68,
    160,
    '$$$$',
    JSON.stringify(['Modern Minimalist', 'Luxury Contemporary', 'Industrial Loft']),
    JSON.stringify(['Penthouse Renovations', 'Custom Joinery & Millwork', 'High-End 3D Visualization', 'Full Turnkey']),
    'New York, NY',
    1,
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    'Studio Vance is a full-service interior architecture practice based in Manhattan. We transform luxury apartments, townhouses, and country residences into tranquil, cohesive environments. Every project is anchored by bespoke spatial planning, meticulous material selection, and enduring craftsmanship.',
    'We believe luxury is not ornamentation, but the quiet harmony between proportion, light, and tactile materials that patina gracefully over time.',
    JSON.stringify(['Architectural Digest AD100 Rising Star 2024', 'Luxe RED Award Winner for Residential Interior', 'Interior Design Magazine Best of Year Honoree'])
  );

  insertDesigner.run(
    'des-2',
    'user-d2',
    'Kanso Studio Interiors',
    'Harmonious Japandi & Scandinavian spaces rooted in natural materials',
    9,
    4.98,
    64,
    91,
    130,
    '$$$',
    JSON.stringify(['Japandi', 'Scandinavian', 'Modern Minimalist', 'Wabi-Sabi']),
    JSON.stringify(['Living Room Restyling', 'Kitchen & Pantry Architecture', 'Organic Materials Curation', 'Custom Storage']),
    'Brooklyn, NY',
    1,
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    'Elena Rostova established Kanso Studio to bridge Japanese minimalism and Scandinavian warmth. Drawing upon natural timber, limewash plaster, fluted glass, and earth-toned textiles, her spaces nurture calm and intentional daily rituals.',
    'Simplicity is the ultimate sophistication. When you strip away visual clutter, the natural texture of oak, stone, and morning daylight becomes the art itself.',
    JSON.stringify(['Dwell Magazine Featured Living Space 2025', 'Dezeen Awards Longlist: Sustainable Interior', 'NYC Design Week Best Residential Studio'])
  );

  insertDesigner.run(
    'des-3',
    'user-d3',
    'Thorne Modern Design',
    'Mid-century soul meets contemporary comfort and layered textures',
    8,
    4.89,
    38,
    45,
    115,
    '$$',
    JSON.stringify(['Mid-Century Modern', 'Bohemian Chic', 'Industrial Loft']),
    JSON.stringify(['Color Palette Strategy', 'Vintage & Antique Sourcing', 'Open-Plan Conversions', 'Lighting Design']),
    'Austin, TX',
    1,
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'Julian Thorne brings an energetic yet grounded sensibility to residential design. His work celebrates tactile contrast: rich walnut, hand-glazed zellige tiles, woven leather, and iconic 20th-century silhouettes.',
    'A home should tell the story of who you are and be a collection of what you love. No two homes should ever feel identical.',
    JSON.stringify(['Austin Chronicle Best Interior Designer', 'Apartment Therapy Annual Design Showcase'])
  );

  insertDesigner.run(
    'des-4',
    'user-d4',
    'Chen Architectural Interiors',
    'Light-filled serene spaces with biophilic elements and sustainable crafts',
    10,
    4.93,
    46,
    58,
    145,
    '$$$',
    JSON.stringify(['Modern Minimalist', 'Japandi', 'Luxury Contemporary']),
    JSON.stringify(['Full House Architecture', 'Biophilic Design', 'Custom Kitchens', 'Smart Lighting Plans']),
    'Seattle, WA',
    1,
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'Sophia Chen blends Pacific Northwest materiality with serene minimalist precision. Her studio crafts intuitive living environments where indoor spaces seamlessly connect to natural surroundings.',
    'Architecture and interior design should work in silent unison with the climate, daylight, and surrounding landscape.',
    JSON.stringify(['Pacific Northwest Interior Design Excellence Award', 'Green Building & Sustainable Design Trophy'])
  );

  // 3. Pricing Packages
  const insertPackage = db.prepare(`
    INSERT INTO pricing_packages (id, designer_id, name, price, duration, description, features, popular)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Marcus Vance packages
  insertPackage.run(
    'pkg-1',
    'des-1',
    'Design Consultation & Conceptual Plan',
    450,
    '1-2 Weeks',
    'Ideal for homeowners wanting expert direction, space planning ideas, and a cohesive material vision.',
    JSON.stringify([
      '90-min comprehensive video or in-person walk-through',
      'Detailed 2D furniture spatial floor plan',
      'Curated concept moodboard & color palette',
      'Estimated budget allocation roadmap',
      '1 revision round included'
    ]),
    0
  );

  insertPackage.run(
    'pkg-2',
    'des-1',
    'Single Room Full Transformation',
    3200,
    '3-4 Weeks',
    'Complete bespoke design for one primary space (Living, Master Suite, or Open-Concept Kitchen).',
    JSON.stringify([
      'Everything in Consultation Plan',
      'Photorealistic 3D Renders (Day & Evening lighting)',
      'Custom Millwork & Joinery technical drawings',
      'Complete FF&E Shopping Schedule with trade discount access',
      'Sample material box mailed to your door',
      '3 rounds of 3D revisions'
    ]),
    1
  );

  insertPackage.run(
    'pkg-3',
    'des-1',
    'Full Home Turnkey Interior Architecture',
    12500,
    '8-12 Weeks',
    'End-to-end luxury transformation for your entire apartment, loft, or multi-story house.',
    JSON.stringify([
      'All rooms comprehensive 3D architectural renders',
      'Permit-ready demolition & construction drawings',
      'Full contractor bid package & site visits',
      'Custom bespoke furniture design & fabrication specs',
      'Complete procurement, white-glove delivery & final styling day'
    ]),
    0
  );

  // Elena Rostova packages
  insertPackage.run(
    'pkg-4',
    'des-2',
    'Japandi Discovery & Color Consultation',
    300,
    '1 Week',
    'A focused session to map out color, timber tones, textures, and lighting balance.',
    JSON.stringify([
      '60-min in-depth virtual design session',
      'Digital moodboard with exact paint & wood stain codes',
      'Initial layout recommendation sketch',
      'Curated shopping list of 10 staple pieces'
    ]),
    0
  );

  insertPackage.run(
    'pkg-5',
    'des-2',
    'Warm Sanctuary Room Design',
    2600,
    '3-4 Weeks',
    'Holistic transformation focusing on organic materials, bespoke storage, and calming acoustics.',
    JSON.stringify([
      'Detailed 2D scale layout with clearances',
      'High-fidelity 3D renderings from 3 angles',
      'Textile & finishes sample board',
      'Direct furniture buying links with designer trade discounts',
      'Unlimited messaging for 30 days during execution'
    ]),
    1
  );

  insertPackage.run(
    'pkg-6',
    'des-2',
    'Whole Home Japandi Architecture',
    8900,
    '6-10 Weeks',
    'Cohesive organic tranquility spanning living, kitchen, bedrooms, and bathrooms.',
    JSON.stringify([
      'Complete home schematic & spatial overhaul',
      'Full 3D visualization for all key spaces',
      'Custom kitchen & wardrobe joinery details',
      'Biophilic indoor plant & natural lighting blueprint',
      'Dedicated styling and artwork curation'
    ]),
    0
  );

  // 4. Portfolio Items
  const insertPortfolio = db.prepare(`
    INSERT INTO portfolio_items (
      id, designer_id, title, category, style, budget, square_feet, location,
      cover_image, images, before_image, after_image, description, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Marcus Vance portfolio
  insertPortfolio.run(
    'port-1',
    'des-1',
    'Tribeca Light Loft Living',
    'Living Room',
    'Modern Minimalist',
    55000,
    1400,
    'Tribeca, New York',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    JSON.stringify([
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ]),
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    'A complete architectural revamp of an 1890s loft. We introduced wide-plank white oak flooring, floating fluted marble fireplace, concealed perimeter LED coves, and custom bouclé seating.',
    1
  );

  insertPortfolio.run(
    'port-2',
    'des-1',
    'Central Park West Penthouse Master Suite',
    'Bedroom',
    'Luxury Contemporary',
    42000,
    850,
    'Upper West Side, New York',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    JSON.stringify([
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ]),
    'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
    'An oasis above the city featuring an integrated acoustic ribbed walnut headboard, custom brass pendant sconces, and automated linen blackout shades.',
    1
  );

  insertPortfolio.run(
    'port-3',
    'des-1',
    'Gramercy Calacatta Marble Chef Kitchen',
    'Kitchen',
    'Modern Minimalist',
    68000,
    620,
    'Gramercy Park, New York',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    JSON.stringify([
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ]),
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    'Seamless monolithic island clad in bookmatched Calacatta Viola marble with handleless fumed oak cabinetry and Sub-Zero integrated appliances.',
    1
  );

  // Elena Rostova portfolio
  insertPortfolio.run(
    'port-4',
    'des-2',
    'DUMBO Waterfront Japandi Sanctuary',
    'Living Room',
    'Japandi',
    48000,
    1200,
    'DUMBO, Brooklyn',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
    JSON.stringify([
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
    ]),
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    'Combining Japanese minimalism and Nordic hygge. Lime-washed micro-cement walls, low-profile oak furniture, paper lanterns, and tactile linen upholstery.',
    1
  );

  insertPortfolio.run(
    'port-5',
    'des-2',
    'Cobble Hill Minimalist Spa Bath',
    'Bathroom',
    'Scandinavian',
    34000,
    280,
    'Cobble Hill, Brooklyn',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    JSON.stringify([
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'
    ]),
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    'Freestanding matte resin soaking tub, Japanese Hinoki cedar wood accents, concealed drain rain shower, and bespoke travertine double vanity.',
    1
  );

  // Julian Thorne portfolio
  insertPortfolio.run(
    'port-6',
    'des-3',
    'Barton Springs Mid-Century Modern Home',
    'Living Room',
    'Mid-Century Modern',
    38000,
    1100,
    'Austin, TX',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    JSON.stringify([
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
    ]),
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    'Warm teakwood joinery, sunken conversation pit, brass Sputnik chandelier, and vintage handwoven Moroccan rugs.',
    1
  );

  // 5. Projects
  const insertProject = db.prepare(`
    INSERT INTO projects (
      id, homeowner_id, designer_id, title, room_type, style_preference, square_feet,
      budget, spent, location, timeline, description, floor_plan_url, status, progress, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Active Project for Sarah & Marcus
  insertProject.run(
    'proj-1',
    'user-h1',
    'des-1',
    'Tribeca Penthouse Living & Dining Overhaul',
    'Living Room',
    'Modern Minimalist',
    1150,
    45000,
    28500,
    'Tribeca, New York',
    '2-3 Months',
    'Transforming our open-plan living and dining area into an architectural haven with custom oak cabinetry, recessed lighting, and sculptural furniture.',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    '3D Modeling',
    65,
    '2026-08-15 10:00:00'
  );

  // Active Project 2 for Sarah & Elena
  insertProject.run(
    'proj-2',
    'user-h1',
    'des-2',
    'Brooklyn Brownstone Japandi Guest Suite',
    'Bedroom',
    'Japandi',
    420,
    22000,
    7500,
    'Brooklyn Heights, NY',
    '1-2 Months',
    'Converting an unused top-floor bedroom into a serene Japandi retreat with tatami-inspired platform bed and warm clay plaster finishes.',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
    'Material Selection',
    40,
    '2026-09-02 14:30:00'
  );

  // Open Community Lead / Inquiry by David Miller
  insertProject.run(
    'proj-3',
    'user-h2',
    null,
    'Pacific Heights Townhouse Kitchen & Dining Remodel',
    'Kitchen',
    'Japandi',
    650,
    38000,
    0,
    'San Francisco, CA',
    '2-4 Months',
    'Looking for a talented designer to remodel our dated kitchen. We desire light fumed oak cabinets, Taj Mahal quartzite counter, hidden pantry doors, and minimalist pendant fixtures. Open to proposals!',
    null,
    'Inquiry',
    15,
    '2026-09-20 09:15:00'
  );

  // Completed Project for Sarah & Julian
  insertProject.run(
    'proj-4',
    'user-h1',
    'des-3',
    'SoHo Sunlit Home Office & Reading Nook',
    'Home Office',
    'Mid-Century Modern',
    350,
    18000,
    17850,
    'SoHo, New York',
    'Completed',
    'A vibrant, ergonomic home office with custom acoustic slat walls, walnut executive desk, and mid-century velvet lounge chair.',
    null,
    'Completed',
    100,
    '2026-05-10 11:00:00'
  );

  // 6. Project Milestones for Proj-1
  const insertMilestone = db.prepare(`
    INSERT INTO project_milestones (id, project_id, title, due_date, completed, description, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertMilestone.run(
    'ms-1',
    'proj-1',
    'Phase 1: Site Survey & Architectural Measurements',
    'Aug 22, 2026',
    1,
    'Comprehensive laser measurements, structural inspection, and existing condition photos taken.',
    1
  );

  insertMilestone.run(
    'ms-2',
    'proj-1',
    'Phase 2: Space Planning & Concept Moodboard',
    'Sep 05, 2026',
    1,
    'Color palette approved: Warm beige, charcoal steel, honed Calacatta, and natural brushed oak.',
    2
  );

  insertMilestone.run(
    'ms-3',
    'proj-1',
    'Phase 3: 3D Photorealistic Modeling & Lighting Plan',
    'Oct 05, 2026',
    0,
    'High-resolution day/dusk visual renderings and architectural lighting specification.',
    3
  );

  insertMilestone.run(
    'ms-4',
    'proj-1',
    'Phase 4: FF&E Specification & Trade Procurement',
    'Oct 20, 2026',
    0,
    'Final furniture ordering with exclusive trade pricing, custom upholstery fabrication.',
    4
  );

  insertMilestone.run(
    'ms-5',
    'proj-1',
    'Phase 5: White Glove Installation & Final Walkthrough',
    'Nov 10, 2026',
    0,
    'Delivery coordination, art hanging, styling accessories, and turnkey handover.',
    5
  );

  // 7. Deliverables for Proj-1
  const insertDeliverable = db.prepare(`
    INSERT INTO project_deliverables (id, project_id, designer_id, title, category, file_url, preview_image, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDeliverable.run(
    'del-1',
    'proj-1',
    'des-1',
    'Tribeca Loft Architectural Floor Plan v2.pdf',
    'Floor Plan',
    '#download-floorplan',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
    'Complete scale 1:50 spatial layout with clear circulation paths and electrical placement.'
  );

  insertDeliverable.run(
    'del-2',
    'proj-1',
    'des-1',
    'Living & Dining Photorealistic 3D Renders.zip',
    '3D Render',
    '#download-renders',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    '4K photorealistic daytime and ambient evening lighting 3D scenes.'
  );

  insertDeliverable.run(
    'del-3',
    'proj-1',
    'des-1',
    'FF&E Curated Furniture & Procurement Schedule.xlsx',
    'FF&E Shopping List',
    '#download-procurement',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    'Complete spreadsheet itemizing 24 pieces with manufacturer trade discounts (saving $6,800).'
  );

  // 8. Consultations
  const insertConsultation = db.prepare(`
    INSERT INTO consultations (id, homeowner_id, designer_id, service_type, date, time, price, status, meeting_link, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertConsultation.run(
    'con-1',
    'user-h1',
    'des-1',
    'Virtual Video Call (45m)',
    '2026-10-02',
    '02:00 PM',
    150,
    'Confirmed',
    'https://meet.interiorhub.demo/vance-loft-review',
    'Reviewing updated 3D renders for the living room fireplace and custom bookshelf joinery.'
  );

  insertConsultation.run(
    'con-2',
    'user-h1',
    'des-2',
    'On-Site Space Assessment (90m)',
    '2026-10-06',
    '11:00 AM',
    300,
    'Confirmed',
    'On-site at Tribeca residence',
    'Evaluating lighting conditions and measuring window alcoves for Japandi guest suite.'
  );

  insertConsultation.run(
    'con-3',
    'user-h1',
    'des-3',
    'Virtual Video Call (45m)',
    '2026-05-15',
    '04:00 PM',
    150,
    'Completed',
    'https://meet.interiorhub.demo/thorne-soho-call',
    'Initial briefing call for the SoHo home office project.'
  );

  // 9. Proposals
  const insertProposal = db.prepare(`
    INSERT INTO proposals (id, project_id, designer_id, homeowner_id, amount, estimated_weeks, scope_description, deliverables_summary, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProposal.run(
    'prop-1',
    'proj-3',
    'des-2',
    'user-h2',
    4200,
    6,
    'Complete Japandi transformation for Pacific Heights kitchen and adjacent dining nook. Includes spatial ergonomics, sustainable oak millwork specs, and lighting blueprint.',
    '2D Floor plans, 3D Renders, Cabinetry Details, Appliance & Tile Schedule',
    'Pending'
  );

  insertProposal.run(
    'prop-2',
    'proj-3',
    'des-1',
    'user-h2',
    5800,
    7,
    'Architectural modern kitchen redesign with integrated slab waterfall counters, hidden butler pantry, and smart mood lighting.',
    'Full construction drawings, Photorealistic 3D, Material palette, Trade procurement',
    'Pending'
  );

  // 10. Invoices
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (id, invoice_number, project_id, designer_id, homeowner_id, title, amount, due_date, status, items, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertInvoice.run(
    'inv-1',
    'INV-2026-089',
    'proj-1',
    'des-1',
    'user-h1',
    'Phase 1 & 2 Design Retainer & Spatial Planning',
    4500,
    '2026-08-25',
    'Paid',
    JSON.stringify([
      { desc: 'Initial Site Survey & Laser Dimensioning', amount: 1500 },
      { desc: '2D Layouts & Concept Moodboard Preparation', amount: 3000 }
    ]),
    '2026-08-24 16:42:00'
  );

  insertInvoice.run(
    'inv-2',
    'INV-2026-104',
    'proj-1',
    'des-1',
    'user-h1',
    'Phase 3 3D Photorealistic Visualizations & Millwork Drawings',
    3800,
    '2026-10-15',
    'Pending',
    JSON.stringify([
      { desc: '4K Architectural 3D Scene Rendering (4 Views)', amount: 2400 },
      { desc: 'Custom Fluted Fireplace & Bookcase Joinery Specs', amount: 1400 }
    ]),
    null
  );

  // 11. Moodboards
  const insertMoodboard = db.prepare(`
    INSERT INTO moodboards (id, user_id, title, description, room_type, palette, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertMoodboard.run(
    'mb-1',
    'user-h1',
    'Tribeca Japandi & Warm Oak Living Room',
    'Inspiration board for the living room makeover: clean lines, curved sofas, textured wool, and warm ceramics.',
    'Living Room',
    JSON.stringify(['#E6DFD5', '#C2B29F', '#8C7B6B', '#3E3730', '#D4AF37']),
    1
  );

  insertMoodboard.run(
    'mb-2',
    'user-h1',
    'Minimalist Calming Master Bedroom',
    'Earth tones, low tatami platform, linen drapery, and soft indirect lighting.',
    'Bedroom',
    JSON.stringify(['#F5F3EF', '#D7CEC7', '#766B57', '#2A2927']),
    1
  );

  // 12. Moodboard Items
  const insertMoodItem = db.prepare(`
    INSERT INTO moodboard_items (id, moodboard_id, title, image_url, item_type, price, brand_or_source, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMoodItem.run(
    'mbi-1',
    'mb-1',
    'Curved Off-White Bouclé Sofa',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    'furniture',
    2850,
    'B&B Italia Style',
    1
  );

  insertMoodItem.run(
    'mbi-2',
    'mb-1',
    'Fluted Solid Oak Coffee Table',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    'furniture',
    980,
    'Nordic Crafts',
    2
  );

  insertMoodItem.run(
    'mbi-3',
    'mb-1',
    'Honed Roman Travertine Plinth Pedestal',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    'material',
    640,
    'Menu Space',
    3
  );

  insertMoodItem.run(
    'mbi-4',
    'mb-1',
    'Akari Washi Paper Floor Pendant Lamp',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    'lighting',
    420,
    'Noguchi Heritage',
    4
  );

  // 13. Messages
  const insertMessage = db.prepare(`
    INSERT INTO messages (id, sender_id, receiver_id, project_id, content, attachment_url, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMessage.run(
    'msg-1',
    'user-h1',
    'user-d1',
    'proj-1',
    'Hi Marcus! I loved the initial 2D layout. Could we ensure there is enough clearance around the dining table for 8 chairs?',
    null,
    1,
    '2026-09-24 10:14:00'
  );

  insertMessage.run(
    'msg-2',
    'user-d1',
    'user-h1',
    'proj-1',
    'Good morning Sarah! Absolutely. I expanded the circulation corridor between the kitchen island and dining bench to 46 inches, which allows comfortable movement even when all chairs are occupied.',
    null,
    1,
    '2026-09-24 10:32:00'
  );

  insertMessage.run(
    'msg-3',
    'user-d1',
    'user-h1',
    'proj-1',
    'Here are the preview renders of the fluted fireplace wall in evening lighting. Take a look and let me know your thoughts!',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    1,
    '2026-09-25 15:45:00'
  );

  insertMessage.run(
    'msg-4',
    'user-h1',
    'user-d1',
    'proj-1',
    'Oh wow, this looks breathtaking! The indirect cove lighting above the marble mantle is perfection. Looking forward to our call tomorrow to finalize.',
    null,
    1,
    '2026-09-25 16:10:00'
  );

  // 14. Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, designer_id, homeowner_id, project_title, rating, comment, room_type, image_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReview.run(
    'rev-1',
    'des-1',
    'user-h1',
    'Tribeca Loft Architectural Renovation',
    5,
    'Marcus is an absolute visionary. His attention to detail, precision in material selection, and ability to balance contemporary luxury with warmth completely surpassed our expectations. The 3D renders were so accurate they matched the finished room to the millimeter.',
    'Living Room',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    '2026-07-15 14:00:00'
  );

  insertReview.run(
    'rev-2',
    'des-2',
    'user-h2',
    'DUMBO Japandi Sanctuary',
    5,
    'Elena created an atmosphere of pure tranquility in our home. Every texture—from the limewash to the fluted oak woodwork—feels harmonious. She also saved us thousands through her exclusive vendor trade connections.',
    'Living Room',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    '2026-08-10 11:30:00'
  );

  insertReview.run(
    'rev-3',
    'des-3',
    'user-h1',
    'SoHo Mid-Century Creative Studio',
    5,
    'Julian is a master of character and eclectic depth. He turned our awkward loft nook into our favorite space in the entire house. Highly recommended for anyone wanting a home with real personality.',
    'Home Office',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    '2026-06-01 09:45:00'
  );

  // 15. Gallery Items (Rich inspiration library)
  const insertGallery = db.prepare(`
    INSERT INTO gallery_items (
      id, title, room_type, style, image_url, designer_id, designer_name, likes,
      color_palette, materials, estimated_cost, square_feet, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const galleryData = [
    {
      id: 'gal-1',
      title: 'Minimalist Japandi Living Room with Low Profile Seating',
      room_type: 'Living Room',
      style: 'Japandi',
      image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-2',
      designer_name: 'Elena Rostova',
      likes: 342,
      color_palette: JSON.stringify(['#E7E1D8', '#C3B5A3', '#8A7A68', '#38322B']),
      materials: JSON.stringify(['Bleached Oak', 'Linen Bouclé', 'Honed Travertine', 'Washi Paper']),
      estimated_cost: 32000,
      square_feet: 480,
      description: 'A serene living environment emphasizing low vertical mass, natural diffuse daylight, and tactile organic textures.'
    },
    {
      id: 'gal-2',
      title: 'Monolithic Calacatta Viola Marble Island Kitchen',
      room_type: 'Kitchen',
      style: 'Modern Minimalist',
      image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-1',
      designer_name: 'Marcus Vance',
      likes: 489,
      color_palette: JSON.stringify(['#FFFFFF', '#D9D5CF', '#5B4345', '#1B1B1B']),
      materials: JSON.stringify(['Calacatta Viola Marble', 'Smoked Oak', 'Matte Black Steel']),
      estimated_cost: 65000,
      square_feet: 520,
      description: 'Dramatic stone veining juxtaposed against handleless architectural cabinetry and concealed appliances.'
    },
    {
      id: 'gal-3',
      title: 'Organic Earth-Toned Master Bedroom Retreat',
      room_type: 'Bedroom',
      style: 'Scandinavian',
      image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-2',
      designer_name: 'Elena Rostova',
      likes: 275,
      color_palette: JSON.stringify(['#F3EFE9', '#D5C7B7', '#938475', '#4E443A']),
      materials: JSON.stringify(['Slatted Oak', 'Belgian Washed Linen', 'Warm Brass', 'Wool Rug']),
      estimated_cost: 24000,
      square_feet: 380,
      description: 'Ribbed acoustic headboard with built-in floating nightstands and soft dimmable halo sconces.'
    },
    {
      id: 'gal-4',
      title: 'Modern Spa Bathroom with Freestanding Soak Tub',
      room_type: 'Bathroom',
      style: 'Luxury Contemporary',
      image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-1',
      designer_name: 'Marcus Vance',
      likes: 398,
      color_palette: JSON.stringify(['#EFECE7', '#BBB4A8', '#6F685D', '#201E1C']),
      materials: JSON.stringify(['Microcement', 'Terrazzo', 'Brushed Gunmetal', 'Fluted Glass']),
      estimated_cost: 29000,
      square_feet: 210,
      description: 'Seamless walk-in shower with continuous floor drainage, floating timber vanity, and skylight illumination.'
    },
    {
      id: 'gal-5',
      title: 'Sunlit Mid-Century Modern Dining & Lounge',
      room_type: 'Dining Room',
      style: 'Mid-Century Modern',
      image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-3',
      designer_name: 'Julian Thorne',
      likes: 312,
      color_palette: JSON.stringify(['#D6955B', '#4E6E5D', '#8C5A3C', '#282420']),
      materials: JSON.stringify(['Solid Walnut', 'Saddle Leather', 'Handmade Ceramic', 'Brass']),
      estimated_cost: 21000,
      square_feet: 340,
      description: 'A convivial open dining zone featuring wishbone armchairs, vintage bar cart, and sculptural pendant.'
    },
    {
      id: 'gal-6',
      title: 'Architectural Executive Home Office with Slat Paneling',
      room_type: 'Home Office',
      style: 'Modern Minimalist',
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-4',
      designer_name: 'Sophia Chen',
      likes: 218,
      color_palette: JSON.stringify(['#F2EFEB', '#BDB7AC', '#47433E', '#181716']),
      materials: JSON.stringify(['White Oak Slats', 'Matte Black Aluminum', 'Ergonomic Leather']),
      estimated_cost: 16500,
      square_feet: 220,
      description: 'A productivity sanctuary with acoustic wall baffles, integrated cord management, and soft indirect lighting.'
    },
    {
      id: 'gal-7',
      title: 'High-Ceiling Bohemian Loft with Hanging Plants',
      room_type: 'Living Room',
      style: 'Bohemian Chic',
      image_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-3',
      designer_name: 'Julian Thorne',
      likes: 367,
      color_palette: JSON.stringify(['#D8C29D', '#A76D42', '#3B5336', '#FAF6F0']),
      materials: JSON.stringify(['Rattan & Wicker', 'Terracotta Tile', 'Raw Canvas', 'Living Greenery']),
      estimated_cost: 19500,
      square_feet: 450,
      description: 'Layered botanical elegance featuring handwoven textiles, exposed timber rafters, and antique accents.'
    },
    {
      id: 'gal-8',
      title: 'Serene Wabi-Sabi Tea Corner and Reading Space',
      room_type: 'Living Room',
      style: 'Japandi',
      image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-2',
      designer_name: 'Elena Rostova',
      likes: 455,
      color_palette: JSON.stringify(['#EDE8E1', '#C6BCB1', '#887B6F', '#39332D']),
      materials: JSON.stringify(['Hinoki Cypress', 'Linen Floor Cushion', 'Rough Stone', 'Paper Shade']),
      estimated_cost: 12000,
      square_feet: 180,
      description: 'A contemplative nook honoring natural imperfections, raw organic textures, and peaceful stillness.'
    },
    {
      id: 'gal-9',
      title: 'Penthouse Skyline Glass Dining Room',
      room_type: 'Dining Room',
      style: 'Luxury Contemporary',
      image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-1',
      designer_name: 'Marcus Vance',
      likes: 290,
      color_palette: JSON.stringify(['#F8F8F8', '#CFCAC3', '#4F4C47', '#1A1817']),
      materials: JSON.stringify(['Cast Bronze', 'Smoked Glass', 'Silk Carpet', 'Alabaster Chandelier']),
      estimated_cost: 44000,
      square_feet: 410,
      description: 'Floor-to-ceiling glass wrapping around a custom 10-seater cast bronze dining table.'
    },
    {
      id: 'gal-10',
      title: 'Mediterranean Inspired Terracotta Kitchen',
      room_type: 'Kitchen',
      style: 'Bohemian Chic',
      image_url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-3',
      designer_name: 'Julian Thorne',
      likes: 245,
      color_palette: JSON.stringify(['#DF825F', '#ECCEB3', '#495244', '#2C2B29']),
      materials: JSON.stringify(['Terracotta Brick', 'Olive Wood', 'Unlacquered Brass', 'Zellige Tile']),
      estimated_cost: 38000,
      square_feet: 360,
      description: 'Handcrafted zellige backsplash with unlacquered brass bridge faucet and reclaimed olive wood open shelves.'
    },
    {
      id: 'gal-11',
      title: 'Minimalist Cloud Bedroom with Cocooning Texture',
      room_type: 'Bedroom',
      style: 'Modern Minimalist',
      image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-4',
      designer_name: 'Sophia Chen',
      likes: 378,
      color_palette: JSON.stringify(['#FDFDFD', '#E9E6E1', '#AEA79B', '#403D37']),
      materials: JSON.stringify(['Bouclé Fabric', 'Cashmere Throw', 'Micro-topped Concrete']),
      estimated_cost: 21500,
      square_feet: 340,
      description: 'A cloud-like haven with soft rounded shapes, hidden wardrobe walls, and ambient baseboard glow.'
    },
    {
      id: 'gal-12',
      title: 'Covered Biophilic Balcony Garden & Lounge',
      room_type: 'Outdoor',
      style: 'Scandinavian',
      image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      designer_id: 'des-4',
      designer_name: 'Sophia Chen',
      likes: 310,
      color_palette: JSON.stringify(['#ECE7E1', '#78866B', '#A29686', '#3D3C3A']),
      materials: JSON.stringify(['Teak Decking', 'Weatherproof Canvas', 'Fibre-Clay Planters']),
      estimated_cost: 14000,
      square_feet: 200,
      description: 'An urban sanctuary seamlessly blending interior comfort with lush vertical greens and fire pit.'
    }
  ];

  galleryData.forEach(item => {
    insertGallery.run(
      item.id,
      item.title,
      item.room_type,
      item.style,
      item.image_url,
      item.designer_id,
      item.designer_name,
      item.likes,
      item.color_palette,
      item.materials,
      item.estimated_cost,
      item.square_feet,
      item.description
    );
  });

  console.log('Database seeded successfully with rich interior design records!');
}

if (require.main === module) {
  seed();
}

module.exports = seed;
