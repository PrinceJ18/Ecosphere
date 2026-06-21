// ==========================================
// EcoSphere AI — Signup Page
// ==========================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

const AVATARS = ['🌱', '🌿', '🌳', '🌍', '🦸‍♀️', '🧑‍💻', '🌸', '⚡', '🌊', '🔥', '💎', '🌈'];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🌱');
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <div className="auth-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">Join EcoSphere</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Start your sustainability journey today
          </p>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Choose your avatar and get started</p>

          {/* Avatar Selection */}
          <div className="mb-6">
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Choose Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(avatar => (
                <motion.button
                  key={avatar}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                    selectedAvatar === avatar ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                  }`}
                  style={{
                    background: selectedAvatar === avatar ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    ringOffsetColor: 'var(--bg-card)',
                  }}
                >
                  {avatar}
                </motion.button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl text-white font-semibold gradient-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <div className="spinner" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
