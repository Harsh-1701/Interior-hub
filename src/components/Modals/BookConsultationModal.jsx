import React, { useState } from 'react';
import { X, Calendar, Clock, Video, MapPin, Sparkles, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export function BookConsultationModal({ isOpen, onClose, designer, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [serviceType, setServiceType] = useState('Virtual Video Call (45m)');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [time, setTime] = useState('02:00 PM');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !designer) return null;

  const consultationOptions = [
    {
      id: 'Virtual Video Call (45m)',
      title: 'Virtual Design Call',
      duration: '45 mins',
      price: designer.hourly_rate ? Math.round(designer.hourly_rate * 0.75) : 150,
      icon: Video,
      desc: 'One-on-one video session to evaluate photos, spatial layout, and preliminary styling direction.'
    },
    {
      id: 'On-Site Space Assessment (90m)',
      title: 'In-Person Assessment',
      duration: '90 mins',
      price: designer.hourly_rate ? Math.round(designer.hourly_rate * 1.5) : 280,
      icon: MapPin,
      desc: 'On-location walkthrough in your home to laser-measure, assess natural lighting, and review architectural potential.'
    },
    {
      id: 'Comprehensive Full-Home Consultation',
      title: 'Complete Masterplan Session',
      duration: '3 hours',
      price: designer.hourly_rate ? Math.round(designer.hourly_rate * 2.8) : 450,
      icon: Sparkles,
      desc: 'Deep-dive spatial overhaul covering full floor plans, structural feasibility, budget roadmap, and contractor coordination.'
    }
  ];

  const timeSlots = ['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM'];

  const selectedOption = consultationOptions.find(o => o.id === serviceType) || consultationOptions[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.bookConsultation({
        homeowner_id: user.id,
        designer_id: designer.id || designer.user_id,
        service_type: serviceType,
        date,
        time,
        price: selectedOption.price,
        notes: notes || `Consultation request with ${designer.studio_name || designer.name}`
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      showToast(`Consultation successfully booked with ${designer.studio_name || designer.designer_name}!`, 'success');
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      showToast('Failed to book consultation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200 bg-sand-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Direct Booking</span>
            <h3 className="font-serif text-2xl text-stone-900 mt-0.5">
              Book a Consultation with {designer.studio_name || designer.designer_name}
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Service Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
              1. Select Consultation Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {consultationOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = serviceType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setServiceType(opt.id)}
                    className={`cursor-pointer p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-clay-600 bg-clay-50/50 ring-2 ring-clay-600/20 shadow-sm'
                        : 'border-sand-200 hover:border-sand-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-clay-600 text-white' : 'bg-sand-100 text-stone-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-serif font-bold text-stone-900">${opt.price}</span>
                    </div>
                    <h4 className="font-medium text-stone-900 text-sm mb-1">{opt.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2">{opt.desc}</p>
                    <span className="inline-block mt-2 text-[11px] font-semibold text-stone-600 bg-sand-100 px-2 py-0.5 rounded">
                      {opt.duration}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                2. Preferred Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                3. Preferred Time Slot
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white appearance-none"
                >
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              4. Project Goals / Space Details (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tribeca apartment living room, hoping for Japandi aesthetic, looking to replace flooring and lighting..."
              className="w-full p-3.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            ></textarea>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-sand-100/70 p-4 rounded-xl border border-sand-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500">Total Consultation Fee</p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold text-stone-900">${selectedOption.price}</span>
                <span className="text-xs text-stone-600">({selectedOption.duration} included)</span>
              </div>
            </div>
            <div className="text-right text-xs text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              Direct Instant Confirmation
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} variant="primary" className="px-6">
              Confirm & Book Session
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
