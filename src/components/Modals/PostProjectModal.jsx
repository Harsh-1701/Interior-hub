import React, { useState } from 'react';
import { X, Upload, Home, DollarSign, MapPin, Sparkles, Clock, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export function PostProjectModal({ isOpen, onClose, designerId, prefill, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState(prefill?.title || '');
  const [roomType, setRoomType] = useState(prefill?.roomType || 'Living Room');
  const [stylePreference, setStylePreference] = useState(prefill?.style || 'Modern Minimalist');
  const [budget, setBudget] = useState(prefill?.budget || 35000);
  const [squareFeet, setSquareFeet] = useState(prefill?.squareFeet || 450);
  const [location, setLocation] = useState(user?.location || 'New York, NY');
  const [timeline, setTimeline] = useState('2-3 Months');
  const [description, setDescription] = useState(prefill?.description || '');
  const [floorPlanUrl, setFloorPlanUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const roomTypes = ['Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom', 'Dining Room', 'Home Office', 'Full Home 2BHK', 'Full Home 3BHK'];
  const styles = ['Modern Minimalist', 'Japandi', 'Scandinavian', 'Luxury Contemporary', 'Mid-Century Modern', 'Bohemian Chic', 'Industrial Loft'];
  const timelines = ['Immediately', '1-2 Months', '2-3 Months', '3-6 Months', 'Flexible'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      showToast('Please enter a project title', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createProject({
        homeowner_id: user.id,
        designer_id: designerId || null,
        title,
        room_type: roomType,
        style_preference: stylePreference,
        square_feet: parseInt(squareFeet),
        budget: parseFloat(budget),
        location,
        timeline,
        description,
        floor_plan_url: floorPlanUrl || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
      });

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 }
      });

      showToast('Project published! Verified designers can now review and submit proposals.', 'success');
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      showToast('Failed to post project. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create local preview or mock URL
      const mockUrl = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80';
      setFloorPlanUrl(mockUrl);
      showToast(`Attached floor plan: ${file.name}`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200 bg-sand-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Homeowner Project Creator</span>
            <h3 className="font-serif text-2xl text-stone-900 mt-0.5">
              {designerId ? 'Request Quote from Designer' : 'Post a New Renovation Project'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-sand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tribeca Pre-War Loft Living Room & Kitchen Redesign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            />
          </div>

          {/* Room Type & Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Room Category
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white"
              >
                {roomTypes.map(rt => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Preferred Aesthetic
              </label>
              <select
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white"
              >
                {styles.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget & Square Footage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Target Budget ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Approximate Area (Sq Ft)
              </label>
              <div className="relative">
                <Home className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="50"
                  max="10000"
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                City / Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Desired Timeline
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white appearance-none"
                >
                  {timelines.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Project Description & Requirements
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell designers about your lifestyle, design goals, preferred materials, must-have features (e.g. custom shelving, kitchen island, dimmable ambient lights)..."
              className="w-full p-3.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            ></textarea>
          </div>

          {/* Floor Plan / Reference Image Attachment */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Attach Floor Plan or Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-sand-300 rounded-xl p-4 text-center hover:border-clay-500 transition-colors bg-sand-50/50">
              <input
                type="file"
                id="file-upload"
                onChange={handleSimulateUpload}
                className="hidden"
                accept="image/*,.pdf"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 text-stone-400 mb-1" />
                <span className="text-xs font-medium text-stone-700">Click to upload architectural layout or room photo</span>
                <span className="text-[11px] text-stone-400 mt-0.5">PNG, JPG, or PDF up to 25MB</span>
              </label>
              {floorPlanUrl && (
                <div className="mt-2 text-xs font-medium text-emerald-700 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Floor plan file attached
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} variant="primary" className="px-6">
              Publish Project & Get Proposals
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
