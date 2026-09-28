import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Compass,
  Calendar,
  CheckCircle2,
  DollarSign,
  Layers,
  ChevronRight,
  Heart,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RatingStars } from '../components/ui/RatingStars';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Home({
  setCurrentView,
  onOpenBooking,
  onOpenPostProject,
  onOpenDesignerDetail,
  onOpenRoomDetail
}) {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [designers, setDesigners] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [howItWorksTab, setHowItWorksTab] = useState('homeowner');

  // Quick estimator preview state
  const [estRoom, setEstRoom] = useState('Living Room');
  const [estSqft, setEstSqft] = useState(450);
  const [estTier, setEstTier] = useState('premium');
  const [estTotal, setEstTotal] = useState(38000);

  useEffect(() => {
    async function loadData() {
      try {
        const [dRes, gRes] = await Promise.all([
          api.getDesigners({ limit: 4 }),
          api.getGallery({ limit: 6 })
        ]);
        if (dRes.designers) setDesigners(dRes.designers.slice(0, 4));
        if (gRes.gallery) setGalleryItems(gRes.gallery.slice(0, 6));
      } catch (e) {
        console.error('Failed to load home data', e);
      }
    }
    loadData();
  }, []);

  // Quick estimator calculation update
  useEffect(() => {
    const rateMap = { 'Living Room': 50, 'Kitchen': 85, 'Master Bedroom': 55, 'Bathroom': 90 };
    const multMap = { standard: 1.0, premium: 1.6, luxury: 2.5 };
    const base = (rateMap[estRoom] || 50) * (multMap[estTier] || 1.6);
    setEstTotal(Math.round(estSqft * base));
  }, [estRoom, estSqft, estTier]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentView('designers');
  };

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      await api.likeGalleryItem(id, user?.id);
      setGalleryItems(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
      showToast('Liked this design!', 'success');
    } catch (err) {}
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-sand-100/60 pt-12 pb-20 border-b border-sand-200">
        <div className="absolute inset-0 bg-[radial-gradient(#C5B59A_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-200 text-stone-800 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-clay-600" />
              <span>Curated Residential Interior Architecture</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-[1.12]">
              Elevate your home with <br />
              <span className="italic font-normal text-clay-700">bespoke interior design.</span>
            </h1>

            <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Connect directly with verified interior architects. Review photorealistic 3D concepts, collaborate seamlessly with milestone escrow, and bring your aesthetic sanctuary to life.
            </p>

            {/* Comprehensive Search & Filter Hero Box */}
            <form onSubmit={handleSearchSubmit} className="pt-4 max-w-4xl mx-auto">
              <div className="bg-white p-3 rounded-2xl sm:rounded-3xl shadow-xl border border-sand-300 flex flex-col md:flex-row items-center gap-2.5">
                {/* Search Term */}
                <div className="relative flex-1 w-full px-3 py-1">
                  <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider text-left">
                    What are you designing?
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Search className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Modern living room, Japandi kitchen..."
                      className="w-full text-sm font-medium focus:outline-none text-stone-900 bg-transparent"
                    />
                  </div>
                </div>

                <div className="h-8 w-px bg-sand-200 hidden md:block" />

                {/* Style Dropdown */}
                <div className="w-full md:w-48 px-3 py-1 text-left">
                  <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Aesthetic Style
                  </span>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full text-sm font-medium text-stone-800 focus:outline-none bg-transparent cursor-pointer mt-0.5"
                  >
                    <option value="All">All Aesthetics</option>
                    <option value="Japandi">Japandi</option>
                    <option value="Modern Minimalist">Modern Minimalist</option>
                    <option value="Scandinavian">Scandinavian</option>
                    <option value="Luxury Contemporary">Luxury Contemporary</option>
                    <option value="Mid-Century Modern">Mid-Century Modern</option>
                  </select>
                </div>

                <div className="h-8 w-px bg-sand-200 hidden md:block" />

                {/* Location Dropdown */}
                <div className="w-full md:w-40 px-3 py-1 text-left">
                  <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Location
                  </span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full text-sm font-medium text-stone-800 focus:outline-none bg-transparent cursor-pointer mt-0.5"
                  >
                    <option value="All">Any Region</option>
                    <option value="New York">New York, NY</option>
                    <option value="Brooklyn">Brooklyn, NY</option>
                    <option value="San Francisco">San Francisco, CA</option>
                    <option value="Austin">Austin, TX</option>
                    <option value="Seattle">Seattle, WA</option>
                  </select>
                </div>

                {/* Action CTA */}
                <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto px-7 rounded-2xl shrink-0">
                  Find Designers
                </Button>
              </div>
            </form>

            {/* Quick Hero Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-stone-500">
              <span className="font-semibold text-stone-700">Trending Now:</span>
              {['Warm Japandi', 'Calacatta Kitchens', 'Microcement Baths', 'Curved Bouclé', 'Acoustic Slat Walls'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setCurrentView('explore')}
                  className="px-2.5 py-1 rounded-full bg-sand-200/70 hover:bg-sand-300/80 text-stone-800 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Proposition: For Homeowners & For Designers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Homeowners */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sand-100 to-sand-200/70 p-8 sm:p-10 border border-sand-300 flex flex-col justify-between">
            <div>
              <Badge variant="clay" className="mb-4">For Homeowners</Badge>
              <h2 className="font-serif text-3xl font-bold text-stone-900 mb-3">
                Design Your Dream Sanctuary
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Browse verified interior designers, request bespoke 3D proposals, manage project milestones in escrow, and access designer trade discounts up to 30% on furniture.
              </p>
              <ul className="space-y-2.5 text-xs text-stone-700 mb-8 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Photorealistic 3D renders before making any purchase
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Guaranteed milestone delivery with held escrow funds
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Instant consultation booking with top-rated studios
                </li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={onOpenPostProject}>
                Post a Project Inquiry
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('designers')}>
                Browse Designers
              </Button>
            </div>
          </div>

          {/* Card 2: Designers */}
          <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-sand-50 p-8 sm:p-10 border border-stone-800 flex flex-col justify-between">
            <div>
              <Badge variant="clay" className="bg-clay-900/60 text-clay-200 border-clay-700 mb-4">For Designers</Badge>
              <h2 className="font-serif text-3xl font-bold text-white mb-3">
                Grow Your Architectural Studio
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed mb-6">
                Connect with qualified residential clients, showcase your high-resolution portfolio, send automated itemized proposals, and receive direct invoice payments.
              </p>
              <ul className="space-y-2.5 text-xs text-stone-300 mb-8 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Verified studio badge with exclusive leads inbox
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Integrated deliverables portal: Floor plans, 3D scenes & FF&E
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Automated milestone invoicing with fast payouts
                </li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => setCurrentView('designer-dashboard')}
                className="bg-clay-600 hover:bg-clay-700 text-white"
              >
                Access Designer Studio
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('how-it-works')}
                className="border-stone-700 text-sand-200 hover:bg-stone-800"
              >
                Studio Guidelines
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Interior Designers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Curated Talent</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
              Featured Interior Designers
            </h2>
            <p className="text-stone-500 text-sm mt-1.5">
              Handpicked studios celebrated for spatial innovation, craftsmanship, and client satisfaction.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentView('designers')}
            className="self-start md:self-auto text-xs"
          >
            View All Verified Designers <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designers.map((d) => (
            <div
              key={d.id}
              onClick={() => onOpenDesignerDetail(d.id)}
              className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-sand-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Cover Image & Avatar */}
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src={d.cover_image}
                    alt={d.studio_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="clay" className="bg-stone-900/80 text-sand-50 border-stone-800 backdrop-blur-md">
                      {d.price_range}
                    </Badge>
                  </div>
                  <div className="absolute -bottom-5 left-4">
                    <img
                      src={d.avatar}
                      alt={d.designer_name}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="pt-7 p-5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-medium text-stone-500">{d.location}</span>
                    <span className="text-stone-300">•</span>
                    <RatingStars rating={d.rating} count={d.review_count} />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-clay-700 transition-colors line-clamp-1">
                    {d.studio_name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1 mb-3">
                    {d.tagline}
                  </p>

                  {/* Style Badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {d.styles?.slice(0, 2).map((s, i) => (
                      <span key={i} className="text-[11px] bg-sand-100 text-stone-700 px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-sand-100 bg-sand-50/50 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">From</span>
                  <p className="font-serif font-bold text-stone-900 text-sm">
                    ${d.hourly_rate}<span className="text-stone-500 text-xs font-normal">/hr</span>
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBooking(d);
                    }}
                    className="text-xs px-2.5 py-1"
                  >
                    Book Call
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onOpenDesignerDetail(d.id)}
                    className="text-xs px-2.5 py-1"
                  >
                    Profile
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Style Quiz Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-sand-200/90 border border-sand-300 overflow-hidden p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-300 text-stone-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-clay-600" />
              <span>Free 2-Minute Discovery Tool</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Not sure which aesthetic fits your lifestyle?
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Take our 5-question visual style quiz. Discover your custom interior aesthetic, curated color palette swatches, material recommendations, and matched designers.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentView('quiz')}
                className="gap-2"
              >
                Take the Style Quiz <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="w-full md:w-80 bg-white p-5 rounded-2xl shadow-lg border border-sand-200 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Sample Aesthetic Match</span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center font-serif font-bold text-stone-900 text-xl border border-sand-200">
                94%
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-base">Warm Japandi Oasis</h4>
                <p className="text-xs text-stone-500">Scandinavian Light + Japanese Zen</p>
              </div>
            </div>
            <div className="flex gap-1.5 pt-1">
              {['#F4F1EA', '#D7CEC7', '#8C7B6B', '#3E3730', '#6B705C'].map((hex, i) => (
                <div key={i} className="h-6 flex-1 rounded-md shadow-xs" style={{ backgroundColor: hex }} />
              ))}
            </div>
            <p className="text-[11px] text-stone-500 italic">"Clean lines, low furniture profiles, tactile bouclé & white oak."</p>
          </div>
        </div>
      </section>

      {/* Trending Design Inspiration Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Visual Inspiration</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
              Trending Interior Spaces
            </h2>
            <p className="text-stone-500 text-sm mt-1.5">
              Explore curated spaces by verified designers. Click to inspect materials, dimensions, and color harmonies.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentView('explore')}
            className="self-start md:self-auto text-xs"
          >
            Explore Full Gallery <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenRoomDetail(item)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-sand-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="relative h-64 overflow-hidden bg-stone-100">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge variant="clay" className="bg-stone-900/80 text-sand-50 border-stone-800 backdrop-blur-md">
                    {item.room_type}
                  </Badge>
                  <Badge variant="sage" className="bg-stone-900/80 text-sand-50 border-stone-800 backdrop-blur-md">
                    {item.style}
                  </Badge>
                </div>
                <button
                  onClick={(e) => handleLike(item.id, e)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-red-600 shadow-md transition-colors"
                >
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base mb-1.5 group-hover:text-clay-700 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-stone-600">
                  <span className="font-medium text-stone-900">By {item.designer_name}</span>
                  <span className="text-clay-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Inspect Space <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Renovation Cost Estimator Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-900 text-sand-50 p-8 sm:p-12 border border-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-clay-400">
                Transparent Budget Planning
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Estimate Your Room Renovation Budget in Seconds
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed">
                Wondering how much bespoke carpentry, 3D architecture, and furniture will cost? Use our interactive calculator for real-world material and labor estimates.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => setCurrentView('estimator')}
                  className="bg-clay-600 hover:bg-clay-700 text-white gap-2"
                >
                  Launch Full Calculator <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Live Mini Calculator Widget */}
            <div className="lg:col-span-6 bg-stone-850 p-6 rounded-2xl border border-stone-700/80 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                    Room Space
                  </label>
                  <select
                    value={estRoom}
                    onChange={(e) => setEstRoom(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Master Bedroom">Master Bedroom</option>
                    <option value="Bathroom">Bathroom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                    Finish Level
                  </label>
                  <select
                    value={estTier}
                    onChange={(e) => setEstTier(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="standard">Standard Finish</option>
                    <option value="premium">Premium Bespoke</option>
                    <option value="luxury">Ultra-Luxury Architectural</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Room Area</span>
                  <span className="text-white font-semibold">{estSqft} sq ft</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="25"
                  value={estSqft}
                  onChange={(e) => setEstSqft(parseInt(e.target.value))}
                  className="w-full accent-clay-500 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-400 uppercase">Estimated Total Cost</span>
                  <p className="font-serif text-3xl font-bold text-clay-400">${estTotal.toLocaleString()}</p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setCurrentView('estimator')}
                  className="text-xs"
                >
                  View Breakdown
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Simplicity & Trust</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            How Interior Hub Works
          </h2>
          <div className="flex justify-center pt-2">
            <div className="bg-sand-200 p-1 rounded-xl flex">
              <button
                onClick={() => setHowItWorksTab('homeowner')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  howItWorksTab === 'homeowner' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                For Homeowners
              </button>
              <button
                onClick={() => setHowItWorksTab('designer')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  howItWorksTab === 'designer' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                For Interior Designers
              </button>
            </div>
          </div>
        </div>

        {howItWorksTab === 'homeowner' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Discover & Quiz',
                desc: 'Take the Style Quiz or browse verified studios to pinpoint your ideal interior aesthetic and price tier.'
              },
              {
                step: '02',
                title: 'Book & Brief',
                desc: 'Book a 45-min virtual call or post a project inquiry with room dimensions, floor plan, and target budget.'
              },
              {
                step: '03',
                title: 'Review 3D Renders',
                desc: 'Receive photorealistic 3D visual scenes, custom cabinetry specs, and exact FF&E buying links with trade discounts.'
              },
              {
                step: '04',
                title: 'Turnkey Realization',
                desc: 'Release milestone funds as deliverables are completed. Enjoy your newly realized architectural sanctuary.'
              }
            ].map(item => (
              <div key={item.step} className="p-6 rounded-2xl bg-white border border-sand-200 shadow-xs relative">
                <span className="font-serif text-3xl font-bold text-clay-400 block mb-2">{item.step}</span>
                <h4 className="font-serif font-bold text-stone-900 text-lg mb-1">{item.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Apply & Verify',
                desc: 'Set up your studio portfolio, design philosophy, hourly rates, and pass our verification screening.'
              },
              {
                step: '02',
                title: 'Receive Client Leads',
                desc: 'Review incoming homeowner project inquiries and consultation bookings tailored to your specialties.'
              },
              {
                step: '03',
                title: 'Send Proposals',
                desc: 'Pitch your design concept with itemized scopes, milestone roadmap, and professional contract terms.'
              },
              {
                step: '04',
                title: 'Deliver & Get Paid',
                desc: 'Upload 3D renders and drawings to the client workspace. Issue automated invoices with guaranteed payout.'
              }
            ].map(item => (
              <div key={item.step} className="p-6 rounded-2xl bg-stone-900 text-sand-50 border border-stone-800 shadow-xs relative">
                <span className="font-serif text-3xl font-bold text-clay-500 block mb-2">{item.step}</span>
                <h4 className="font-serif font-bold text-white text-lg mb-1">{item.title}</h4>
                <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
