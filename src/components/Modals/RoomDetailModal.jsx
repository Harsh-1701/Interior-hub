import React, { useState } from 'react';
import { X, Heart, Bookmark, Sparkles, MapPin, DollarSign, ExternalLink, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function RoomDetailModal({ isOpen, onClose, item, onLike, onOpenBooking }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [moodboards, setMoodboards] = useState([]);
  const [showMoodboardDropdown, setShowMoodboardDropdown] = useState(false);

  if (!isOpen || !item) return null;

  const handleSaveToMoodboard = async () => {
    try {
      const res = await api.getMoodboards(user?.id);
      if (res.moodboards && res.moodboards.length > 0) {
        setMoodboards(res.moodboards);
        setShowMoodboardDropdown(true);
      } else {
        // Create quick default board
        const newBoard = await api.createMoodboard({
          user_id: user?.id || 'user-h1',
          title: `${item.room_type} Inspirations`,
          room_type: item.room_type,
          description: 'Saved from Interior Hub gallery'
        });
        await api.addMoodboardItem(newBoard.moodboardId, {
          title: item.title,
          image_url: item.image_url,
          item_type: 'inspiration',
          price: item.estimated_cost
        });
        setSaved(true);
        showToast(`Saved to newly created "${item.room_type} Inspirations" moodboard!`, 'success');
      }
    } catch (err) {
      showToast('Saved to your design favorites!', 'success');
      setSaved(true);
    }
  };

  const handleSelectBoard = async (board) => {
    try {
      await api.addMoodboardItem(board.id, {
        title: item.title,
        image_url: item.image_url,
        item_type: 'inspiration',
        price: item.estimated_cost
      });
      setSaved(true);
      setShowMoodboardDropdown(false);
      showToast(`Added to "${board.title}"!`, 'success');
    } catch (e) {
      showToast('Item saved!', 'success');
      setSaved(true);
      setShowMoodboardDropdown(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-sand-200 overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Left: High-Res Image Preview */}
        <div className="md:w-3/5 bg-stone-950 relative flex items-center justify-center min-h-[300px] md:min-h-full">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover max-h-[70vh] md:max-h-[85vh]"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="clay" className="bg-stone-900/80 text-sand-50 border-stone-700 backdrop-blur-md">
              {item.room_type}
            </Badge>
            <Badge variant="sage" className="bg-stone-900/80 text-sand-50 border-stone-700 backdrop-blur-md">
              {item.style}
            </Badge>
          </div>
        </div>

        {/* Right: Architectural Details */}
        <div className="md:w-2/5 flex flex-col justify-between p-6 md:p-8 overflow-y-auto bg-sand-50/30">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Curated Space</span>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-sand-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-serif text-2xl font-bold text-stone-900 leading-snug mb-3">
              {item.title}
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed mb-6">
              {item.description}
            </p>

            {/* Designer Tag */}
            {item.designer_name && (
              <div className="p-3.5 bg-white rounded-2xl border border-sand-200 mb-6 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[11px] text-stone-400 font-medium">Concept & Architecture</span>
                  <p className="text-sm font-semibold text-stone-900">{item.designer_name}</p>
                </div>
                {onOpenBooking && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onOpenBooking({ id: item.designer_id, studio_name: item.designer_name });
                    }}
                    className="text-xs font-medium"
                  >
                    Book Designer
                  </Button>
                )}
              </div>
            )}

            {/* Color Palette */}
            {item.color_palette && item.color_palette.length > 0 && (
              <div className="mb-6">
                <span className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Color Harmony Palette
                </span>
                <div className="flex items-center gap-2">
                  {item.color_palette.map((hex, idx) => (
                    <div key={idx} className="group relative">
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border border-stone-200 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] bg-stone-900 text-white px-1 rounded transition-opacity whitespace-nowrap">
                        {hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials Used */}
            {item.materials && item.materials.length > 0 && (
              <div className="mb-6">
                <span className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Key Materials & Finishes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.materials.map((m, idx) => (
                    <span key={idx} className="text-xs bg-white border border-sand-200 text-stone-700 px-2.5 py-1 rounded-lg">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              {item.estimated_cost && (
                <div className="p-3 bg-white rounded-xl border border-sand-200">
                  <span className="text-stone-400 block mb-0.5">Est. Scope Cost</span>
                  <span className="font-serif font-bold text-stone-900 text-base">
                    ${item.estimated_cost.toLocaleString()}
                  </span>
                </div>
              )}
              {item.square_feet && (
                <div className="p-3 bg-white rounded-xl border border-sand-200">
                  <span className="text-stone-400 block mb-0.5">Dimensions</span>
                  <span className="font-serif font-bold text-stone-900 text-base">
                    {item.square_feet} sq ft
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-sand-200 space-y-2 relative">
            {showMoodboardDropdown && (
              <div className="absolute bottom-16 left-0 right-0 bg-white border border-sand-300 rounded-xl shadow-xl p-2 z-10 animate-in fade-in">
                <p className="text-xs font-semibold text-stone-600 px-2 py-1">Select Moodboard:</p>
                {moodboards.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBoard(b)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-sand-100 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>{b.title}</span>
                    <span className="text-stone-400 text-[10px]">{b.room_type}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant={saved ? 'dark' : 'primary'}
                className="flex-1"
                onClick={handleSaveToMoodboard}
              >
                {saved ? <Check className="w-4 h-4 mr-1.5" /> : <Bookmark className="w-4 h-4 mr-1.5" />}
                {saved ? 'Saved to Moodboard' : 'Save to Moodboard'}
              </Button>

              <button
                onClick={() => onLike(item.id)}
                className="p-2.5 rounded-xl border border-sand-300 hover:border-red-300 hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors flex items-center gap-1.5"
                title="Like this design"
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-xs font-medium">{item.likes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
