// ==========================================
// EcoSphere AI — Home Energy Simulator
// ==========================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Lightbulb, Sun, Thermometer, Gauge, Refrigerator, Zap, DollarSign, Leaf, TrendingDown } from 'lucide-react';
import { calculateHomeEnergySavings } from '../lib/carbon-calculator';
import { formatCO2 } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ICONS: Record<string, any> = { Lightbulb, Sun, Home, Thermometer, Gauge, Refrigerator };

export default function HomeEnergyPage() {
  const [items, setItems] = useState(calculateHomeEnergySavings);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const enabledItems = useMemo(() => items.filter(i => i.enabled), [items]);
  const totalSavingsCO2 = useMemo(() => enabledItems.reduce((s, i) => s + i.annualSavingsCo2, 0), [enabledItems]);
  const totalSavingsMoney = useMemo(() => enabledItems.reduce((s, i) => s + i.annualSavingsMoney, 0), [enabledItems]);
  const totalSavingsKwh = useMemo(() => enabledItems.reduce((s, i) => s + i.annualSavingsKwh, 0), [enabledItems]);
  const totalCost = useMemo(() => enabledItems.reduce((s, i) => s + i.installCost, 0), [enabledItems]);

  const chartData = useMemo(() =>
    items.map(i => ({
      name: i.name.split(' ').slice(0, 2).join(' '),
      savings: i.enabled ? i.annualSavingsCo2 : 0,
      potential: i.annualSavingsCo2,
    })),
  [items]);

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Home Energy Simulator</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toggle upgrades to see your potential savings</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'CO₂ Saved/Year', value: formatCO2(totalSavingsCO2), icon: Leaf, color: '#10b981' },
          { label: 'Money Saved/Year', value: `$${totalSavingsMoney}`, icon: DollarSign, color: '#f59e0b' },
          { label: 'Energy Saved/Year', value: `${totalSavingsKwh.toLocaleString()} kWh`, icon: Zap, color: '#8b5cf6' },
          { label: 'Install Cost', value: `$${totalCost.toLocaleString()}`, icon: TrendingDown, color: '#3b82f6' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upgrade Toggles */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Home Upgrades</h3>
          <div className="space-y-4">
            {items.map((item, i) => {
              const Icon = ICONS[item.icon] || Home;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="stat-card cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                  style={item.enabled ? { border: '1px solid rgba(16, 185, 129, 0.4)' } : {}}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.enabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)' }}>
                      <Icon className="w-5 h-5" style={{ color: item.enabled ? '#10b981' : 'var(--text-tertiary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs text-ellipsis overflow-hidden whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                        {item.currentOption} → {item.ecoOption}
                      </p>
                    </div>
                    {/* Toggle */}
                    <div className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${item.enabled ? 'bg-primary-500' : ''}`}
                      style={!item.enabled ? { background: 'var(--border-color)' } : {}}>
                      <motion.div className="w-5 h-5 rounded-full bg-white shadow-sm" animate={{ x: item.enabled ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center p-1.5 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <p className="text-xs font-bold text-primary-500">{formatCO2(item.annualSavingsCo2)}</p>
                      <p className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>CO₂/yr</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <p className="text-xs font-bold text-amber-500">${item.annualSavingsMoney}</p>
                      <p className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>Saved/yr</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{item.paybackYears}yr</p>
                      <p className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>Payback</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-6">
          <div className="stat-card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Annual CO₂ Savings by Upgrade</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="potential" fill="var(--border-color)" radius={[0, 4, 4, 0]} name="Potential" />
                  <Bar dataKey="savings" fill="#10b981" radius={[0, 4, 4, 0]} name="Active" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="stat-card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>💰 Return on Investment</h3>
            {enabledItems.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Total investment</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>${totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Annual savings</span>
                  <span className="font-semibold text-primary-500">${totalSavingsMoney}/yr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Payback period</span>
                  <span className="font-semibold text-amber-500">{totalSavingsMoney > 0 ? (totalCost / totalSavingsMoney).toFixed(1) : '∞'} years</span>
                </div>
                <div className="flex justify-between text-sm pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>10-year net savings</span>
                  <span className="font-bold text-primary-500">${(totalSavingsMoney * 10 - totalCost).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Toggle upgrades above to see ROI calculations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
