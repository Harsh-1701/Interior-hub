import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Sparkles,
  MessageSquare,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Download,
  Trash2,
  Video,
  Eye,
  CreditCard
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export function HomeownerDashboard({ onOpenPostProject, onOpenBooking, onOpenAddMoodboard }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'consultations' | 'moodboards' | 'proposals' | 'messages'
  const [projects, setProjects] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [moodboards, setMoodboards] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Homeowner Data
  const loadHomeownerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pRes, cRes, mRes, propRes, invRes, convRes] = await Promise.all([
        api.getProjects({ homeowner_id: user.id }),
        api.getConsultations(user.id, 'homeowner'),
        api.getMoodboards(user.id),
        api.getProposals({ homeowner_id: user.id }),
        api.getInvoices({ userId: user.id, role: 'homeowner' }),
        api.getConversations(user.id)
      ]);

      if (pRes.projects) {
        setProjects(pRes.projects);
        if (pRes.projects.length > 0 && !selectedProject) {
          // Load full project detail for first active project
          const det = await api.getProject(pRes.projects[0].id);
          setSelectedProject(det.project || pRes.projects[0]);
        }
      }
      if (cRes.consultations) setConsultations(cRes.consultations);
      if (mRes.moodboards) setMoodboards(mRes.moodboards);
      if (propRes.proposals) setProposals(propRes.proposals);
      if (invRes.invoices) setInvoices(invRes.invoices);
      if (convRes.conversations) {
        setConversations(convRes.conversations);
        if (convRes.conversations.length > 0 && !activeContactId) {
          setActiveContactId(convRes.conversations[0].contact.id);
        }
      }
    } catch (e) {
      console.error('Error loading homeowner data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeownerData();
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

  const handleToggleMilestone = async (mId, currentStatus) => {
    try {
      await api.toggleMilestone(selectedProject.id, mId, !currentStatus);
      showToast('Milestone status updated!', 'success');
      handleSelectProject(selectedProject.id);
    } catch (e) {
      showToast('Error updating milestone', 'error');
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      await api.payInvoice(invoiceId);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      showToast('Payment successful! Escrow released to designer milestone.', 'success');
      loadHomeownerData();
      if (selectedProject) handleSelectProject(selectedProject.id);
    } catch (e) {
      showToast('Payment processing error', 'error');
    }
  };

  const handleAcceptProposal = async (propId) => {
    try {
      await api.acceptProposal(propId);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
      showToast('Proposal accepted! Designer is now assigned to your project.', 'success');
      loadHomeownerData();
    } catch (e) {
      showToast('Error accepting proposal', 'error');
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

  const handleDeleteMoodboardItem = async (boardId, itemId) => {
    try {
      await api.deleteMoodboardItem(boardId, itemId);
      showToast('Item removed from moodboard', 'info');
      const mRes = await api.getMoodboards(user.id);
      if (mRes.moodboards) setMoodboards(mRes.moodboards);
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-sand-100 rounded-3xl p-6 sm:p-8 border border-sand-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <Badge variant="clay">Homeowner Portal</Badge>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Managing residential architectural projects, deliverables & scheduled consultations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="primary" onClick={onOpenPostProject} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Post New Project
          </Button>
          <Button variant="secondary" onClick={onOpenAddMoodboard} className="text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> New Moodboard
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-sand-200 gap-6 text-sm overflow-x-auto scrollbar-none">
        {[
          { id: 'projects', label: `My Projects (${projects.length})`, icon: FolderOpen },
          { id: 'consultations', label: `Consultations (${consultations.length})`, icon: Calendar },
          { id: 'moodboards', label: `Design Studio (${moodboards.length})`, icon: Sparkles },
          { id: 'proposals', label: `Proposals Received (${proposals.length})`, icon: FileText },
          { id: 'messages', label: 'Direct Messages', icon: MessageSquare }
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

      {/* Tab Content 1: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand-200 space-y-3">
              <h3 className="font-serif text-xl font-bold text-stone-800">No Renovation Projects Yet</h3>
              <p className="text-xs text-stone-500">Post a project to connect with top verified interior architects.</p>
              <Button variant="primary" onClick={onOpenPostProject}>
                Post Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Project Selector Column */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block px-1">
                  Active Projects
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
                      <span>Budget: ${p.budget?.toLocaleString()}</span>
                      <span className="font-semibold text-clay-700">{p.progress}% done</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Project Workspace Details */}
              {selectedProject && (
                <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-8">
                  {/* Project Summary Banner */}
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
                        Designer: <strong className="text-stone-800">{selectedProject.studio_name || selectedProject.designer_name || 'Seeking Designer'}</strong> • {selectedProject.location}
                      </p>
                    </div>

                    <div className="bg-sand-50 p-3 rounded-xl border border-sand-200 text-right">
                      <span className="text-[10px] uppercase text-stone-400 font-semibold block">Total Budget</span>
                      <span className="font-serif font-bold text-xl text-stone-900">${selectedProject.budget?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <span>Project Progress</span>
                      <span>{selectedProject.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-sand-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-clay-600 rounded-full transition-all duration-500"
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Roadmap */}
                  <div className="space-y-3">
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      Phase Milestones & Deliverables Roadmap
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
                          <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap ml-2">
                            {m.due_date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Deliverables (Floor plans, 3D Renders, Shopping Lists) */}
                  <div className="space-y-3 pt-4 border-t border-sand-100">
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      Architectural Deliverables & Files
                    </h3>

                    {selectedProject.deliverables?.length === 0 ? (
                      <p className="text-xs text-stone-400">Your designer will upload CAD drawings, 3D renders, and shopping links here.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedProject.deliverables?.map(del => (
                          <div key={del.id} className="p-4 rounded-2xl border border-sand-200 bg-sand-50/30 flex items-center justify-between gap-3">
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                showToast(`Downloading: ${del.title}`, 'info');
                              }}
                              className="text-xs shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Invoices & Escrow Payments */}
                  {selectedProject.invoices && selectedProject.invoices.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-sand-100">
                      <h3 className="font-serif font-bold text-lg text-stone-900">
                        Invoices & Milestone Payments
                      </h3>

                      <div className="space-y-2.5">
                        {selectedProject.invoices.map(inv => (
                          <div key={inv.id} className="p-4 rounded-2xl border border-sand-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-stone-900">{inv.title}</span>
                                <Badge variant={inv.status === 'Paid' ? 'emerald' : 'amber'}>
                                  {inv.status}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-stone-500">{inv.invoice_number} • Due: {inv.due_date}</p>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-serif font-bold text-stone-900 text-lg">
                                ${inv.amount.toLocaleString()}
                              </span>
                              {inv.status === 'Pending' ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handlePayInvoice(inv.id)}
                                  className="text-xs"
                                >
                                  <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay & Release Escrow
                                </Button>
                              ) : (
                                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Paid
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Consultations */}
      {activeTab === 'consultations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Scheduled Designer Consultations
            </h3>
          </div>

          {consultations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand-200 space-y-3">
              <p className="text-sm text-stone-600">No upcoming consultations booked.</p>
              <Button variant="primary" onClick={onOpenBooking}>
                Book a Design Session
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultations.map(con => (
                <div key={con.id} className="p-6 bg-white rounded-3xl border border-sand-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="clay">{con.service_type}</Badge>
                      <Badge variant={con.status === 'Confirmed' ? 'emerald' : 'default'}>
                        {con.status}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-lg">
                        {con.studio_name || con.designer_name}
                      </h4>
                      <p className="text-xs text-stone-500">{con.notes}</p>
                    </div>

                    <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs flex items-center justify-between">
                      <span className="font-medium text-stone-700">Date & Time:</span>
                      <span className="font-bold text-stone-900">{con.date} at {con.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-sand-100">
                    <span className="font-serif font-bold text-stone-900">${con.price}</span>
                    {con.meeting_link && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          showToast('Launching video consultation room...', 'info');
                          window.open(con.meeting_link, '_blank');
                        }}
                        className="text-xs"
                      >
                        <Video className="w-3.5 h-3.5 mr-1" /> Join Video Call
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Moodboards */}
      {activeTab === 'moodboards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Personal Design Moodboards
            </h3>
            <Button size="sm" variant="primary" onClick={onOpenAddMoodboard} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Moodboard
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moodboards.map(mb => (
              <div key={mb.id} className="bg-white rounded-3xl border border-sand-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-lg">{mb.title}</h4>
                    <p className="text-xs text-stone-500">{mb.room_type} • {mb.description}</p>
                  </div>
                  {/* Swatches */}
                  <div className="flex gap-1">
                    {mb.palette?.map((hex, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-stone-200 shadow-2xs" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </div>

                {/* Items Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    Pinned Inspiration & Furniture ({mb.items?.length || 0})
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {mb.items?.map(it => (
                      <div key={it.id} className="relative group rounded-xl overflow-hidden h-24 bg-stone-100">
                        <img src={it.image_url} alt={it.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white">
                          <span className="text-[10px] font-medium line-clamp-2">{it.title}</span>
                          <button
                            onClick={() => handleDeleteMoodboardItem(mb.id, it.id)}
                            className="self-end text-red-400 hover:text-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Proposals Received */}
      {activeTab === 'proposals' && (
        <div className="space-y-6">
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Proposals Received for Your Renovation Requests
          </h3>

          {proposals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-sand-200">
              <p className="text-sm text-stone-500">No open proposals at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proposals.map(prop => (
                <div key={prop.id} className="bg-white p-6 rounded-3xl border border-sand-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="clay">{prop.project_title || 'Renovation Proposal'}</Badge>
                      <Badge variant={prop.status === 'Accepted' ? 'emerald' : prop.status === 'Declined' ? 'default' : 'amber'}>
                        {prop.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <img src={prop.designer_avatar} alt={prop.designer_name} className="w-12 h-12 rounded-full object-cover border border-sand-200" />
                      <div>
                        <h4 className="font-serif font-bold text-stone-900 text-base">{prop.studio_name}</h4>
                        <p className="text-xs text-stone-500">Duration: {prop.estimated_weeks} Weeks</p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed italic bg-sand-50 p-3 rounded-xl border border-sand-200">
                      "{prop.scope_description}"
                    </p>

                    <div className="text-xs text-stone-500">
                      <span className="font-semibold text-stone-700 block">Deliverables:</span>
                      {prop.deliverables_summary}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase">Proposed Fee</span>
                      <p className="font-serif font-bold text-2xl text-stone-900">${prop.amount.toLocaleString()}</p>
                    </div>

                    {prop.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAcceptProposal(prop.id)}
                          className="text-xs"
                        >
                          Accept Proposal
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700">Contract Activated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 5: Direct Messages */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-sand-200 overflow-hidden shadow-sm h-[600px] flex flex-col md:flex-row">
          {/* Conversation List */}
          <div className="w-full md:w-80 border-r border-sand-200 p-4 space-y-2 overflow-y-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2 px-2">
              Studio Conversations
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
                  <h4 className="text-xs text-stone-900 truncate">{c.contact.studio_name || c.contact.name}</h4>
                  <p className="text-[11px] text-stone-400 truncate">{c.lastMessage?.content || 'Conversation started'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Active Chat Thread */}
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

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-sand-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message or project question to the designer..."
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
