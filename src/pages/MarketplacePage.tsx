// ==========================================
// EcoSphere AI — Marketplace Page
// ==========================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Leaf, Star, ArrowRight } from 'lucide-react';
import { DEMO_PRODUCTS } from '../lib/seed-data';
import { formatCO2 } from '../lib/utils';

const CATEGORIES = ['all', 'reusable', 'solar', 'led', 'eco_bags', 'organic', 'local'];

export default function MarketplacePage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? DEMO_PRODUCTS : DEMO_PRODUCTS.filter(p => p.category === filter);

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Sustainable Marketplace</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Eco-friendly alternatives that make a difference</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} className="px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all"
            style={filter === c ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' } : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            {c.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card stat-card--flush overflow-hidden group"
          >
            {/* Image Area */}
            <div className="h-40 flex items-center justify-center text-6xl" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05))' }}>
              <motion.span whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: 'spring' }}>{product.image}</motion.span>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  {product.category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <Star className="w-3 h-3 fill-current" /> {product.rating}
                </div>
              </div>

              <h3 className="text-sm font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
              <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs text-primary-500">
                  <Leaf className="w-3 h-3" /> Saves {formatCO2(product.co2Savings)}/yr
                </div>
                <div className="h-3 w-px" style={{ background: 'var(--border-color)' }} />
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{product.reviews} reviews</div>
              </div>

              {/* Sustainability Score Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Sustainability Score</span>
                  <span className="font-semibold text-primary-500">{product.sustainabilityScore}/100</span>
                </div>
                <div className="progress-bar">
                  <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${product.sustainabilityScore}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>${product.price}</p>
                <motion.button whileHover={{ scale: 1.05 }} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white gradient-primary flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </motion.button>
              </div>

              {/* Why Switch */}
              <div className="mt-4 p-4 rounded-xl text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                💡 <strong>Why switch?</strong> {product.whySwitch.slice(0, 100)}...
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
