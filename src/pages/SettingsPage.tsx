import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Moon, Sun, Monitor, Bell, Download, Upload, Keyboard, Shield, Palette } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { useNotifications } from '../providers/NotificationProvider';
import { useData } from '../providers/DataProvider';
import { DEMO_USERS } from '../lib/seed-data';
import { setStorageItem } from '../lib/utils';

const AVATARS = ['🌱', '🌿', '🌳', '🌍', '🦸‍♀️', '🧑‍💻', '🌸', '⚡', '🌊', '🔥', '💎', '🌈'];

export default function SettingsPage() {
  const { user, updateProfile, loadDemoPersona, currentPersona } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useNotifications();
  const { logs } = useData();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateProfile({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    showToast('Profile updated successfully!', 'success');
  };

  const handlePreferenceToggle = (key: 'notifications' | 'weeklyReport' | 'monthlyReport') => {
    if (!user) return;
    const currentPrefs = user.preferences || {
      theme: 'dark',
      units: 'metric',
      notifications: true,
      weeklyReport: true,
      monthlyReport: false,
      language: 'en'
    };
    
    updateProfile({
      preferences: {
        ...currentPrefs,
        [key]: !currentPrefs[key],
      }
    });
    showToast('Preference updated!', 'success');
  };

  const handleUnitToggle = () => {
    if (!user) return;
    const currentPrefs = user.preferences || {
      theme: 'dark',
      units: 'metric',
      notifications: true,
      weeklyReport: true,
      monthlyReport: false,
      language: 'en'
    };
    
    const nextUnits = currentPrefs.units === 'metric' ? 'imperial' : 'metric';
    updateProfile({
      preferences: {
        ...currentPrefs,
        units: nextUnits,
      }
    });
    showToast(`Units switched to ${nextUnits}!`, 'success');
  };

  const exportCSV = () => {
    if (!logs.length) {
      showToast('No logs to export!', 'warning');
      return;
    }
    const headers = ['Date', 'Category', 'SubCategory', 'Value', 'Unit', 'CO2 Amount (kg)'];
    const rows = logs.map(l => [
      l.date,
      l.category,
      l.subCategory,
      l.value,
      l.unit,
      l.co2Amount
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecosphere_carbon_logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Carbon logs exported to CSV!', 'success');
  };

  const exportJSON = () => {
    if (!logs.length) {
      showToast('No logs to export!', 'warning');
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(logs, null, 2)
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", "ecosphere_carbon_data.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Carbon logs exported to JSON!', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const isValid = imported.every(x => x.category && x.co2Amount !== undefined);
          if (isValid) {
            setStorageItem('carbon_logs', imported);
            showToast('Import successful! Reloading data...', 'success');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            showToast('Invalid data format: logs structure mismatch', 'error');
          }
        } else {
          showToast('Invalid data format: expected JSON array', 'error');
        }
      } catch (err) {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const triggerImportClick = () => {
    fileInputRef.current?.click();
  };

  const prefs = user?.preferences || {
    theme: 'dark',
    units: 'metric',
    notifications: true,
    weeklyReport: true,
    monthlyReport: false,
    language: 'en'
  };

  return (
    <div className="page-container space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your account and preferences</p>
      </motion.div>

      {/* Profile */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <User className="w-4 h-4" /> Profile Details
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-3xl">{user?.avatar}</div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
          </div>
        </div>

        {/* Avatar Selection */}
        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Choose Avatar Emoji</label>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-4">
          {AVATARS.map(a => (
            <motion.button key={a} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateProfile({ avatar: a })}
              className="aspect-square rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer"
              style={{ background: user?.avatar === a ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)', border: user?.avatar === a ? '2px solid #10b981' : '1px solid var(--border-color)' }}>
              {a}
            </motion.button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} onClick={handleSave} className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary cursor-pointer">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="stat-card space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Bell className="w-4 h-4" /> Preferences & Notifications
        </h3>
        
        <div className="space-y-4 text-sm">
          {/* Notification toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>App Notifications</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Receive badges, levels, and streak alerts</p>
            </div>
            <button
              onClick={() => handlePreferenceToggle('notifications')}
              className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none relative flex items-center p-1 cursor-pointer ${
                prefs.notifications ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  prefs.notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Weekly report toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Digest</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Receive a weekly summary of carbon savings</p>
            </div>
            <button
              onClick={() => handlePreferenceToggle('weeklyReport')}
              className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none relative flex items-center p-1 cursor-pointer ${
                prefs.weeklyReport ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  prefs.weeklyReport ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Unit System</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Toggle between Metric and Imperial distance/weight systems</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUnitToggle}
              className="px-3.5 py-1.5 bg-slate-800 text-xs font-semibold rounded-xl text-emerald-500 border border-slate-700 cursor-pointer transition-all hover:bg-slate-700"
            >
              {prefs.units === 'metric' ? 'Metric (km/kg)' : 'Imperial (mi/lbs)'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Palette className="w-4 h-4" /> Appearance & Theme
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map(t => (
            <motion.button key={t.value} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => setTheme(t.value as any)}
              className="p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all cursor-pointer"
              style={theme === t.value ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' } : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Demo Mode */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          🎯 Judge Demo Mode
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Switch between pre-loaded personas for demonstrations</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(DEMO_USERS).map(([key, u]) => (
            <motion.button key={key} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => loadDemoPersona(key)}
              className="p-4 rounded-2xl text-center transition-all cursor-pointer border"
              style={currentPersona === key 
                ? { background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.4)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)' } 
                : { background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <span className="text-3xl block mb-2">{u.avatar}</span>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>Level {u.level} · 🔥 {u.streak}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <Shield className="w-4 h-4" /> Data Management
        </h3>
        <div className="flex flex-wrap gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportCSV} className="px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportJSON} className="px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <Download className="w-3.5 h-3.5" /> Export JSON
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={triggerImportClick} className="px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <Upload className="w-3.5 h-3.5" /> Import Data (.json)
          </motion.button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Keyboard className="w-4 h-4" /> Keyboard Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { key: '⌘K', action: 'Search' },
            { key: '⌘/', action: 'Shortcuts' },
            { key: '⌘D', action: 'Dashboard' },
            { key: '⌘N', action: 'New Activity' },
          ].map(s => (
            <div key={s.key} className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800" style={{ background: 'var(--bg-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{s.action}</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono shadow-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)', border: '1px solid var(--border-color)' }}>{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
