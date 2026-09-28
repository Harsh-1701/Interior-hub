import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Bookmark,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export function StyleQuiz({ onOpenBooking, onSelectDesigner, onOpenPostProject }) {
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    colorMood: 'warm_neutrals',
    furnitureLines: 'organic_curved',
    vibeAtmosphere: 'wabi_sabi_zen',
    materialsPreference: 'natural_wood_stone',
    lifestylePriority: 'peaceful_retreat'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const questions = [
    {
      id: 'colorMood',
      title: 'Which color palette resonates most with your sanctuary?',
      subtitle: 'Select the color temperature that makes you feel most at ease.',
      options: [
        {
          id: 'warm_neutrals',
          title: 'Warm Earth & Linen',
          desc: 'Sand, oatmeal, bleached oak, and warm clay.',
          swatches: ['#F4F1EA', '#D7CEC7', '#8C7B6B', '#3E3730'],
          image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'dark_moody',
          title: 'Dramatic Charcoal & Marble',
          desc: 'Deep bronze, charcoal, Calacatta veining, and champagne brass.',
          swatches: ['#FFFFFF', '#D9D5CF', '#5B4345', '#1B1B1B'],
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'cool_serene',
          title: 'Airy Scandinavian Mist',
          desc: 'Crisp chalk white, pale birch, muted sage, and soft dove gray.',
          swatches: ['#FAFAFA', '#E3E5E8', '#D4C5B9', '#728073'],
          image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'bold_vibrant',
          title: 'Mid-Century Teak & Ochre',
          desc: 'Cognac leather, mustard ochre, rich walnut, and forest green.',
          swatches: ['#D6955B', '#4E6E5D', '#C86D51', '#4A3525'],
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 'furnitureLines',
      title: 'What silhouette does your ideal furniture carry?',
      subtitle: 'Furniture lines define the physical flow and energy of the room.',
      options: [
        {
          id: 'organic_curved',
          title: 'Organic Curves & Low Profiles',
          desc: 'Curved bouclé sofas, pebble coffee tables, low tatami heights.',
          image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'clean_minimal',
          title: 'Precise Architectural Geometry',
          desc: 'Floating linear credenzas, recessed shadow gaps, slender metal frames.',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'raw_industrial',
          title: 'Tactile Heritage & Mid-Century Shapes',
          desc: 'Teak spindle chairs, hairpin steel legs, slatted timber screens.',
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'ornate_plush',
          title: 'Generous Monolithic Luxury',
          desc: 'Oversized marble slabs, deep velvet sectionals, sculptured stone bases.',
          image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 'vibeAtmosphere',
      title: 'How should your home feel the second you step inside?',
      subtitle: 'The psychological atmosphere you wish to foster daily.',
      options: [
        {
          id: 'wabi_sabi_zen',
          title: 'Quiet Zen Sanctuary',
          desc: 'Clutter-free, tactile warmth, soft indirect glow, and effortless stillness.',
          image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'modern_luxury',
          title: 'Polished Architectural Prestige',
          desc: 'Dramatic ceiling coves, gallery walls, sculptural fixtures, and luxury hospitality feel.',
          image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'cozy_hygge',
          title: 'Cozy Nordic Hygge',
          desc: 'Chunky wool textiles, abundant morning light, warm teacups, and reading nooks.',
          image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'creative_eclectic',
          title: 'Curated Artistic Soul',
          desc: 'Layered ceramics, books, travel memorabilia, and vibrant conversations.',
          image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 'materialsPreference',
      title: 'Which primary materials speak to your touch?',
      subtitle: 'Authentic physical textures that anchor the design.',
      options: [
        {
          id: 'natural_wood_stone',
          title: 'Bleached Oak, Travertine & Linen',
          desc: 'Natural unfinished stone, brushed timber, and textured wool.',
          image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'polished_brass_marble',
          title: 'Calacatta Marble, Brushed Brass & Glass',
          desc: 'High-contrast marble veining, metal hardware, and fluted glass panels.',
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'exposed_brick_steel',
          title: 'Walnut, Saddle Leather & Zellige',
          desc: 'Handmade Moroccan tile, dark rich wood, and vegetable-tanned leather.',
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'rattan_linen',
          title: 'Microcement, Concrete & Cedar',
          desc: 'Seamless continuous floors, cedar paneling, and Japanese paper lamps.',
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    {
      id: 'lifestylePriority',
      title: 'What is your primary functional priority?',
      subtitle: 'Designing for how you truly live day to day.',
      options: [
        {
          id: 'peaceful_retreat',
          title: 'Deep Unwinding & Recharge',
          desc: 'A calming oasis away from city noise with acoustic absorption and dimmable warmth.',
          image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'entertaining_hub',
          title: 'Hosting & Social Gatherings',
          desc: 'Open-concept island cooking, ample seating, integrated wine display, and cocktail area.',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'multi_functional',
          title: 'Smart Ergonomics & Concealed Storage',
          desc: 'Clever hidden cabinets, dual-purpose home office, and clutter-free organization.',
          image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'showcase_statement',
          title: 'Architectural Statement Showcase',
          desc: 'Museum-quality finishes, bespoke custom furniture, and spotlighted art walls.',
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'
        }
      ]
    }
  ];

  const handleSelectOption = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      evaluateResults();
    }
  };

  const evaluateResults = async () => {
    setLoading(true);
    try {
      const res = await api.evaluateQuiz(answers);
      setResult(res);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
      showToast('Aesthetic discovered!', 'success');
    } catch (err) {
      showToast('Error calculating results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep(0);
  };

  const currentQ = questions[currentStep];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {!result ? (
        <div className="space-y-8">
          {/* Progress Bar & Header */}
          <div className="space-y-4 text-center max-w-xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">
              Interactive Aesthetic Discovery
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Find Your Interior Style DNA
            </h1>

            {/* Step Counter */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-10 bg-clay-600'
                      : idx < currentStep
                      ? 'w-6 bg-sand-400'
                      : 'w-4 bg-sand-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-stone-500 font-medium">Question {currentStep + 1} of {questions.length}</p>
          </div>

          {/* Active Question Box */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-6">
            <div className="text-center space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {currentQ.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">{currentQ.subtitle}</p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`cursor-pointer rounded-2xl border overflow-hidden transition-all duration-200 group flex flex-col justify-between ${
                      isSelected
                        ? 'border-clay-600 ring-2 ring-clay-600/20 bg-clay-50/20 shadow-md'
                        : 'border-sand-200 hover:border-sand-400 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="relative h-44 overflow-hidden bg-stone-100">
                      <img
                        src={opt.image}
                        alt={opt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {isSelected && (
                        <div className="absolute top-3 right-3 p-1.5 rounded-full bg-clay-600 text-white shadow-md">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-clay-700 transition-colors">
                        {opt.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">{opt.desc}</p>

                      {opt.swatches && (
                        <div className="flex gap-1.5 pt-1">
                          {opt.swatches.map((hex, i) => (
                            <div key={i} className="w-5 h-5 rounded-md border border-stone-200 shadow-2xs" style={{ backgroundColor: hex }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation back */}
            {currentStep > 0 && (
              <div className="pt-2 flex justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="text-xs text-stone-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous Question
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8 animate-in fade-in">
          {/* Main Hero Result Card */}
          <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-lg p-8 sm:p-12 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-sand-200 pb-8">
              <div className="space-y-2">
                <Badge variant="clay" className="uppercase tracking-wider">Your Aesthetic Archetype</Badge>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
                  {result.title}
                </h2>
                <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
                  {result.description}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retake Quiz
              </Button>
            </div>

            {/* Color Palette Swatches */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                Signature Architectural Color Harmony
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {result.palette?.map((c, i) => (
                  <div key={i} className="p-3 bg-sand-50 rounded-2xl border border-sand-200 space-y-2">
                    <div className="h-16 rounded-xl shadow-inner border border-stone-200" style={{ backgroundColor: c.hex }} />
                    <div>
                      <span className="block text-xs font-bold text-stone-900">{c.name}</span>
                      <span className="block text-[11px] text-stone-400 font-mono uppercase">{c.hex}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Material & Styling Commandments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                  Recommended Core Materials
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.materials?.map((m, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-sand-100 text-stone-800 text-xs font-medium border border-sand-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                  Architectural Styling Guidelines
                </span>
                <ul className="space-y-2 text-xs text-stone-600">
                  {result.stylingRules?.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-clay-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-sand-200 flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => onOpenPostProject({ style: result.primaryStyle })}
                className="text-xs px-6"
              >
                Post Renovation Project with {result.primaryStyle} Aesthetic
              </Button>
            </div>
          </div>

          {/* Matched Verified Designers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Verified Talent Matches</span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Top Recommended Designers for {result.primaryStyle}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.matchedDesigners?.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-3xl border border-sand-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={d.avatar} alt={d.designer_name} className="w-12 h-12 rounded-full object-cover border border-sand-200" />
                      <div>
                        <h4 className="font-serif font-bold text-stone-900 text-base">{d.studio_name}</h4>
                        <p className="text-xs text-stone-500">{d.location} • ★ {d.rating}</p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">{d.tagline}</p>
                    <div className="flex flex-wrap gap-1">
                      {d.styles?.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] bg-sand-100 text-stone-700 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                    <span className="font-serif font-bold text-stone-900 text-sm">${d.hourly_rate}/hr</span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onOpenBooking(d)}
                      className="text-xs"
                    >
                      Book Session
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
