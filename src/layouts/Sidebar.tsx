// ==========================================
// EcoSphere AI — Sidebar Navigation
// ==========================================

import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calculator, Bot, LineChart, Target,
  Swords, Users, Map, ShoppingBag, ScanLine, TreePine,
  FileText, Settings, Building2, Home, LogOut, Flame, X,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { getLevelForXp, getXpProgress } from '../lib/gamification';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calculator', icon: Calculator, label: 'Calculator' },
  { path: '/ai-coach', icon: Bot, label: 'AI Coach' },
  { path: '/timeline', icon: LineChart, label: 'Timeline' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/challenges', icon: Swords, label: 'Challenges' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/map', icon: Map, label: 'Eco Map' },
  { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { path: '/scanner', icon: ScanLine, label: 'Scanner' },
  { path: '/offset', icon: TreePine, label: 'Offset' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/ecocity', icon: Building2, label: 'EcoCity' },
  { path: '/home-energy', icon: Home, label: 'Home Energy' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const level = user ? getLevelForXp(user.xp) : null;
  const xpProgress = user ? getXpProgress(user.xp) : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 border-r shrink-0"
        style={{
          background: 'var(--bg-sidebar)',
          borderColor: 'var(--border-color)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <SidebarContent
          user={user}
          level={level}
          xpProgress={xpProgress}
          onLogout={handleLogout}
          onClose={onClose}
          isMobile={false}
        />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r lg:hidden flex flex-col"
            style={{
              background: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <SidebarContent
              user={user}
              level={level}
              xpProgress={xpProgress}
              onLogout={handleLogout}
              onClose={onClose}
              isMobile={true}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ user, level, xpProgress, onLogout, onClose, isMobile }: any) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text">EcoSphere</h1>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>AI Carbon Platform</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-800/50">
            <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        )}
      </div>

      {/* User Card */}
      {user && (
        <div className="mx-3 mt-3 p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-lg">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{level?.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{level?.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-xs font-bold text-orange-500">{user.streak}</span>
            </div>
          </div>
          {/* XP Bar */}
          {xpProgress && (
            <div className="mt-2.5">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                <span>Level {level?.level}</span>
                <span>{xpProgress.current}/{xpProgress.required} XP</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${xpProgress.percentage}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white gradient-primary shadow-md'
                  : 'hover:translate-x-0.5'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {}
                : { color: 'var(--text-secondary)' }
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10 text-red-400"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Log Out</span>
        </button>
      </div>
    </>
  );
}
