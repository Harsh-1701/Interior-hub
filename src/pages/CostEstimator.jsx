import React, { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Layers,
  Home,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export function CostEstimator({ onOpenPostProject, onSelectDesigner }) {
  const { showToast } = useToast();

  const [roomType, setRoomType] = useState('Living Room');
  const [squareFeet, setSquareFeet] = useState(450);
  const [finishTier, setFinishTier] = useState('premium');
  const [scopes, setScopes] = useState([
    'woodwork',
    'furniture',
    'painting_decor',
    'ceiling_lighting',
    'civil_flooring'
  ]);
  const [estimateData, setEstimateData] = useState(null);
  const [loading, setLoading] = useState(false);

  const roomOptions = [
    'Living Room',
    'Kitchen',
    'Master Bedroom',
    'Bathroom',
    'Dining Room',
    'Home Office',
    'Full Home 2BHK',
    'Full Home 3BHK'
  ];

  const scopeOptions = [
    { id: 'woodwork', label: 'Custom Joinery & Millwork', desc: 'Built-in wardrobes, floating TV units, kitchen cabinetry' },
    { id: 'furniture', label: 'Furniture, Rugs & FF&E', desc: 'Curved sofas, dining table, accent seating, drapery' },
    { id: 'painting_decor', label: 'Wall Finishes & Acoustic Slats', desc: 'Limewash plaster, fluted timber panels, wall coverings' },
    { id: 'ceiling_lighting', label: 'Architectural Lighting & Ceiling', desc: 'Recessed perimeter LED coves, magnetic tracks, fixtures' },
    { id: 'civil_flooring', label: 'Civil Changes, Microcement & Tile', desc: 'Demolition, hardwood or microcement floors, wet area tiling' }
  ];

  useEffect(() => {
    async function calculate() {
      try {
        const res = await api.calculateCost({
          roomType,
          squareFeet,
          finishTier,
          scopes
        });
        setEstimateData(res);
      } catch (err) {
        console.error('Calculation error:', err);
      }
    }
    calculate();
  }, [roomType, squareFeet, finishTier, scopes]);

  const toggleScope = (id) => {
    if (scopes.includes(id)) {
      if (scopes.length <= 1) return; // Keep at least one
      setScopes(scopes.filter(s => s !== id));
    } else {
      setScopes([...scopes, id]);
    }
  };

  const handleLaunchProject = () => {
    if (estimateData && estimateData.summary) {
      onOpenPostProject({
        title: `${roomType} Bespoke Renovation`,
        roomType,
        budget: estimateData.summary.totalEstimate,
        squareFeet: estimateData.summary.squareFeet,
        description: `Looking to execute a ${finishTier} tier renovation for my ${roomType} (${squareFeet} sq ft). Scopes include ${scopes.join(', ')}.`
      });
    } else {
      onOpenPostProject();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Budget Intelligence</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
          Renovation Cost Estimator
        </h1>
        <p className="text-stone-600 text-sm">
          Plan your residential investment with transparent real-time cost breakdowns based on current architectural trade rates and materials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-sm space-y-6">
          {/* Room Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
              1. Select Room / Project Space
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roomOptions.map(r => (
                <button
                  key={r}
                  onClick={() => setRoomType(r)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    roomType === r
                      ? 'border-clay-600 bg-clay-50/50 text-clay-800 ring-2 ring-clay-600/20 shadow-xs'
                      : 'border-sand-200 hover:border-sand-400 text-stone-700 bg-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Area Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                2. Approximate Floor Area
              </label>
              <span className="font-serif text-xl font-bold text-stone-900">{squareFeet} sq ft</span>
            </div>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={squareFeet}
              onChange={(e) => setSquareFeet(parseInt(e.target.value))}
              className="w-full accent-clay-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>100 sq ft</span>
              <span>1,200 sq ft</span>
              <span>2,500+ sq ft</span>
            </div>
          </div>

          {/* Finish Tier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
              3. Specification & Finish Standard
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'standard', name: 'Standard / Clean', rate: '$45-$65 / sqft', desc: 'Pre-laminated boards, quality paint, standard hardware.' },
                { id: 'premium', name: 'Premium Bespoke', rate: '$70-$110 / sqft', desc: 'Veneer & PU polish, quartz counters, architectural tracks.' },
                { id: 'luxury', name: 'Ultra-Luxury Custom', rate: '$120-$190+ / sqft', desc: 'Italian marble, solid oak millwork, smart lighting automation.' }
              ].map(t => (
                <div
                  key={t.id}
                  onClick={() => setFinishTier(t.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    finishTier === t.id
                      ? 'border-clay-600 bg-clay-50/40 ring-2 ring-clay-600/20 shadow-xs'
                      : 'border-sand-200 hover:border-sand-300 bg-white'
                  }`}
                >
                  <h4 className="font-serif font-bold text-sm text-stone-900 mb-0.5">{t.name}</h4>
                  <p className="text-[11px] font-semibold text-clay-700 mb-1.5">{t.rate}</p>
                  <p className="text-[11px] text-stone-500">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scopes Included */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
              4. Included Renovation Scope
            </label>
            <div className="space-y-2">
              {scopeOptions.map(sc => {
                const isChecked = scopes.includes(sc.id);
                return (
                  <div
                    key={sc.id}
                    onClick={() => toggleScope(sc.id)}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isChecked
                        ? 'border-clay-600 bg-clay-50/20 ring-1 ring-clay-600/20'
                        : 'border-sand-200 hover:border-sand-300'
                    }`}
                  >
                    <div>
                      <h5 className="font-medium text-xs text-stone-900">{sc.label}</h5>
                      <p className="text-[11px] text-stone-500">{sc.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-clay-600 text-white' : 'border border-sand-300'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculated Estimate Card */}
        <div className="lg:col-span-5 space-y-6">
          {estimateData && (
            <div className="bg-stone-900 text-sand-50 p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl space-y-6 sticky top-28">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-clay-400">
                  Estimated Total Investment
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
                    ${estimateData.summary.totalEstimate.toLocaleString()}
                  </h2>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Expected range: ${estimateData.summary.rangeMin.toLocaleString()} – ${estimateData.summary.rangeMax.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4 py-3 px-4 bg-stone-850 rounded-2xl border border-stone-700/60 text-xs text-stone-300">
                <Clock className="w-4 h-4 text-clay-400 shrink-0" />
                <span>Estimated Realization: <strong>{estimateData.summary.estimatedWeeks} Weeks</strong></span>
              </div>

              {/* Itemized Breakdown */}
              <div className="space-y-3 pt-2 border-t border-stone-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block">
                  Category Breakdown
                </span>

                <div className="space-y-2.5">
                  {estimateData.breakdown.map((b, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-stone-300">{b.category}</span>
                        <span className="font-semibold text-white">${b.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-clay-500 rounded-full"
                          style={{ width: `${b.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-stone-800 space-y-2">
                <Button
                  variant="primary"
                  onClick={handleLaunchProject}
                  className="w-full py-3.5 bg-clay-600 hover:bg-clay-700 text-white font-semibold text-xs"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Request Quotes Based on this Estimate
                </Button>
                <p className="text-[11px] text-stone-500 text-center">
                  Includes escrow milestone protection & contractor bid support.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
