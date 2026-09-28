import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, Star, MapPin, Award, ArrowRight, Video } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RatingStars } from '../components/ui/RatingStars';
import { api } from '../services/api';

export function Designers({ onSelectDesigner, onOpenBooking, onOpenQuote }) {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState('all');
  const [city, setCity] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [minRating, setMinRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    async function fetchDesigners() {
      setLoading(true);
      try {
        const res = await api.getDesigners({
          search,
          style,
          city,
          priceRange,
          minRating,
          verified: verifiedOnly ? '1' : undefined
        });
        if (res.designers) {
          setDesigners(res.designers);
        }
      } catch (err) {
        console.error('Error fetching designers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDesigners();
  }, [search, style, city, priceRange, minRating, verifiedOnly]);

  const clearFilters = () => {
    setSearch('');
    setStyle('all');
    setCity('all');
    setPriceRange('all');
    setMinRating('');
    setVerifiedOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Architectural Directory</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
          Find Your Interior Designer
        </h1>
        <p className="text-stone-600 text-sm">
          Connect with vetted residential interior architects. Compare verified client reviews, hourly rates, aesthetic portfolios, and book direct consultations.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search studio or designer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-200 text-xs focus:outline-none focus:ring-2 focus:ring-clay-500 bg-sand-50/50"
            />
          </div>

          {/* Aesthetic Style */}
          <div>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sand-200 text-xs text-stone-800 bg-sand-50/50 focus:outline-none"
            >
              <option value="all">All Aesthetics</option>
              <option value="Japandi">Japandi</option>
              <option value="Modern Minimalist">Modern Minimalist</option>
              <option value="Scandinavian">Scandinavian</option>
              <option value="Luxury Contemporary">Luxury Contemporary</option>
              <option value="Mid-Century Modern">Mid-Century Modern</option>
              <option value="Bohemian Chic">Bohemian Chic</option>
            </select>
          </div>

          {/* City / Location */}
          <div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sand-200 text-xs text-stone-800 bg-sand-50/50 focus:outline-none"
            >
              <option value="all">All Locations</option>
              <option value="New York">New York, NY</option>
              <option value="Brooklyn">Brooklyn, NY</option>
              <option value="Austin">Austin, TX</option>
              <option value="Seattle">Seattle, WA</option>
              <option value="San Francisco">San Francisco, CA</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sand-200 text-xs text-stone-800 bg-sand-50/50 focus:outline-none"
            >
              <option value="all">All Price Tiers</option>
              <option value="$$">$$ (Standard - $100-$120/hr)</option>
              <option value="$$$">$$$ (Premium - $125-$145/hr)</option>
              <option value="$$$$">$$$$ (Ultra Luxury - $150+/hr)</option>
            </select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-sand-100 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-clay-600 focus:ring-clay-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Studios Only
              </span>
            </label>

            <button
              onClick={() => setMinRating(minRating === '4.9' ? '' : '4.9')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                minRating === '4.9' ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold' : 'bg-sand-50 border-sand-200 text-stone-600'
              }`}
            >
              ★ 4.9+ Top Rated
            </button>
          </div>

          <button
            onClick={clearFilters}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Designers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-sand-200 rounded-2xl" />
          ))}
        </div>
      ) : designers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-sand-200">
          <p className="font-serif text-lg text-stone-700">No designers match this specific combination</p>
          <p className="text-xs text-stone-400 mt-1">Try relaxing your search terms or filters.</p>
          <Button size="sm" variant="secondary" onClick={clearFilters} className="mt-4">
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designers.map(d => (
            <div
              key={d.id}
              className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-sand-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Cover Banner */}
                <div className="relative h-48 bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelectDesigner(d.id)}>
                  <img
                    src={d.cover_image}
                    alt={d.studio_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    {d.verified === 1 && (
                      <Badge variant="emerald" className="bg-stone-900/80 text-emerald-300 border-stone-800 backdrop-blur-md flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Pro
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="clay" className="bg-stone-900/80 text-sand-50 border-stone-800 backdrop-blur-md">
                      {d.price_range}
                    </Badge>
                  </div>
                  <div className="absolute -bottom-6 left-5">
                    <img
                      src={d.avatar}
                      alt={d.designer_name}
                      className="w-14 h-14 rounded-2xl border-2 border-white object-cover shadow-lg"
                    />
                  </div>
                </div>

                {/* Profile Information */}
                <div className="pt-8 p-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" /> {d.location}
                    </span>
                    <RatingStars rating={d.rating} count={d.review_count} />
                  </div>

                  <h3
                    onClick={() => onSelectDesigner(d.id)}
                    className="font-serif text-xl font-bold text-stone-900 group-hover:text-clay-700 transition-colors cursor-pointer"
                  >
                    {d.studio_name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1 mb-4">
                    {d.tagline}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-sand-50 p-2.5 rounded-xl border border-sand-200 text-xs mb-4">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Experience</span>
                      <span className="font-semibold text-stone-800">{d.years_experience} Years</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Completed Projects</span>
                      <span className="font-semibold text-stone-800">{d.completed_projects} Spaces</span>
                    </div>
                  </div>

                  {/* Aesthetic Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {d.styles?.slice(0, 3).map((st, i) => (
                      <span key={i} className="text-[11px] bg-sand-100 text-stone-700 px-2 py-0.5 rounded-md">
                        {st}
                      </span>
                    ))}
                  </div>

                  {/* Sample Portfolio Preview Thumbnails */}
                  {d.portfolioSamples && d.portfolioSamples.length > 0 && (
                    <div className="space-y-1 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Recent Spaces
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {d.portfolioSamples.map((p, idx) => (
                          <div key={idx} className="h-16 rounded-lg overflow-hidden bg-stone-100 relative group/thumb">
                            <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white p-1 text-center font-medium">
                              {p.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-sand-100 bg-sand-50/50 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">Rate</span>
                  <p className="font-serif font-bold text-stone-900 text-base">
                    ${d.hourly_rate}<span className="text-stone-500 text-xs font-normal">/hr</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenBooking(d)}
                    className="text-xs px-3"
                  >
                    <Video className="w-3.5 h-3.5 mr-1 text-clay-600" /> Book
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onSelectDesigner(d.id)}
                    className="text-xs px-3"
                  >
                    Profile
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
