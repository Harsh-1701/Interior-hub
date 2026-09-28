import React from 'react';
import { Mail, ArrowRight, ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

export function Footer({ setCurrentView, onOpenPostProject }) {
  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-sand-100 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-clay-600 flex items-center justify-center text-white shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                Interior<span className="text-clay-400 font-light">Hub</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              The premier platform connecting discerning homeowners with verified architectural interior designers. From initial 3D concept to turnkey realization.
            </p>
            <div className="flex items-center gap-4 pt-2 text-stone-400 text-xs">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Verified Designers</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Escrow Protected</span>
            </div>
          </div>

          {/* Homeowner Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sand-300 mb-4">
              For Homeowners
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <button onClick={() => navigateTo('designers')} className="hover:text-white transition-colors">
                  Find an Interior Designer
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('explore')} className="hover:text-white transition-colors">
                  Inspiration Gallery
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('quiz')} className="hover:text-white transition-colors">
                  Aesthetic Style Quiz
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('estimator')} className="hover:text-white transition-colors">
                  Renovation Cost Estimator
                </button>
              </li>
              <li>
                <button onClick={onOpenPostProject} className="text-clay-400 hover:text-clay-300 font-medium transition-colors">
                  + Post Design Project
                </button>
              </li>
            </ul>
          </div>

          {/* Designer Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sand-300 mb-4">
              For Designers
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <button onClick={() => navigateTo('designer-dashboard')} className="hover:text-white transition-colors">
                  Designer Studio
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('designer-dashboard')} className="hover:text-white transition-colors">
                  Project Leads & Quotes
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('designer-dashboard')} className="hover:text-white transition-colors">
                  Portfolio Showcase
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('designer-dashboard')} className="hover:text-white transition-colors">
                  Milestone & Invoicing
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('how-it-works')} className="hover:text-white transition-colors">
                  Designer Standards
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Curation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sand-300 mb-4">
              Design Digest
            </h4>
            <p className="text-xs text-stone-400 mb-3">
              Receive weekly curated residential architecture, material spotlights, and trade trends.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="architect@studio.com"
                className="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-sand-100 focus:outline-none focus:border-clay-500 w-full"
              />
              <Button size="sm" variant="primary" className="shrink-0 px-3">
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Interior Hub Architectural Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigateTo('how-it-works')} className="hover:text-stone-300 transition-colors">Terms of Service</button>
            <button onClick={() => navigateTo('how-it-works')} className="hover:text-stone-300 transition-colors">Privacy Policy</button>
            <button onClick={() => navigateTo('how-it-works')} className="hover:text-stone-300 transition-colors">Trust & Safety</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
