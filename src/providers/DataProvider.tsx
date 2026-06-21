// ==========================================
// EcoSphere AI — Data Provider
// Carbon logs, goals, and data persistence
// ==========================================

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CarbonLog, Goal, ActivityCategory } from '../types';
import { getStorageItem, setStorageItem, generateId } from '../lib/utils';
import { useAuth } from './AuthProvider';

interface DataContextType {
  logs: CarbonLog[];
  goals: Goal[];
  addLog: (log: Omit<CarbonLog, 'id' | 'userId' | 'createdAt'>) => void;
  deleteLog: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  getTodayTotal: () => number;
  getWeekTotal: () => number;
  getMonthTotal: () => number;
  getYearTotal: () => number;
  getCategoryTotal: (category: ActivityCategory) => number;
  getDailyTotals: (days: number) => Array<{ date: string; total: number }>;
  getCategoryBreakdown: () => Array<{ category: string; total: number; color: string }>;
  totalCO2Saved: number;
}

const DataContext = createContext<DataContextType | null>(null);

const CATEGORY_COLORS: Record<string, string> = {
  transportation: '#3b82f6',
  food: '#f59e0b',
  electricity: '#8b5cf6',
  shopping: '#ec4899',
  travel: '#06b6d4',
  lifestyle: '#10b981',
  waste: '#6b7280',
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CarbonLog[]>(() => getStorageItem('carbon_logs', []));
  const [goals, setGoals] = useState<Goal[]>(() => getStorageItem('goals', []));

  const saveLogs = useCallback((newLogs: CarbonLog[]) => {
    setLogs(newLogs);
    setStorageItem('carbon_logs', newLogs);
  }, []);

  const saveGoals = useCallback((newGoals: Goal[]) => {
    setGoals(newGoals);
    setStorageItem('goals', newGoals);
  }, []);

  const addLog = useCallback((log: Omit<CarbonLog, 'id' | 'userId' | 'createdAt'>) => {
    const newLog: CarbonLog = {
      ...log,
      id: generateId(),
      userId: user?.id || '',
      createdAt: new Date().toISOString(),
    };
    saveLogs([newLog, ...logs]);
  }, [logs, user, saveLogs]);

  const deleteLog = useCallback((id: string) => {
    saveLogs(logs.filter(l => l.id !== id));
  }, [logs, saveLogs]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      userId: user?.id || '',
      createdAt: new Date().toISOString(),
    };
    saveGoals([newGoal, ...goals]);
  }, [goals, user, saveGoals]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    saveGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  }, [goals, saveGoals]);

  const deleteGoal = useCallback((id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  }, [goals, saveGoals]);

  const getDateFiltered = useCallback((days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return logs.filter(l => l.date >= cutoffStr);
  }, [logs]);

  const getTodayTotal = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.date === today).reduce((sum, l) => sum + l.co2Amount, 0);
  }, [logs]);

  const getWeekTotal = useCallback(() => {
    return getDateFiltered(7).reduce((sum, l) => sum + l.co2Amount, 0);
  }, [getDateFiltered]);

  const getMonthTotal = useCallback(() => {
    return getDateFiltered(30).reduce((sum, l) => sum + l.co2Amount, 0);
  }, [getDateFiltered]);

  const getYearTotal = useCallback(() => {
    return getDateFiltered(365).reduce((sum, l) => sum + l.co2Amount, 0);
  }, [getDateFiltered]);

  const getCategoryTotal = useCallback((category: ActivityCategory) => {
    return logs.filter(l => l.category === category).reduce((sum, l) => sum + l.co2Amount, 0);
  }, [logs]);

  const getDailyTotals = useCallback((days: number) => {
    const result: Array<{ date: string; total: number }> = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const total = logs.filter(l => l.date === dateStr).reduce((sum, l) => sum + l.co2Amount, 0);
      result.push({ date: dateStr, total: Math.round(total * 100) / 100 });
    }
    return result;
  }, [logs]);

  const getCategoryBreakdown = useCallback(() => {
    const byCategory: Record<string, number> = {};
    logs.forEach(l => {
      byCategory[l.category] = (byCategory[l.category] || 0) + l.co2Amount;
    });
    return Object.entries(byCategory)
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
        color: CATEGORY_COLORS[category] || '#6b7280',
      }))
      .sort((a, b) => b.total - a.total);
  }, [logs]);

  // Estimated CO2 saved (compared to average)
  const totalDays = logs.length > 0 ? new Set(logs.map(l => l.date)).size : 1;
  const dailyAvg = logs.reduce((sum, l) => sum + l.co2Amount, 0) / totalDays;
  const globalDailyAvg = 22; // Global average
  const totalCO2Saved = Math.max(0, Math.round((globalDailyAvg - dailyAvg) * totalDays));

  return (
    <DataContext.Provider
      value={{
        logs,
        goals,
        addLog,
        deleteLog,
        addGoal,
        updateGoal,
        deleteGoal,
        getTodayTotal,
        getWeekTotal,
        getMonthTotal,
        getYearTotal,
        getCategoryTotal,
        getDailyTotals,
        getCategoryBreakdown,
        totalCO2Saved,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
