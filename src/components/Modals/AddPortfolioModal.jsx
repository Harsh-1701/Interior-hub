import React, { useState } from 'react';
import { X, Upload, Image, DollarSign, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AddPortfolioModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Living Room');
  const [style, setStyle] = useState('Modern Minimalist');
  const [budget, setBudget] = useState(42000);
  const [squareFeet, setSquareFeet] = useState(850);
  const [location, setLocation] = useState('New York, NY');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80');
  const [beforeImage, setBeforeImage] = useState('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const categories = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Dining Room', 'Home Office', 'Full Home'];
  const styles = ['Modern Minimalist', 'Japandi', 'Scandinavian', 'Luxury Contemporary', 'Mid-Century Modern', 'Bohemian Chic', 'Industrial Loft'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !coverImage) {
      showToast('Title and cover image are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const designerId = user.designerProfile?.id || user.id;
      const res = await api.addPortfolio(designerId, {
        title,
        category,
        style,
        budget: parseFloat(budget),
        square_feet: parseInt(squareFeet),
        location,
        cover_image: coverImage,
        images: [coverImage],
        before_image: beforeImage || null,
        after_image: coverImage,
        description
      });

      showToast(`Project "${title}" added to your public portfolio!`, 'success');
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      showToast('Failed to add portfolio item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200 bg-sand-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Portfolio Showcase</span>
            <h3 className="font-serif text-2xl text-stone-900 mt-0.5">Add Project to Showcase</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-sand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tribeca Contemporary Penthouse Living"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Room Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Interior Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white"
              >
                {styles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Approximate Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Square Footage
              </label>
              <div className="relative">
                <Home className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Cover Image URL *
            </label>
            <input
              type="url"
              required
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            />
            {coverImage && (
              <img src={coverImage} alt="Preview" className="mt-2 h-28 w-full object-cover rounded-lg border border-sand-200" />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Before Transformation Image URL (Optional)
            </label>
            <input
              type="url"
              value={beforeImage}
              onChange={(e) => setBeforeImage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Project Brief & Description
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight the architectural challenges, materials used, custom millwork, and overall client vision..."
              className="w-full p-3.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} variant="primary" className="px-6">
              Publish to Portfolio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
