import React, { useState } from 'react';
import {
  Compass,
  Users,
  Sparkles,
  Calculator,
  HelpCircle,
  PlusCircle,
  LayoutDashboard,
  User,
  ArrowRightLeft,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../context/AuthContext';

export function Navbar({ currentView, setCurrentView, onOpenPostProject, onOpenBooking }) {
  const { user, role, switchUser, openLoginModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'explore', label: 'Explore Gallery', icon: Compass },
    { id: 'designers', label: 'Find Designers', icon: Users },
    { id: 'quiz', label: 'Style Quiz', icon: Sparkles },
    { id: 'estimator', label: 'Cost Estimator', icon: Calculator },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
  ];

  const handleToggleRole = () => {
    if (role === 'homeowner') {
      switchUser('user-d1'); // Switch to Marcus Vance (Designer)
      setCurrentView('designer-dashboard');
    } else {
      switchUser('user-h1'); // Switch to Sarah Jenkins (Homeowner)
      setCurrentView('homeowner-dashboard');
    }
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-sand-50/90 backdrop-blur-md border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center text-sand-50 shadow-sm group-hover:bg-clay-600 transition-colors">
              <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 group-hover:text-clay-700 transition-colors">
                Interior<span className="text-clay-600 font-light">Hub</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-stone-500 font-semibold -mt-1">
                Architecture & Living
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => navigateTo(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sand-200/80 text-stone-900 font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-clay-600' : 'text-stone-400'}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick 1-Click Role Switch Toggle */}
            <button
              onClick={handleToggleRole}
              title={`Currently ${role}. Click to quickly switch to ${role === 'homeowner' ? 'Designer' : 'Homeowner'} mode!`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sand-300 bg-white hover:bg-sand-100 text-xs font-semibold text-stone-700 transition-all shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-clay-600" />
              <span>Switch to {role === 'homeowner' ? 'Designer' : 'Homeowner'}</span>
            </button>

            {/* Dashboard Link */}
            <Button
              size="sm"
              variant={currentView.includes('dashboard') ? 'dark' : 'secondary'}
              onClick={() => navigateTo(role === 'designer' ? 'designer-dashboard' : 'homeowner-dashboard')}
              className="text-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
              {role === 'designer' ? 'Designer Studio' : 'My Home Hub'}
            </Button>

            {/* Post Project / Request Consultation CTA */}
            {role === 'homeowner' ? (
              <Button
                size="sm"
                variant="primary"
                onClick={onOpenPostProject}
                className="text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Post Project
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigateTo('designer-dashboard')}
                className="text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Review Leads
              </Button>
            )}

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-sand-300 bg-white hover:bg-sand-100 transition-colors"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-stone-800 pr-1 max-w-[90px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 mr-1" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-sand-200 p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-sand-100 mb-1">
                    <p className="text-xs font-bold text-stone-900">{user?.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                    <Badge variant={role === 'designer' ? 'clay' : 'sage'} size="sm" className="mt-1.5 uppercase tracking-wide">
                      {role}
                    </Badge>
                  </div>

                  <button
                    onClick={() => {
                      navigateTo(role === 'designer' ? 'designer-dashboard' : 'homeowner-dashboard');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-sand-100 transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-stone-400" />
                    Open Dashboard Workspace
                  </button>

                  <button
                    onClick={() => {
                      openLoginModal();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-sand-100 transition-colors flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-stone-400" />
                    Switch Accounts / Fast Demo
                  </button>

                  <div className="border-t border-sand-100 my-1"></div>

                  <button
                    onClick={() => {
                      openLoginModal('homeowner');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    Sign Out / Switch User
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleToggleRole}
              className="px-2.5 py-1 rounded-lg border border-sand-300 text-[11px] font-semibold bg-white"
            >
              {role === 'homeowner' ? 'Go Pro' : 'Homeowner'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:bg-sand-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-sand-200 space-y-2 animate-in fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => navigateTo(link.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    currentView === link.id ? 'bg-sand-200 font-semibold text-stone-900' : 'text-stone-700'
                  }`}
                >
                  <Icon className="w-4 h-4 text-clay-600" />
                  {link.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-sand-200 flex flex-col gap-2">
              <Button
                variant="dark"
                className="w-full text-xs"
                onClick={() => navigateTo(role === 'designer' ? 'designer-dashboard' : 'homeowner-dashboard')}
              >
                Go to {role === 'designer' ? 'Designer Studio' : 'Homeowner Dashboard'}
              </Button>
              <Button
                variant="secondary"
                className="w-full text-xs"
                onClick={() => openLoginModal()}
              >
                Switch Account / Demo Users
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
