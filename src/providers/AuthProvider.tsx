// ==========================================
// EcoSphere AI — Auth Provider
// Authentication context with localStorage
// ==========================================

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { getStorageItem, setStorageItem, removeStorageItem, generateId } from '../lib/utils';
import { DEMO_USERS, getDemoLogs, getDemoBadges, generateDemoNotifications } from '../lib/seed-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  loadDemoPersona: (persona: string) => void;
  currentPersona: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStorageItem<User | null>('user', null));
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<string | null>(() => getStorageItem('persona', null));

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate auth delay
    await new Promise(r => setTimeout(r, 800));

    // Check if it's a demo user
    const demoEntry = Object.entries(DEMO_USERS).find(([, u]) => u.email === email);
    if (demoEntry) {
      const [persona, demoUser] = demoEntry;
      setUser(demoUser);
      setCurrentPersona(persona);
      setStorageItem('user', demoUser);
      setStorageItem('persona', persona);
      // Load demo data
      setStorageItem('carbon_logs', getDemoLogs(persona));
      setStorageItem('badges', getDemoBadges(persona));
      setStorageItem('notifications', generateDemoNotifications(demoUser.id));
    } else {
      // Create a new user
      const newUser: User = {
        id: generateId(),
        email,
        name: email.split('@')[0],
        avatar: '🌱',
        joinedAt: new Date().toISOString(),
        level: 1,
        xp: 0,
        totalXp: 0,
        coins: 0,
        streak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        role: 'user',
        preferences: { theme: 'dark', units: 'metric', notifications: true, weeklyReport: true, monthlyReport: false, language: 'en' },
      };
      setUser(newUser);
      setCurrentPersona(null);
      setStorageItem('user', newUser);
    }
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const newUser: User = {
      id: generateId(),
      email,
      name,
      avatar: '🌱',
      joinedAt: new Date().toISOString(),
      level: 1,
      xp: 50,
      totalXp: 50,
      coins: 10,
      streak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      role: 'user',
      preferences: { theme: 'dark', units: 'metric', notifications: true, weeklyReport: true, monthlyReport: false, language: 'en' },
    };

    setUser(newUser);
    setCurrentPersona(null);
    setStorageItem('user', newUser);
    setStorageItem('carbon_logs', []);
    setStorageItem('badges', getDemoBadges('beginner'));
    setStorageItem('notifications', generateDemoNotifications(newUser.id));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentPersona(null);
    removeStorageItem('user');
    removeStorageItem('persona');
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setStorageItem('user', updated);
      return updated;
    });
  }, []);

  const loadDemoPersona = useCallback((persona: string) => {
    const demoUser = DEMO_USERS[persona];
    if (!demoUser) return;
    setUser(demoUser);
    setCurrentPersona(persona);
    setStorageItem('user', demoUser);
    setStorageItem('persona', persona);
    setStorageItem('carbon_logs', getDemoLogs(persona));
    setStorageItem('badges', getDemoBadges(persona));
    setStorageItem('notifications', generateDemoNotifications(demoUser.id));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        loadDemoPersona,
        currentPersona,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
