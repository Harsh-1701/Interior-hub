import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RoleSwitcher } from './components/RoleSwitcher';

// Pages
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Designers } from './pages/Designers';
import { DesignerDetail } from './pages/DesignerDetail';
import { StyleQuiz } from './pages/StyleQuiz';
import { CostEstimator } from './pages/CostEstimator';
import { HomeownerDashboard } from './pages/HomeownerDashboard';
import { DesignerDashboard } from './pages/DesignerDashboard';
import { HowItWorks } from './pages/HowItWorks';

// Modals
import { BookConsultationModal } from './components/Modals/BookConsultationModal';
import { PostProjectModal } from './components/Modals/PostProjectModal';
import { SendProposalModal } from './components/Modals/SendProposalModal';
import { CreateInvoiceModal } from './components/Modals/CreateInvoiceModal';
import { AddPortfolioModal } from './components/Modals/AddPortfolioModal';
import { AddMoodboardModal } from './components/Modals/AddMoodboardModal';
import { RoomDetailModal } from './components/Modals/RoomDetailModal';
import { LoginModal } from './components/Modals/LoginModal';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';

function AppContent() {
  const { user, role, isLoginModalOpen, loginModalInitialRole, closeLoginModal } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState('home');
  const [selectedDesignerId, setSelectedDesignerId] = useState(null);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDesignerForBooking, setSelectedDesignerForBooking] = useState(null);

  const [postProjectModalOpen, setPostProjectModalOpen] = useState(false);
  const [projectPrefill, setProjectPrefill] = useState(null);
  const [targetDesignerId, setTargetDesignerId] = useState(null);

  const [sendProposalModalOpen, setSendProposalModalOpen] = useState(false);
  const [selectedProjectForProposal, setSelectedProjectForProposal] = useState(null);

  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [invoiceProjectsList, setInvoiceProjectsList] = useState([]);
  const [invoicePreselectedProj, setInvoicePreselectedProj] = useState(null);

  const [addPortfolioModalOpen, setAddPortfolioModalOpen] = useState(false);
  const [addMoodboardModalOpen, setAddMoodboardModalOpen] = useState(false);

  const [roomDetailModalOpen, setRoomDetailModalOpen] = useState(false);
  const [selectedRoomItem, setSelectedRoomItem] = useState(null);

  // Handlers
  const handleOpenBooking = (designer) => {
    setSelectedDesignerForBooking(designer || { id: 'des-1', studio_name: 'Studio Vance', hourly_rate: 160 });
    setBookingModalOpen(true);
  };

  const handleOpenPostProject = (prefill = null) => {
    setProjectPrefill(prefill);
    setTargetDesignerId(null);
    setPostProjectModalOpen(true);
  };

  const handleOpenQuote = (designer) => {
    setTargetDesignerId(designer.id);
    setProjectPrefill({
      title: `Project Inquiry for ${designer.studio_name || designer.name}`,
      description: `I am interested in commissioning ${designer.studio_name || designer.name} for our upcoming renovation.`
    });
    setPostProjectModalOpen(true);
  };

  const handleOpenDesignerDetail = (id) => {
    setSelectedDesignerId(id);
    setCurrentView('designer-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRoomDetail = (item) => {
    setSelectedRoomItem(item);
    setRoomDetailModalOpen(true);
  };

  const handleOpenSendProposal = (project) => {
    setSelectedProjectForProposal(project);
    setSendProposalModalOpen(true);
  };

  const handleOpenCreateInvoice = (projects = [], selected = null) => {
    setInvoiceProjectsList(projects);
    setInvoicePreselectedProj(selected);
    setCreateInvoiceModalOpen(true);
  };

  const handleOpenChat = (otherUserId) => {
    if (role === 'designer') {
      setCurrentView('designer-dashboard');
    } else {
      setCurrentView('homeowner-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sand-50 selection:bg-clay-200">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenPostProject={() => handleOpenPostProject()}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            setCurrentView={setCurrentView}
            onOpenBooking={handleOpenBooking}
            onOpenPostProject={handleOpenPostProject}
            onOpenDesignerDetail={handleOpenDesignerDetail}
            onOpenRoomDetail={handleOpenRoomDetail}
          />
        )}

        {currentView === 'explore' && (
          <Explore
            onOpenRoomDetail={handleOpenRoomDetail}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentView === 'designers' && (
          <Designers
            onSelectDesigner={handleOpenDesignerDetail}
            onOpenBooking={handleOpenBooking}
            onOpenQuote={handleOpenQuote}
          />
        )}

        {currentView === 'designer-detail' && (
          <DesignerDetail
            designerId={selectedDesignerId || 'des-1'}
            onBack={() => setCurrentView('designers')}
            onOpenBooking={handleOpenBooking}
            onOpenQuote={handleOpenQuote}
            onOpenChat={handleOpenChat}
          />
        )}

        {currentView === 'quiz' && (
          <StyleQuiz
            onOpenBooking={handleOpenBooking}
            onSelectDesigner={handleOpenDesignerDetail}
            onOpenPostProject={handleOpenPostProject}
          />
        )}

        {currentView === 'estimator' && (
          <CostEstimator
            onOpenPostProject={handleOpenPostProject}
            onSelectDesigner={handleOpenDesignerDetail}
          />
        )}

        {currentView === 'homeowner-dashboard' && (
          <HomeownerDashboard
            onOpenPostProject={() => handleOpenPostProject()}
            onOpenBooking={() => handleOpenBooking()}
            onOpenAddMoodboard={() => setAddMoodboardModalOpen(true)}
          />
        )}

        {currentView === 'designer-dashboard' && (
          <DesignerDashboard
            onOpenCreateInvoice={handleOpenCreateInvoice}
            onOpenAddPortfolio={() => setAddPortfolioModalOpen(true)}
            onOpenSendProposal={handleOpenSendProposal}
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorks
            onOpenPostProject={() => handleOpenPostProject()}
            setCurrentView={setCurrentView}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setCurrentView={setCurrentView}
        onOpenPostProject={() => handleOpenPostProject()}
      />

      {/* Quick Role & Persona Switcher */}
      <RoleSwitcher
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Modals */}
      <BookConsultationModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        designer={selectedDesignerForBooking}
        onSuccess={() => {
          if (role === 'homeowner') setCurrentView('homeowner-dashboard');
        }}
      />

      <PostProjectModal
        isOpen={postProjectModalOpen}
        onClose={() => setPostProjectModalOpen(false)}
        prefill={projectPrefill}
        designerId={targetDesignerId}
        onSuccess={() => {
          if (role === 'homeowner') setCurrentView('homeowner-dashboard');
        }}
      />

      <SendProposalModal
        isOpen={sendProposalModalOpen}
        onClose={() => setSendProposalModalOpen(false)}
        project={selectedProjectForProposal}
        onSuccess={() => {
          if (role === 'designer') setCurrentView('designer-dashboard');
        }}
      />

      <CreateInvoiceModal
        isOpen={createInvoiceModalOpen}
        onClose={() => setCreateInvoiceModalOpen(false)}
        projects={invoiceProjectsList}
        preselectedProject={invoicePreselectedProj}
        onSuccess={() => {
          if (role === 'designer') setCurrentView('designer-dashboard');
        }}
      />

      <AddPortfolioModal
        isOpen={addPortfolioModalOpen}
        onClose={() => setAddPortfolioModalOpen(false)}
      />

      <AddMoodboardModal
        isOpen={addMoodboardModalOpen}
        onClose={() => setAddMoodboardModalOpen(false)}
        onSuccess={() => {
          if (role === 'homeowner') setCurrentView('homeowner-dashboard');
        }}
      />

      <RoomDetailModal
        isOpen={roomDetailModalOpen}
        onClose={() => setRoomDetailModalOpen(false)}
        item={selectedRoomItem}
        onLike={async (id) => {
          await api.likeGalleryItem(id, user?.id);
          setSelectedRoomItem(prev => prev ? { ...prev, likes: prev.likes + 1 } : prev);
        }}
        onOpenBooking={(d) => handleOpenBooking(d)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        initialRole={loginModalInitialRole}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
