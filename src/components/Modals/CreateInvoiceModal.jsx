import React, { useState } from 'react';
import { X, DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function CreateInvoiceModal({ isOpen, onClose, projects = [], preselectedProject, onSuccess }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [projectId, setProjectId] = useState(preselectedProject?.id || (projects[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { desc: 'Phase Milestone Deliverables & 3D Renders', amount: 2500 }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const totalAmount = items.reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);

  const handleAddItem = () => {
    setItems(prev => [...prev, { desc: '', amount: 500 }]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, val) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      showToast('Please select a project', 'error');
      return;
    }
    if (!title) {
      showToast('Please enter an invoice title', 'error');
      return;
    }
    if (totalAmount <= 0) {
      showToast('Invoice amount must be greater than zero', 'error');
      return;
    }

    setLoading(true);
    try {
      const selectedProj = projects.find(p => p.id === projectId) || preselectedProject;
      const res = await api.createInvoice({
        project_id: projectId,
        designer_id: user.designerProfile?.id || user.id,
        homeowner_id: selectedProj?.homeowner_id,
        title,
        amount: totalAmount,
        due_date: dueDate,
        items
      });

      showToast(`Invoice for $${totalAmount.toLocaleString()} generated and sent to homeowner!`, 'success');
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      showToast('Failed to create invoice. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200 bg-sand-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Billing & Accounting</span>
            <h3 className="font-serif text-2xl text-stone-900 mt-0.5">Create Client Invoice</h3>
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
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Select Client Project *
            </label>
            <select
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm bg-white"
            >
              {projects.length === 0 && <option value="">No active projects</option>}
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.homeowner_name || 'Client'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Invoice Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Phase 2 3D Renderings & Lighting Plan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Payment Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Line Items Breakdown
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-clay-600 hover:text-clay-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Item description (e.g. Joinery CAD drawings)"
                    value={it.desc}
                    onChange={(e) => handleItemChange(idx, 'desc', e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-1 focus:ring-clay-500"
                  />
                  <div className="relative w-32">
                    <DollarSign className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="50"
                      value={it.amount}
                      onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-1 focus:ring-clay-500"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-sand-100/70 p-4 rounded-xl border border-sand-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-700">Total Invoice Amount:</span>
            <span className="font-serif text-2xl font-bold text-stone-900">${totalAmount.toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} variant="primary" className="px-6">
              Generate & Issue Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
