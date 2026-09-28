import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  DollarSign,
  Users,
  Star,
  Plus,
  Calendar,
  MessageSquare,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Video
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export function DesignerDashboard({
  onOpenCreateInvoice,
  onOpenAddPortfolio,
  onOpenSendProposal
}) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'leads' | 'portfolio' | 'invoices' | 'calendar' | 'messages'
  const [projects, setProjects] = useState([]);
  const [openLeads, setOpenLeads] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Deliverable upload modal inside project view
  const [showDeliverableForm, setShowDeliverableForm] = useState(false);
  const [delTitle, setDelTitle] = useState('');
  const [delCategory, setDelCategory] = useState('3D Render');
  const [delPreviewImage, setDelPreviewImage] = useState('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80');
  const [delDesc, setDelDesc] = useState('');

  const loadDesignerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const designerProfileId = user.designerProfile?.id || user.id;

      const [pRes, lRes, dRes, invRes, cRes, convRes] = await Promise.all([
        api.getProjects({ designer_id: designerProfileId }),
        api.getProjects({ openInquiries: 'true' }),
        api.getDesigner(designerProfileId),
        api.getInvoices({ userId: user.id, role: 'designer' }),
        api.getConsultations(user.id, 'designer'),
        api.getConversations(user.id)
      ]);

      if (pRes.projects) {
        setProjects(pRes.projects);
        if (pRes.projects.length > 0 && !selectedProject) {
          const det = await api.getProject(pRes.projects[0].id);
          setSelectedProject(det.project || pRes.projects[0]);
        }
      }
      if (lRes.projects) setOpenLeads(lRes.projects);
      if (dRes.designer?.portfolio) setPortfolioItems(dRes.designer.portfolio);
      if (invRes.invoices) setInvoices(invRes.invoices);
      if (cRes.consultations) setConsultations(cRes.consultations);
      if (convRes.conversations) {
        setConversations(convRes.conversations);
        if (convRes.conversations.length > 0 && !activeContactId) {
          setActiveContactId(convRes.conversations[0].contact.id);
        }
      }
    } catch (e) {
      console.error('Error loading designer data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignerData();
  }, [user]);

  // Load chat messages when activeContactId changes
  useEffect(() => {
    async function loadThread() {
      if (!activeContactId || !user) return;
      try {
        const res = await api.getThread(activeContactId, user.id);
        if (res.messages) setChatMessages(res.messages);
      } catch (err) {
        console.error('Error loading thread:', err);
      }
    }
    loadThread();
  }, [activeContactId, user]);

  const handleSelectProject = async (pId) => {
    try {
      const res = await api.getProject(pId);
      if (res.project) setSelectedProject(res.project);
    } catch (e) {}
  };

  const handleUpdateProjectStage = async (newStatus, newProgress) => {
    try {
      await api.updateProject(selectedProject.id, {
        status: newStatus,
        progress: newProgress
      });
      showToast(`Project moved to ${newStatus} (${newProgress}%)!`, 'success');
      handleSelectProject(selectedProject.id);
      loadDesignerData();
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const handleToggleMilestone = async (mId, currentStatus) => {
    try {
      await api.toggleMilestone(selectedProject.id, mId, !currentStatus);
      showToast('Milestone updated', 'success');
      handleSelectProject(selectedProject.id);
    } catch (e) {
      showToast('Error updating milestone', 'error');
    }
  };

  const handleAddDeliverable = async (e) => {
    e.preventDefault();
    if (!delTitle) return;

    try {
      await api.addDeliverable(selectedProject.id, {
        designer_id: user.designerProfile?.id || user.id,
        title: delTitle,
        category: delCategory,
        preview_image: delPreviewImage,
        description: delDesc
      });

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      showToast('Deliverable published to client portal!', 'success');
      setShowDeliverableForm(false);
      setDelTitle('');
      setDelDesc('');
      handleSelectProject(selectedProject.id);
    } catch (e) {
      showToast('Error publishing deliverable', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeContactId) return;

    try {
      const res = await api.sendMessage({
        sender_id: user.id,
        receiver_id: activeContactId,
        content: chatInput,
        project_id: selectedProject?.id
      });
      setChatMessages(prev => [...prev, res.message]);
      setChatInput('');
    } catch (e) {
      showToast('Error sending message', 'error');
    }
  };

  const totalEarnings = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, it) => sum + it.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Studio Info */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-700 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {user?.designerProfile?.studio_name || `${user?.name}'s Studio`}
              </h1>
              <Badge variant="clay" className="bg-clay-900 text-clay-200 border-clay-700">Verified Pro</Badge>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Principal Architect: <span className="text-sand-200 font-semibold">{user?.name}</span> • {user?.location}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="primary"
            onClick={() => onOpenCreateInvoice(projects, selectedProject)}
            className="text-xs bg-clay-600 hover:bg-clay-700 text-white"
          >
            <DollarSign className="w-3.5 h-3.5 mr-1" /> Create Invoice
          </Button>
          <Button
            variant="outline"
            onClick={onOpenAddPortfolio}
            className="text-xs border-stone-700 text-sand-200 hover:bg-stone-800"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Portfolio Project
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Active Client Projects
          </span>
          <p className="font-serif text-3xl font-bold text-stone-900">{projects.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">In design / construction</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Total Revenue (Paid)
          </span>
          <p className="font-serif text-3xl font-bold text-clay-700">
            ${(totalEarnings || 42800).toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-500">Via Escrow Milestone Invoicing</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Open Homeowner Inquiries
          </span>
          <p className="font-serif text-3xl font-bold text-stone-900">{openLeads.length}</p>
          <span className="text-[11px] text-clay-600 font-medium">Available for proposal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Studio Rating
          </span>
          <p className="font-serif text-3xl font-bold text-stone-900">
            {user?.designerProfile?.rating || '4.96'} ★
          </p>
          <span className="text-[11px] text-stone-500">{user?.designerProfile?.review_count || 52} verified reviews</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-sand-200 gap-6 text-sm overflow-x-auto scrollbar-none">
        {[
          { id: 'projects', label: `Active Client Projects (${projects.length})`, icon: FolderOpen },
          { id: 'leads', label: `Inquiries & Client Leads (${openLeads.length})`, icon: Sparkles },
          { id: 'portfolio', label: `Portfolio Showcase (${portfolioItems.length})`, icon: Sparkles },
          { id: 'invoices', label: `Billing & Invoices (${invoices.length})`, icon: DollarSign },
          { id: 'calendar', label: `Consultations (${consultations.length})`, icon: Calendar },
          { id: 'messages', label: 'Client Messages', icon: MessageSquare }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm ${
                isActive
                  ? 'border-clay-600 text-clay-700'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Client Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Project Selector */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block px-1">
                Ongoing Engagements
              </span>
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProject(p.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    selectedProject?.id === p.id
                      ? 'border-clay-600 bg-white ring-2 ring-clay-600/20 shadow-md'
                      : 'border-sand-200 hover:border-sand-300 bg-sand-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="clay" size="sm">{p.room_type}</Badge>
                    <span className="text-[11px] font-semibold text-stone-500">{p.status}</span>
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">{p.title}</h4>
                  <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
                    <span>Client: {p.homeowner_name}</span>
                    <span className="font-semibold text-clay-700">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Project Workstation */}
            {selectedProject && (
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-100 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="clay">{selectedProject.room_type}</Badge>
                      <Badge variant="sage">{selectedProject.status}</Badge>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900">
                      {selectedProject.title}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Client: <strong className="text-stone-800">{selectedProject.homeowner_name}</strong> ({selectedProject.homeowner_email})
                    </p>
                  </div>

                  <div className="bg-sand-50 p-3 rounded-xl border border-sand-200 text-right">
                    <span className="text-[10px] uppercase text-stone-400 font-semibold block">Client Budget</span>
                    <span className="font-serif font-bold text-xl text-stone-900">${selectedProject.budget?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Advance Project Phase Buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                    Update Workflow Stage
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { status: 'Concept Phase', progress: 25 },
                      { status: '3D Modeling', progress: 50 },
                      { status: 'Material Selection', progress: 75 },
                      { status: 'In Execution', progress: 90 },
                      { status: 'Completed', progress: 100 }
                    ].map(st => (
                      <button
                        key={st.status}
                        onClick={() => handleUpdateProjectStage(st.status, st.progress)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selectedProject.status === st.status
                            ? 'bg-clay-600 text-white border-clay-600 shadow-xs'
                            : 'bg-sand-50 hover:bg-sand-100 text-stone-700 border-sand-200'
                        }`}
                      >
                        {st.status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deliverables Section + Upload Deliverable Button */}
                <div className="space-y-4 pt-4 border-t border-sand-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-stone-900">
                        Client Deliverables
                      </h3>
                      <p className="text-xs text-stone-500">Photorealistic 3D scene renders, CAD floor plans & schedules</p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setShowDeliverableForm(true)}
                      className="text-xs"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" /> Upload Deliverable
                    </Button>
                  </div>

                  {/* Upload Form Box */}
                  {showDeliverableForm && (
                    <form onSubmit={handleAddDeliverable} className="p-5 bg-sand-50 rounded-2xl border border-sand-300 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif font-bold text-stone-900 text-sm">Add Architectural Deliverable</h4>
                        <button type="button" onClick={() => setShowDeliverableForm(false)} className="text-xs text-stone-400 hover:text-stone-700">Cancel</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase font-semibold text-stone-600 mb-1">Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Master Bedroom 4K Day Renders"
                            value={delTitle}
                            onChange={(e) => setDelTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase font-semibold text-stone-600 mb-1">Category</label>
                          <select
                            value={delCategory}
                            onChange={(e) => setDelCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-white focus:outline-none"
                          >
                            <option value="3D Render">3D Render Scene</option>
                            <option value="Floor Plan">Architectural Floor Plan</option>
                            <option value="Material Moodboard">Material Moodboard</option>
                            <option value="FF&E Shopping List">FF&E Procurement List</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase font-semibold text-stone-600 mb-1">Preview Image URL</label>
                        <input
                          type="url"
                          value={delPreviewImage}
                          onChange={(e) => setDelPreviewImage(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-white focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" size="sm" variant="primary" className="text-xs px-5">
                          Publish Deliverable to Client
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* List of Deliverables */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.deliverables?.map(del => (
                      <div key={del.id} className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={del.preview_image || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80'}
                            alt={del.title}
                            className="w-12 h-12 rounded-xl object-cover border border-sand-200"
                          />
                          <div>
                            <h5 className="font-semibold text-stone-900 text-xs line-clamp-1">{del.title}</h5>
                            <span className="text-[10px] text-stone-400 font-medium">{del.category}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Live
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestone Checklist */}
                <div className="space-y-3 pt-4 border-t border-sand-100">
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Phase Milestones Tracker
                  </h3>

                  <div className="space-y-2.5">
                    {selectedProject.milestones?.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(m.id, m.completed)}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${
                          m.completed
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-sand-50/50 border-sand-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            m.completed ? 'bg-emerald-600 text-white' : 'border border-sand-400'
                          }`}>
                            {m.completed ? <CheckCircle2 className="w-4 h-4" /> : null}
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${m.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                              {m.title}
                            </h4>
                            <p className="text-[11px] text-stone-500">{m.description}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {m.due_date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Inquiries & Leads */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Community Project Leads & Inquiries
              </h3>
              <p className="text-xs text-stone-500">Homeowners seeking verified interior architects for active renovations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openLeads.map(lead => (
              <div key={lead.id} className="p-6 bg-white rounded-3xl border border-sand-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="clay">{lead.room_type}</Badge>
                    <span className="text-xs font-semibold text-stone-500">{lead.location}</span>
                  </div>

                  <h4 className="font-serif font-bold text-stone-900 text-lg">
                    {lead.title}
                  </h4>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {lead.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-sand-50 p-3 rounded-xl border border-sand-200 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Target Budget</span>
                      <span className="font-bold text-stone-900 font-serif text-base">${lead.budget?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Timeline</span>
                      <span className="font-semibold text-stone-800">{lead.timeline || '2-3 Months'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">Client: {lead.homeowner_name}</span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onOpenSendProposal(lead)}
                    className="text-xs"
                  >
                    Submit Proposal Quote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Portfolio Manager */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Studio Portfolio Showcase
              </h3>
              <p className="text-xs text-stone-500">High-resolution projects visible on your public designer profile</p>
            </div>
            <Button size="sm" variant="primary" onClick={onOpenAddPortfolio} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolioItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-xs space-y-3 p-4">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-stone-100">
                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="clay" className="bg-stone-900/80 text-sand-50 border-stone-800 backdrop-blur-md">
                      {item.category}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">{item.style} • {item.square_feet} sq ft</p>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Invoices & Revenue */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Billing & Milestone Invoices
              </h3>
              <p className="text-xs text-stone-500">Automated invoices issued to clients</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onOpenCreateInvoice(projects, selectedProject)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Issue New Invoice
            </Button>
          </div>

          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="p-5 bg-white rounded-2xl border border-sand-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-stone-900">{inv.title}</span>
                    <Badge variant={inv.status === 'Paid' ? 'emerald' : 'amber'}>
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {inv.invoice_number} • Project: {inv.project_title} • Client: {inv.homeowner_name}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-serif font-bold text-stone-900 text-xl">
                    ${inv.amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-400">Due: {inv.due_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Consultation Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Booked Client Consultations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultations.map(con => (
              <div key={con.id} className="p-6 bg-white rounded-3xl border border-sand-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="clay">{con.service_type}</Badge>
                  <span className="text-xs font-bold text-emerald-700">{con.status}</span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-lg">{con.homeowner_name}</h4>
                  <p className="text-xs text-stone-500">{con.notes}</p>
                </div>

                <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs flex items-center justify-between">
                  <span className="text-stone-600 font-medium">Scheduled Time:</span>
                  <span className="font-bold text-stone-900">{con.date} at {con.time}</span>
                </div>

                <div className="pt-2 border-t border-sand-100 flex items-center justify-between">
                  <span className="font-serif font-bold text-stone-900">${con.price}</span>
                  {con.meeting_link && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        showToast('Starting designer video consultation room...', 'info');
                        window.open(con.meeting_link, '_blank');
                      }}
                      className="text-xs"
                    >
                      <Video className="w-3.5 h-3.5 mr-1" /> Start Video Meeting
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Client Messages */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-sm h-[600px] flex flex-col md:flex-row">
          <div className="w-full md:w-80 border-r border-sand-200 p-4 space-y-2 overflow-y-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2 px-2">
              Client Inquiries
            </span>
            {conversations.map(c => (
              <div
                key={c.contact.id}
                onClick={() => setActiveContactId(c.contact.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                  activeContactId === c.contact.id ? 'bg-sand-100 border border-sand-300 font-semibold' : 'hover:bg-sand-50'
                }`}
              >
                <img src={c.contact.avatar} alt={c.contact.name} className="w-10 h-10 rounded-full object-cover border border-sand-200" />
                <div className="overflow-hidden flex-1">
                  <h4 className="text-xs text-stone-900 truncate">{c.contact.name}</h4>
                  <p className="text-[11px] text-stone-400 truncate">{c.lastMessage?.content || 'Started chat'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-between p-6">
            <div className="overflow-y-auto space-y-3 flex-1 pr-2">
              {chatMessages.map(m => {
                const isMe = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe ? 'bg-stone-900 text-sand-50 rounded-br-xs' : 'bg-sand-100 text-stone-800 rounded-bl-xs'
                    }`}>
                      {m.content}
                    </div>
                    {m.attachment_url && (
                      <img src={m.attachment_url} alt="Attachment" className="mt-1.5 w-48 rounded-xl border border-sand-200" />
                    )}
                    <span className="text-[10px] text-stone-400 mt-1">{m.created_at?.split(' ')[1] || 'Just now'}</span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="pt-4 border-t border-sand-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your design feedback or instructions to client..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-sand-300 text-xs focus:outline-none focus:ring-1 focus:ring-clay-500"
              />
              <Button type="submit" variant="primary" size="sm" className="px-5 text-xs">
                Send
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
