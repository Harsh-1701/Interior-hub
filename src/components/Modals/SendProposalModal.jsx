import React, { useState } from 'react';
import { X, DollarSign, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export function SendProposalModal({ isOpen, onClose, project, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [amount, setAmount] = useState(3800);
  const [estimatedWeeks, setEstimatedWeeks] = useState(4);
  const [scopeDescription, setScopeDescription] = useState('');
  const [deliverablesSummary, setDeliverablesSummary] = useState(
    '2D Floor Plans, 3D Architectural Renders, Full Material Moodboard, FF&E Procurement Schedule with Trade Discounts'
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.submitProposal({
        project_id: project.id,
        designer_id: user.designerProfile?.id || user.id,
        amount: parseFloat(amount),
        estimated_weeks: parseInt(estimatedWeeks),
        scope_description: scopeDescription || `Comprehensive bespoke interior design package for ${project.title}.`,
        deliverables_summary: deliverablesSummary
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      showToast(`Proposal of $${amount.toLocaleString()} submitted to ${project.homeowner_name || 'homeowner'}!`, 'success');
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      showToast('Failed to submit proposal. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200 bg-sand-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Designer Lead Response</span>
            <h3 className="font-serif text-2xl text-stone-900 mt-0.5">Submit Project Proposal</h3>
            <p className="text-xs text-stone-500 mt-1">For: {project.title} ({project.room_type})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-sand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Proposed Design Fee ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  required
                  min="500"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Estimated Duration (Weeks)
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  required
                  min="1"
                  max="52"
                  value={estimatedWeeks}
                  onChange={(e) => setEstimatedWeeks(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Deliverables Package Breakdown
            </label>
            <textarea
              rows="2"
              value={deliverablesSummary}
              onChange={(e) => setDeliverablesSummary(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Design Vision & Scope Pitch
            </label>
            <textarea
              rows="3"
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              placeholder="Outline your approach to their spatial aesthetic, material recommendations, and how you will optimize their budget..."
              className="w-full p-3.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
            ></textarea>
          </div>

          <div className="bg-sand-50 p-3.5 rounded-xl border border-sand-200 text-xs text-stone-600 space-y-1">
            <div className="flex items-center gap-2 font-medium text-stone-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Standard Escrow Protection
            </div>
            <p>Upon homeowner acceptance, a 40% initial retainer will be generated and held securely until Phase 1 approval.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} variant="primary" className="px-6">
              Send Official Proposal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
