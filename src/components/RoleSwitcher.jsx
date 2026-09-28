import React, { useState } from 'react';
import { ArrowRightLeft, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function RoleSwitcher({ currentView, setCurrentView }) {
  const { user, role, switchUser } = useAuth();
  const { showToast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const handleQuickSwitch = async (targetId, targetRole, targetName, targetView) => {
    await switchUser(targetId);
    showToast(`Switched active session to ${targetName} (${targetRole})!`, 'success');
    if (targetView) {
      setCurrentView(targetView);
    }
  };

  return (
    <aside aria-label="Demo Testing Bar" className="fixed bottom-4 left-4 z-40 hidden sm:block">
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="bg-stone-900/90 text-sand-100 hover:text-white px-3.5 py-2 rounded-full shadow-lg border border-stone-700 flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-clay-400" />
          <span>Demo Role Switcher</span>
        </button>
      ) : (
        <div className="bg-stone-900/95 text-sand-50 p-3 rounded-2xl shadow-2xl border border-stone-800 backdrop-blur-md max-w-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-sand-400">
                Active: {user?.name} ({role})
              </span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="text-stone-400 hover:text-white text-xs px-1"
            >
              Minimize
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => handleQuickSwitch('user-h1', 'Homeowner', 'Sarah Jenkins', 'homeowner-dashboard')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                user?.id === 'user-h1'
                  ? 'bg-clay-600 text-white font-semibold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Sarah (Homeowner)
            </button>

            <button
              onClick={() => handleQuickSwitch('user-d1', 'Designer', 'Marcus Vance', 'designer-dashboard')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                user?.id === 'user-d1'
                  ? 'bg-clay-600 text-white font-semibold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Marcus (Studio Vance)
            </button>

            <button
              onClick={() => handleQuickSwitch('user-d2', 'Designer', 'Elena Rostova', 'designer-dashboard')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                user?.id === 'user-d2'
                  ? 'bg-clay-600 text-white font-semibold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Elena (Japandi)
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
