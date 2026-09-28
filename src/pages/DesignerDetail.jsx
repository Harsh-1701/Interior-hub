import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Video,
  MessageSquare,
  Check,
  ArrowLeft,
  Sliders,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RatingStars } from '../components/ui/RatingStars';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function DesignerDetail({
  designerId,
  onBack,
  onOpenBooking,
  onOpenQuote,
  onOpenChat
}) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'packages' | 'reviews' | 'about'

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newRoomType, setNewRoomType] = useState('Living Room');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Before / After toggle state for portfolio items
  const [activeImageMode, setActiveImageMode] = useState({});

  useEffect(() => {
    async function loadDesigner() {
      setLoading(true);
      try {
        const res = await api.getDesigner(designerId);
        if (res.designer) {
          setDesigner(res.designer);
        }
      } catch (err) {
        console.error('Error loading designer detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDesigner();
  }, [designerId]);

  const toggleImageMode = (itemId, mode) => {
    setActiveImageMode(prev => ({ ...prev, [itemId]: mode }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment) {
      showToast('Please enter your review feedback', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.addReview(designer.id, {
        homeowner_id: user?.id || 'user-h1',
        rating: newRating,
        comment: newComment,
        project_title: newProjectTitle || 'Residential Interior Design',
        room_type: newRoomType
      });

      showToast('Thank you! Your verified review has been published.', 'success');
      setShowReviewModal(false);
      setNewComment('');
      setNewProjectTitle('');

      // Reload profile
      const updated = await api.getDesigner(designerId);
      if (updated.designer) setDesigner(updated.designer);
    } catch (err) {
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-64 bg-sand-200 rounded-3xl" />
        <div className="h-40 bg-sand-200 rounded-2xl" />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold">Designer Not Found</h2>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          Return to Designers Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Designers Directory
      </button>

      {/* Header Profile Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-sand-200 shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-64 sm:h-80 bg-stone-900 overflow-hidden">
          <img
            src={designer.cover_image}
            alt={designer.studio_name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant="clay" className="bg-stone-900/80 text-sand-50 border-stone-800 backdrop-blur-md">
              {designer.price_range} Tier
            </Badge>
            {designer.verified === 1 && (
              <Badge variant="emerald" className="bg-stone-900/80 text-emerald-300 border-stone-800 backdrop-blur-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Studio
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="p-6 sm:p-8 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16">
            <img
              src={designer.avatar}
              alt={designer.designer_name}
              className="w-28 h-28 rounded-3xl border-4 border-white object-cover shadow-xl bg-white"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {designer.studio_name}
                </h1>
              </div>
              <p className="text-xs font-medium text-stone-600">
                Led by <span className="text-stone-900 font-semibold">{designer.designer_name}</span> • {designer.location}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <RatingStars rating={designer.rating} count={designer.review_count} size="md" />
                <span className="text-stone-300">•</span>
                <span className="text-xs font-semibold text-stone-700">{designer.completed_projects} Projects Delivered</span>
                <span className="text-stone-300">•</span>
                <span className="text-xs font-semibold text-stone-700">{designer.years_experience} Years Exp.</span>
              </div>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChat(designer.user_id)}
              className="text-xs flex-1 md:flex-initial"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-stone-500" /> Message
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenQuote(designer)}
              className="text-xs flex-1 md:flex-initial"
            >
              Request Quote
            </Button>
            <Button
              variant="primary"
              onClick={() => onOpenBooking(designer)}
              className="text-xs flex-1 md:flex-initial shadow-md"
            >
              <Video className="w-3.5 h-3.5 mr-1.5" /> Book Consultation (${Math.round(designer.hourly_rate * 0.75)})
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tabs / Content & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tabs & Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-sand-200 gap-8 text-sm">
            {[
              { id: 'portfolio', label: `Portfolio (${designer.portfolio?.length || 0})` },
              { id: 'packages', label: `Design Packages (${designer.packages?.length || 0})` },
              { id: 'reviews', label: `Client Reviews (${designer.reviews?.length || 0})` },
              { id: 'about', label: 'Studio Philosophy' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-clay-600 text-clay-700'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Portfolio */}
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              {designer.portfolio?.map(item => {
                const currentMode = activeImageMode[item.id] || 'after';
                const hasBefore = Boolean(item.before_image);
                const displayImage = currentMode === 'before' && hasBefore ? item.before_image : item.cover_image;

                return (
                  <div key={item.id} className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-xs space-y-4 p-6">
                    {/* Item Image with Before / After Toggle */}
                    <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-stone-900">
                      <img
                        src={displayImage}
                        alt={item.title}
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />

                      {/* Before / After Selector */}
                      {hasBefore && (
                        <div className="absolute top-4 left-4 bg-stone-900/80 p-1 rounded-xl backdrop-blur-md flex gap-1 z-10 border border-stone-700">
                          <button
                            onClick={() => toggleImageMode(item.id, 'before')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              currentMode === 'before' ? 'bg-clay-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                            }`}
                          >
                            Before
                          </button>
                          <button
                            onClick={() => toggleImageMode(item.id, 'after')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              currentMode === 'after' ? 'bg-clay-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                            }`}
                          >
                            After Transformation
                          </button>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <Badge variant="clay" className="bg-stone-900/80 text-sand-50 border-stone-800 backdrop-blur-md">
                          {item.category}
                        </Badge>
                        <Badge variant="sage" className="bg-stone-900/80 text-sand-50 border-stone-800 backdrop-blur-md">
                          {item.style}
                        </Badge>
                      </div>
                    </div>

                    {/* Project Brief */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="font-serif text-2xl font-bold text-stone-900">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-stone-500">
                          {item.budget && (
                            <span>Budget: <strong className="text-stone-900">${item.budget.toLocaleString()}</strong></span>
                          )}
                          {item.square_feet && (
                            <span>Dimensions: <strong className="text-stone-900">{item.square_feet} sq ft</strong></span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Pricing Packages */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {designer.packages?.map(pkg => (
                  <div
                    key={pkg.id}
                    className={`bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                      pkg.popular ? 'border-clay-600 shadow-xl ring-2 ring-clay-600/20' : 'border-sand-200 shadow-xs'
                    }`}
                  >
                    <div>
                      {pkg.popular === 1 && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-clay-100 text-clay-800 text-[10px] font-bold uppercase tracking-wider mb-3">
                          Most Popular
                        </span>
                      )}
                      <h4 className="font-serif font-bold text-xl text-stone-900 mb-2">
                        {pkg.name}
                      </h4>
                      <p className="text-xs text-stone-500 mb-4">{pkg.description}</p>
                      <div className="mb-6 flex items-baseline gap-1">
                        <span className="font-serif text-3xl font-bold text-stone-900">${pkg.price}</span>
                        <span className="text-xs text-stone-500">/ {pkg.duration}</span>
                      </div>

                      <ul className="space-y-2.5 mb-6 text-xs text-stone-600">
                        {pkg.features?.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant={pkg.popular ? 'primary' : 'outline'}
                      onClick={() => onOpenBooking(designer)}
                      className="w-full text-xs"
                    >
                      Select Package
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Client Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-sand-100 rounded-3xl border border-sand-200">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    {designer.rating} / 5.0
                  </h3>
                  <p className="text-xs text-stone-600">Based on {designer.review_count} verified homeowner reviews</p>
                </div>
                <Button size="sm" variant="dark" onClick={() => setShowReviewModal(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Write a Review
                </Button>
              </div>

              {designer.reviews?.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-sand-200">
                  <p className="text-sm text-stone-600">No reviews yet. Be the first to leave a review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {designer.reviews?.map(rev => (
                    <div key={rev.id} className="p-6 bg-white rounded-2xl border border-sand-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.reviewer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={rev.reviewer_name}
                            className="w-10 h-10 rounded-full object-cover border border-sand-200"
                          />
                          <div>
                            <h4 className="font-semibold text-stone-900 text-sm">{rev.reviewer_name}</h4>
                            <p className="text-[11px] text-stone-400">{rev.project_title} • {rev.room_type}</p>
                          </div>
                        </div>
                        <RatingStars rating={rev.rating} />
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: About & Philosophy */}
          {activeTab === 'about' && (
            <div className="bg-white rounded-3xl p-8 border border-sand-200 space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">About the Studio</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{designer.about}</p>
              </div>

              <div className="pt-4 border-t border-sand-100">
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Design Philosophy</h3>
                <p className="text-sm text-stone-600 leading-relaxed italic border-l-2 border-clay-500 pl-4 py-1">
                  "{designer.design_philosophy}"
                </p>
              </div>

              {designer.awards && designer.awards.length > 0 && (
                <div className="pt-4 border-t border-sand-100">
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">Honors & Accolades</h3>
                  <div className="space-y-2">
                    {designer.awards.map((award, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-stone-700">
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{award}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-sand-200 p-6 shadow-sm sticky top-28 space-y-5">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                Studio Engagement
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-3xl font-bold text-stone-900">${designer.hourly_rate}</span>
                <span className="text-xs text-stone-500">/ billable architectural hour</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-sand-100">
              <Button
                variant="primary"
                onClick={() => onOpenBooking(designer)}
                className="w-full py-3 text-sm shadow-md"
              >
                <Video className="w-4 h-4 mr-2" /> Book Consultation Call
              </Button>

              <Button
                variant="outline"
                onClick={() => onOpenQuote(designer)}
                className="w-full py-2.5 text-xs"
              >
                Request Custom Project Quote
              </Button>

              <Button
                variant="ghost"
                onClick={() => onOpenChat(designer.user_id)}
                className="w-full py-2.5 text-xs text-stone-600"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Send Direct Inquiry
              </Button>
            </div>

            <div className="pt-4 border-t border-sand-100 space-y-3 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Average Response Time</span>
                <span className="font-semibold text-stone-800">Under 2 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Consultation Availability</span>
                <span className="font-semibold text-emerald-700">Available This Week</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Escrow Milestone Protection</span>
                <span className="font-semibold text-stone-800">100% Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-sand-200 shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              Write a Review for {designer.studio_name}
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Overall Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-2 rounded-lg border text-sm font-bold transition-all ${
                        newRating >= star ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-sand-50 border-sand-200'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tribeca Living Room Redesign"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-1 focus:ring-clay-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Review & Feedback *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe your collaboration, communication, 3D visualization accuracy, and final styling results..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-1 focus:ring-clay-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submittingReview} variant="primary">
                  Publish Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
