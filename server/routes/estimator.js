const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/estimator/calculate
router.post('/calculate', (req, res) => {
  const {
    roomType = 'Living Room',
    squareFeet = 400,
    finishTier = 'premium',
    scopes = ['furniture', 'woodwork', 'ceiling_lighting', 'painting_decor']
  } = req.body;

  const sqft = Math.max(80, Math.min(6000, parseInt(squareFeet) || 400));

  // Base rate per square foot depending on room type and finish tier
  const tierMultiplier = {
    standard: 1.0,
    premium: 1.6,
    luxury: 2.5
  }[finishTier] || 1.6;

  const roomBaseRates = {
    'Living Room': 45,
    'Kitchen': 85,
    'Master Bedroom': 50,
    'Bathroom': 95,
    'Dining Room': 40,
    'Home Office': 42,
    'Full Home 2BHK': 60,
    'Full Home 3BHK': 70
  };

  const baseRate = (roomBaseRates[roomType] || 50) * tierMultiplier;
  const baseSubtotal = sqft * baseRate;

  // Breakdown percentages by scope
  let woodworkCost = scopes.includes('woodwork') ? Math.round(baseSubtotal * 0.32) : 0;
  let furnitureCost = scopes.includes('furniture') ? Math.round(baseSubtotal * 0.28) : 0;
  let finishesCost = scopes.includes('painting_decor') ? Math.round(baseSubtotal * 0.16) : 0;
  let lightingCost = scopes.includes('ceiling_lighting') ? Math.round(baseSubtotal * 0.12) : 0;
  let civilCost = scopes.includes('civil_flooring') ? Math.round(baseSubtotal * 0.18) : 0;

  const executionSubtotal = woodworkCost + furnitureCost + finishesCost + lightingCost + civilCost;

  // Designer professional architectural fee (approx 10-14% of execution or package based)
  const designerFeeRate = finishTier === 'luxury' ? 0.14 : (finishTier === 'premium' ? 0.12 : 0.10);
  const designerFee = Math.round(executionSubtotal * designerFeeRate);

  // Contingency (10%)
  const contingency = Math.round(executionSubtotal * 0.10);

  const totalEstimate = executionSubtotal + designerFee + contingency;
  const rangeMin = Math.round(totalEstimate * 0.90);
  const rangeMax = Math.round(totalEstimate * 1.15);

  // Timeline estimate
  let estimatedWeeks = 3;
  if (sqft > 1000 || roomType.includes('Full Home')) estimatedWeeks = finishTier === 'luxury' ? 14 : 10;
  else if (roomType === 'Kitchen' || roomType === 'Bathroom') estimatedWeeks = finishTier === 'luxury' ? 8 : 6;
  else estimatedWeeks = finishTier === 'luxury' ? 6 : 4;

  // Find top designers suited for this budget
  const designers = db.prepare(`
    SELECT d.id, d.studio_name, d.rating, d.price_range, d.hourly_rate, d.cover_image,
           u.name as designer_name, u.avatar
    FROM designer_profiles d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.rating DESC
    LIMIT 3
  `).all();

  res.json({
    summary: {
      roomType,
      squareFeet: sqft,
      finishTier,
      totalEstimate,
      rangeMin,
      rangeMax,
      estimatedWeeks
    },
    breakdown: [
      { category: 'Custom Millwork & Cabinetry', amount: woodworkCost, percentage: 32, desc: 'Bespoke wardrobes, TV unit, kitchen joinery or storage' },
      { category: 'Furniture, Upholstery & FF&E', amount: furnitureCost, percentage: 28, desc: 'Sofas, accent chairs, dining table, bed frames, rugs' },
      { category: 'Civil, Flooring & Plaster', amount: civilCost, percentage: 18, desc: 'Tile work, microcement, demolition & structural adjustments' },
      { category: 'Wall Finishes, Paints & Decor', amount: finishesCost, percentage: 16, desc: 'Limewash/paint, acoustic fluting, wall treatments' },
      { category: 'Architectural Lighting & Ceiling', amount: lightingCost, percentage: 12, desc: 'False ceiling coves, magnetic tracks, designer fixtures' },
      { category: 'Professional Designer Fee', amount: designerFee, percentage: 12, desc: '2D layouts, 3D renders, site visits, procurement management' },
      { category: 'Contingency & Unforeseen Buffer', amount: contingency, percentage: 10, desc: 'Safe financial buffer for on-site variations or upgrades' }
    ].filter(b => b.amount > 0),
    recommendedDesigners: designers
  });
});

module.exports = router;
