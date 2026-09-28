import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  Video,
  FileCheck,
  DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function HowItWorks({ onOpenPostProject, setCurrentView }) {
  const [activeTab, setActiveTab] = useState('homeowner'); // 'homeowner' | 'designer'
  const [openFaq, setOpenFaq] = useState(null);

  const homeownerSteps = [
    {
      num: '01',
      title: 'Define Your Aesthetic & Vision',
      desc: 'Use our 2-minute visual Style Quiz to discover your exact interior aesthetic, recommended color palette swatches, and material directions. Or browse curated projects in our Inspiration Gallery.'
    },
    {
      num: '02',
      title: 'Connect with Verified Designers',
      desc: 'Browse vetted architectural studios. Compare verified homeowner reviews, hourly pricing tiers, and past portfolios. Book a 45-min virtual call or on-site consultation directly.'
    },
    {
      num: '03',
      title: 'Review Photorealistic 3D Renders',
      desc: 'Before any contractor demolishes a single wall or furniture is purchased, review photorealistic 3D daytime and evening scenes of your exact room with dimensions and lighting.'
    },
    {
      num: '04',
      title: 'Escrow Milestone Security',
      desc: 'Your project funds remain safely in escrow. You only release payments as each design milestone (2D layout, 3D renders, procurement list) is reviewed and approved by you.'
    }
  ];

  const designerSteps = [
    {
      num: '01',
      title: 'Studio Verification & Profile',
      desc: 'Create your studio showcase with high-res photography, design philosophy, pricing packages, and past project budgets. Our architectural review board verifies credentials within 24 hours.'
    },
    {
      num: '02',
      title: 'Access Qualified Residential Leads',
      desc: 'Receive direct consultation bookings and browse public homeowner inquiries with verified budgets and room specifications. No bidding wars or generic low-budget requests.'
    },
    {
      num: '03',
      title: 'Send Structured Proposals',
      desc: 'Submit transparent proposals with phase milestone breakdowns (Concept, 3D Visualization, Material Procurement, Turnkey Handover) with 1 click.'
    },
    {
      num: '04',
      title: 'Collaborative Workspace & Guaranteed Payouts',
      desc: 'Upload deliverables directly to the homeowner portal. Generate automated itemized invoices with prompt escrow release upon client sign-off.'
    }
  ];

  const faqs = [
    {
      q: 'How does escrow protection work on Interior Hub?',
      a: 'When you accept a designer proposal, your initial retainer is held securely in escrow. Funds are only transferred to the designer once you have reviewed and signed off on each specified phase milestone.'
    },
    {
      q: 'Can I do a consultation before committing to a full project?',
      a: 'Yes! Every designer on Interior Hub offers standalone 45-minute or 90-minute design consultations (starting around $150–$300) to review floor plans, spatial dilemmas, and color advice without long-term commitment.'
    },
    {
      q: 'What is included in the FF&E Shopping List?',
      a: 'The Furniture, Fixtures & Equipment schedule includes exact product buying links, dimensions, finishes, and access to exclusive designer trade discounts (typically saving 15% to 30% off retail prices).'
    },
    {
      q: 'How are interior designers verified?',
      a: 'We review architectural credentials, portfolios, past client references, and business insurance to ensure only high-caliber, reliable professionals are listed on the platform.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="clay" className="uppercase tracking-wider">Platform Guide</Badge>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
          How Interior Hub Works
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          From initial 3D concept to turnkey contractor handover. Discover how we protect your design investment and streamline architectural collaboration.
        </p>

        {/* Tab Toggle */}
        <div className="flex justify-center pt-2">
          <div className="bg-sand-200 p-1.5 rounded-2xl flex">
            <button
              onClick={() => setActiveTab('homeowner')}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'homeowner' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              For Homeowners
            </button>
            <button
              onClick={() => setActiveTab('designer')}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'designer' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              For Interior Designers
            </button>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(activeTab === 'homeowner' ? homeownerSteps : designerSteps).map((step) => (
          <div
            key={step.num}
            className="p-8 rounded-3xl bg-white border border-sand-200 shadow-xs relative flex flex-col justify-between space-y-4"
          >
            <span className="font-serif text-4xl font-bold text-clay-400 block">{step.num}</span>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-stone-900">{step.title}</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{step.desc}</p>
            </div>
            <div className="w-8 h-1 bg-sand-200 rounded-full" />
          </div>
        ))}
      </div>

      {/* Trust & Escrow Guarantee Box */}
      <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 text-sand-50 border border-stone-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-clay-600 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-white">
              The Interior Hub Escrow Guarantee
            </h3>
            <p className="text-xs text-stone-400">Security for homeowners and predictability for designers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs text-stone-300">
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Held in Escrow</h4>
            <p>Milestone fees are funded in advance into protected escrow, giving designers certainty before investing dozens of hours in 3D modeling.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Homeowner Sign-Off</h4>
            <p>Funds are only released when you review deliverables (2D drawings, 3D renderings, material boards) and click approve.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Dispute Mediation</h4>
            <p>Our dedicated architectural review board steps in to resolve any scope discrepancies or revision disputes fairly.</p>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500">Everything you need to know about working on Interior Hub</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-stone-900 hover:text-clay-700 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-stone-400 font-normal text-lg">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-sand-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-8 sm:p-12 rounded-3xl bg-sand-200 text-center space-y-4 border border-sand-300">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Ready to Start Your Interior Transformation?
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
          Post your project specifications for free or browse verified studios ready to collaborate today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button variant="primary" onClick={onOpenPostProject} className="text-xs px-6">
            Post a Project Inquiry
          </Button>
          <Button variant="outline" onClick={() => setCurrentView('designers')} className="text-xs px-6">
            Find Designers
          </Button>
        </div>
      </div>
    </div>
  );
}
