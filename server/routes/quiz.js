const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/quiz/evaluate - Score style quiz answers
router.post('/evaluate', (req, res) => {
  const { colorMood, furnitureLines, vibeAtmosphere, materialsPreference, lifestylePriority } = req.body;

  // Aesthetic profiles mapping
  let primaryStyle = 'Japandi';
  let title = 'Warm Japandi Sanctuary';
  let description = 'Your aesthetic embodies the harmonious intersection of Scandinavian functionality and Japanese wabi-sabi simplicity. You cherish uncluttered sightlines, warm tactile timbers, earthen pottery, and organic natural light.';
  let palette = [
    { name: 'Warm Parchment', hex: '#F4F1EA' },
    { name: 'Oatmeal Linen', hex: '#D7CEC7' },
    { name: 'Smoked Teak', hex: '#8C7B6B' },
    { name: 'Charcoal Earth', hex: '#3E3730' },
    { name: 'Muted Olive', hex: '#6B705C' }
  ];
  let materials = ['Bleached White Oak', 'Textured Bouclé', 'Honed Travertine', 'Washi Paper & Fluted Glass', 'Cast Ceramic'];
  let stylingRules = [
    'Keep furniture profiles low to the ground to enhance vertical room volume.',
    'Favor imperfected organic textures over glossy artificial finishes.',
    'Prioritize concealed architectural storage to preserve visual tranquility.',
    'Layer warm indirect 2700K lighting with floor paper lanterns.'
  ];
  let scores = {
    'Japandi': 92,
    'Modern Minimalist': 84,
    'Scandinavian': 78,
    'Luxury Contemporary': 46,
    'Mid-Century Modern': 38
  };

  if (colorMood === 'dark_moody' || vibeAtmosphere === 'modern_luxury' || materialsPreference === 'polished_brass_marble') {
    primaryStyle = 'Luxury Contemporary';
    title = 'Modern Architectural Luxury';
    description = 'You gravitate toward sculptural high-end elegance, dramatic monolithic stone surfaces, bespoke joinery, and tailored silhouettes that make a bold, sophisticated statement.';
    palette = [
      { name: 'Pure Chalk', hex: '#FFFFFF' },
      { name: 'Onyx Black', hex: '#1C1B1A' },
      { name: 'Calacatta Vein', hex: '#584343' },
      { name: 'Burnished Brass', hex: '#C5A059' },
      { name: 'Slate Taupe', hex: '#827E7A' }
    ];
    materials = ['Bookmatched Calacatta Marble', 'Brushed Champagne Brass', 'Fumed Dark Oak', 'Velvet Upholstery', 'Smoked Glass'];
    stylingRules = [
      'Incorporate one monolithic statement island or architectural fireplace.',
      'Use recessed perimeter ceiling lighting to create moody floating illumination.',
      'Choose custom oversized bespoke art rather than multiple small frames.'
    ];
    scores = {
      'Luxury Contemporary': 94,
      'Modern Minimalist': 85,
      'Mid-Century Modern': 62,
      'Japandi': 40,
      'Scandinavian': 35
    };
  } else if (furnitureLines === 'raw_industrial' || vibeAtmosphere === 'creative_eclectic') {
    primaryStyle = 'Mid-Century Modern';
    title = 'Warm Mid-Century & Eclectic Soul';
    description = 'You celebrate personality, iconic vintage silhouettes, warm walnut timbers, tactile leather, and vibrant character-filled spaces that feel artfully collected over time.';
    palette = [
      { name: 'Mustard Ochre', hex: '#D6955B' },
      { name: 'Forest Sage', hex: '#4E6E5D' },
      { name: 'Warm Terracotta', hex: '#C86D51' },
      { name: 'Rich Walnut', hex: '#4A3525' },
      { name: 'Ivory Cream', hex: '#FAF5EE' }
    ];
    materials = ['American Walnut', 'Cognac Saddle Leather', 'Handmade Zellige Tile', 'Perforated Brass', 'Woven Wool'];
    stylingRules = [
      'Anchor the space with an iconic sculptural lounge chair.',
      'Blend warm metals with authentic timber grains.',
      'Introduce curated open shelving displaying vintage ceramics and books.'
    ];
    scores = {
      'Mid-Century Modern': 95,
      'Bohemian Chic': 82,
      'Industrial Loft': 74,
      'Modern Minimalist': 48,
      'Japandi': 36
    };
  } else if (materialsPreference === 'natural_wood_stone' && colorMood === 'cool_serene') {
    primaryStyle = 'Scandinavian';
    title = 'Nordic Serenity & Functional Light';
    description = 'Crisp daylight, airy pine and birch accents, warm woolen throws, and clean uncluttered layouts that emphasize hygge, coziness, and cheerful simplicity.';
    palette = [
      { name: 'Snow White', hex: '#FAFAFA' },
      { name: 'Pale Mist Gray', hex: '#E3E5E8' },
      { name: 'Soft Birch', hex: '#D4C5B9' },
      { name: 'Dusty Pine', hex: '#728073' },
      { name: 'Midnight Charcoal', hex: '#26292B' }
    ];
    materials = ['Light Ash & Birch', 'Chunky Knitted Wool', 'Matte White Ceramics', 'Linen Sheers'];
    stylingRules = [
      'Maximize natural light with floor-to-ceiling sheer linen drapes.',
      'Create cozy hygge reading corners with tactile sheepskin throws.',
      'Prioritize ergonomic, multi-functional modular furniture.'
    ];
    scores = {
      'Scandinavian': 94,
      'Japandi': 86,
      'Modern Minimalist': 79,
      'Mid-Century Modern': 50,
      'Luxury Contemporary': 30
    };
  }

  // Fetch top matching designers from database
  const designers = db.prepare(`
    SELECT d.id, d.studio_name, d.tagline, d.rating, d.review_count, d.hourly_rate,
           d.price_range, d.styles, d.cover_image, d.location,
           u.name as designer_name, u.avatar
    FROM designer_profiles d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.rating DESC
  `).all();

  const matchedDesigners = designers.map(d => {
    let styles = [];
    try { styles = JSON.parse(d.styles || '[]'); } catch (e) {}
    const matchesStyle = styles.some(s => s.toLowerCase().includes(primaryStyle.toLowerCase()));
    return {
      ...d,
      styles,
      isPrimaryMatch: matchesStyle
    };
  }).sort((a, b) => (b.isPrimaryMatch ? 1 : 0) - (a.isPrimaryMatch ? 1 : 0)).slice(0, 3);

  res.json({
    primaryStyle,
    title,
    description,
    palette,
    materials,
    stylingRules,
    scores,
    matchedDesigners
  });
});

module.exports = router;
