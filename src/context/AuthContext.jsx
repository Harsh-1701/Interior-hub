import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalInitialRole, setLoginModalInitialRole] = useState('homeowner');

  // Load user on mount
  useEffect(() => {
    async function initAuth() {
      try {
        // Fetch demo users for switching
        const demoRes = await api.getDemoUsers();
        if (demoRes.users) {
          setDemoUsers(demoRes.users);
        }

        // Check if user stored
        const stored = localStorage.getItem('interior_hub_user');
        let initialId = 'user-h1'; // Default: Sarah Jenkins (Homeowner)
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id) initialId = parsed.id;
          } catch (e) {}
        }

        const res = await api.getMe(initialId);
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('interior_hub_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.error('Failed to init auth', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const switchUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      const res = await api.demoLogin(userId);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('interior_hub_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.error('Error switching user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('interior_hub_user', JSON.stringify(res.user));
      setIsLoginModalOpen(false);
      return res.user;
    }
    throw new Error(res.error || 'Failed to login');
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.register(data);
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('interior_hub_user', JSON.stringify(res.user));
      setIsLoginModalOpen(false);
      return res.user;
    }
    throw new Error(res.error || 'Failed to register');
  }, []);

  const logout = useCallback(() => {
    // Revert to demo homeowner instead of broken blank screen
    switchUser('user-h1');
  }, [switchUser]);

  const refreshUser = useCallback(async () => {
    if (user && user.id) {
      const res = await api.getMe(user.id);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('interior_hub_user', JSON.stringify(res.user));
      }
    }
  }, [user]);

  const openLoginModal = useCallback((role = 'homeowner') => {
    setLoginModalInitialRole(role);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'homeowner',
        loading,
        demoUsers,
        switchUser,
        login,
        register,
        logout,
        refreshUser,
        isLoginModalOpen,
        loginModalInitialRole,
        openLoginModal,
        closeLoginModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
