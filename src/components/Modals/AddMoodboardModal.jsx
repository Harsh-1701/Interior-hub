import React, { useState } from 'react';
import { X, Palette } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AddMoodboardModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [roomType, setRoomType] = useState('Living Room');
  const [description, setDescription] = useState('');
  const [palette, setPalette] = useState(['#E6DFD5', '#C2B29F', '#8C7B6B', '#3E3730']);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const roomTypes = ['Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom', 'Dining Room', 'Home Office', 'Full Home'];

  const presetPalettes = [
    ['#E6DFD5', '#C2B29F', '#8C7B6B', '#3E3730'], // Japandi Warm
    ['#F4F1EA', '#D6C7B2', '#5A6258', '#252924'], // Nordic Sage
    ['#FFFFFF', '#D9D5CF', '#5B4345', '#1B1B1B'], // Calacatta Modern
    ['#DF825F', '#ECCEB3', '#495244', '#2C2B29'], // Terracotta Bohemian
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      showToast('Title is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createMoodboard({
        user_id: user.id,
        title,
        room_type: roomType,
        description,
        palette
      });

      showToast(`Moodboard "${title}" created!`, 'success');
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      showToast('Failed to create moodboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200 bg-sand-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Design Studio</span>
            <h3 className="font-serif text-2xl text-stone-900 mt-0.5">Create New Moodboard</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-sand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Moodboard Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Bedroom Sanctuary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Room Category
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white"
            >
              {roomTypes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Color Palette Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presetPalettes.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setPalette(p)}
                  className={`p-2 rounded-xl border cursor-pointer flex items-center gap-1.5 transition-all ${
                    JSON.stringify(palette) === JSON.stringify(p)
                      ? 'border-clay-600 ring-2 ring-clay-600/20 bg-clay-50/30'
                      : 'border-sand-200 hover:border-sand-300'
                  }`}
                >
                  {p.map((hex, i) => (
                    <div key={i} className="w-6 h-6 rounded-md shadow-inner" style={{ backgroundColor: hex }} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Vision & Concept Notes
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the mood, lighting, furniture textures you want to pin here..."
              className="w-full p-3.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} variant="primary" className="px-6">
              Create Moodboard
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
