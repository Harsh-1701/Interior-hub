import React, { useState, useEffect } from 'react';
import { Search, Heart, Sparkles, Filter, ChevronRight, Bookmark } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Explore({ onOpenRoomDetail, onOpenBooking }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [search, setSearch] = useState('');

  const roomCategories = [
    'All',
    'Living Room',
    'Kitchen',
    'Bedroom',
    'Bathroom',
    'Dining Room',
    'Home Office',
    'Outdoor'
  ];

  const styles = [
    'All',
    'Japandi',
    'Modern Minimalist',
    'Scandinavian',
    'Luxury Contemporary',
    'Mid-Century Modern',
    'Bohemian Chic'
  ];

  useEffect(() => {
    async function fetchGallery() {
      setLoading(true);
      try {
        const res = await api.getGallery({
          room_type: selectedRoom,
          style: selectedStyle,
          search
        });
        if (res.gallery) {
          setGallery(res.gallery);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, [selectedRoom, selectedStyle, search]);

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      await api.likeGalleryItem(id, user?.id);
      setGallery(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
      showToast('Liked this design!', 'success');
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Visual Directory</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
          Inspiration Gallery
        </h1>
        <p className="text-stone-600 text-sm">
          Browse real residential interior spaces designed by top verified architects. Pin pieces to your moodboards and explore material specifications.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sand-200 shadow-xs space-y-4">
        {/* Top search & style bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by keywords, materials, designer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-clay-500 bg-sand-50/50"
            />
          </div>

          {/* Style Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-stone-500 whitespace-nowrap mr-1">Style:</span>
            {styles.map(s => (
              <button
                key={s}
                onClick={() => setSelectedStyle(s)}
                className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  selectedStyle === s
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-sand-100 hover:bg-sand-200 text-stone-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Room Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-sand-100 scrollbar-none">
          {roomCategories.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRoom(r)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedRoom === r
                  ? 'bg-clay-600 text-white shadow-xs'
                  : 'bg-sand-50 hover:bg-sand-100 text-stone-600 border border-sand-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-sand-200 rounded-2xl" />
          ))}
        </div>
      ) : gallery.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-sand-200">
          <p className="font-serif text-lg text-stone-700">No rooms match your filter criteria</p>
          <p className="text-xs text-stone-400 mt-1">Try resetting the room category or style filter.</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setSelectedRoom('All'); setSelectedStyle('All'); setSearch(''); }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map(item => (
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

                  {/* Palette Preview */}
                  {item.color_palette && item.color_palette.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {item.color_palette.slice(0, 4).map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-sm border border-stone-200" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-stone-600">
                  <span className="font-medium text-stone-800">By {item.designer_name}</span>
                  <span className="text-clay-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Inspect Space <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
