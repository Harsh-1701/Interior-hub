import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, Mail, Lock, User, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function LoginModal({ isOpen, onClose, initialRole = 'homeowner' }) {
  const { switchUser, login, register, demoUsers } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('demo'); // 'demo' | 'login' | 'register'
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studioName, setStudioName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoSwitch = async (userId, userName, userRole) => {
    setLoading(true);
    try {
      await switchUser(userId);
      showToast(`Switched to ${userName} (${userRole})`, 'success');
      onClose();
    } catch (e) {
      showToast('Failed to switch user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Successfully logged in!', 'success');
      } else {
        await register({
          name,
          email,
          password,
          role,
          studio_name: role === 'designer' ? studioName : undefined
        });
        showToast(`Welcome to Interior Hub, ${name}!`, 'success');
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sand-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200 bg-sand-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-clay-600">Access Portal</span>
            <h3 className="font-serif text-2xl text-stone-900 mt-0.5">
              {mode === 'demo' ? 'Instant Role Switcher' : mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-sand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-sand-200 px-6 pt-3 bg-sand-50/20">
          <button
            onClick={() => setMode('demo')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors mr-6 border-b-2 flex items-center gap-1.5 ${
              mode === 'demo' ? 'border-clay-600 text-clay-700' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-clay-500" /> 1-Click Fast Demo
          </button>
          <button
            onClick={() => setMode('login')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors mr-6 border-b-2 ${
              mode === 'login' ? 'border-clay-600 text-clay-700' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
              mode === 'register' ? 'border-clay-600 text-clay-700' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6">
          {mode === 'demo' ? (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Instantly test the full platform as either a Homeowner or an Interior Designer with 1 click:
              </p>

              {/* Demo Personas */}
              <div className="space-y-2.5">
                <div
                  onClick={() => handleDemoSwitch('user-h1', 'Sarah Jenkins', 'Homeowner')}
                  className="cursor-pointer p-3.5 rounded-2xl border border-sand-200 hover:border-clay-500 hover:bg-clay-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Sarah Jenkins"
                      className="w-11 h-11 rounded-full object-cover border border-sand-300"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900 text-sm">Sarah Jenkins</span>
                        <span className="text-[10px] font-medium bg-sand-200 text-stone-700 px-2 py-0.5 rounded-full">
                          Homeowner
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">Tribeca Loft renovation, booked calls & moodboards</p>
                    </div>
                  </div>
                  <UserCheck className="w-5 h-5 text-stone-400 group-hover:text-clay-600 transition-colors" />
                </div>

                <div
                  onClick={() => handleDemoSwitch('user-d1', 'Marcus Vance', 'Designer')}
                  className="cursor-pointer p-3.5 rounded-2xl border border-sand-200 hover:border-clay-500 hover:bg-clay-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                      alt="Marcus Vance"
                      className="w-11 h-11 rounded-full object-cover border border-sand-300"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900 text-sm">Marcus Vance</span>
                        <span className="text-[10px] font-medium bg-clay-100 text-clay-800 px-2 py-0.5 rounded-full">
                          Designer Pro
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">Studio Vance NYC: active projects, leads, invoicing</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-stone-400 group-hover:text-clay-600 transition-colors" />
                </div>

                <div
                  onClick={() => handleDemoSwitch('user-d2', 'Elena Rostova', 'Designer')}
                  className="cursor-pointer p-3.5 rounded-2xl border border-sand-200 hover:border-clay-500 hover:bg-clay-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                      alt="Elena Rostova"
                      className="w-11 h-11 rounded-full object-cover border border-sand-300"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900 text-sm">Elena Rostova</span>
                        <span className="text-[10px] font-medium bg-sage-100 text-sage-800 px-2 py-0.5 rounded-full">
                          Japandi Designer
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">Kanso Studio: Brooklyn brownstone client projects</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-stone-400 group-hover:text-clay-600 transition-colors" />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                      I am joining as a:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('homeowner')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          role === 'homeowner' ? 'border-clay-600 bg-clay-50 text-clay-700 ring-2 ring-clay-600/20' : 'border-sand-200 text-stone-600'
                        }`}
                      >
                        Homeowner
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('designer')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          role === 'designer' ? 'border-clay-600 bg-clay-50 text-clay-700 ring-2 ring-clay-600/20' : 'border-sand-200 text-stone-600'
                        }`}
                      >
                        Interior Designer
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                      />
                    </div>
                  </div>

                  {role === 'designer' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Studio / Practice Name
                      </label>
                      <input
                        type="text"
                        required
                        value={studioName}
                        onChange={(e) => setStudioName(e.target.value)}
                        placeholder="e.g. Atelier Morgan Design"
                        className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 text-sm"
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} variant="primary" className="w-full py-3 mt-2">
                {mode === 'login' ? 'Sign In to Interior Hub' : 'Complete Registration'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
