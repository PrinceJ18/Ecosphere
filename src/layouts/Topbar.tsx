// ==========================================
// EcoSphere AI — Topbar
// ==========================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Moon, Sun, Search, Coins, Check } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import { useNotifications } from '../providers/NotificationProvider';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header
      className="flex items-center justify-between px-4 lg:px-6 py-3 border-b shrink-0"
      style={{
        background: 'var(--bg-glass)',
        borderColor: 'var(--border-color)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center relative">
          <AnimatePresence>
            {showSearch ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Search anything..."
                  className="text-sm"
                  onBlur={() => setShowSearch(false)}
                  style={{ background: 'var(--bg-card)' }}
                />
              </motion.div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
                style={{ color: 'var(--text-tertiary)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search...</span>
                <kbd className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>⌘K</kbd>
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Coins */}
        {user && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
          >
            <Coins className="w-4 h-4" />
            <span>{user.coins}</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-all duration-300 hover:scale-105"
          style={{ color: 'var(--text-secondary)' }}
        >
          <motion.div
            key={resolvedTheme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.div>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl transition-colors relative"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 rounded-2xl border overflow-hidden z-50"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  boxShadow: 'var(--shadow-xl)',
                }}
              >
                <div className="p-4 border-b font-semibold text-sm flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-medium"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                      No notifications yet
                    </p>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div
                        key={n.id}
                        onClick={() => !n.read && markAsRead(n.id)}
                        className="flex items-start gap-3 p-3 border-b transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        style={{
                          borderColor: 'var(--border-color)',
                          background: n.read ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                        }}
                      >
                        <span className="text-lg mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        {user && (
          <div
            className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-base cursor-pointer hover:scale-105 transition-transform"
          >
            {user.avatar}
          </div>
        )}
      </div>
    </header>
  );
}
