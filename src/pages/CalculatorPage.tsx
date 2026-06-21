import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, UtensilsCrossed, Zap, ShoppingBag, Plane, Heart, Trash2, Plus, Check, History } from 'lucide-react';
import { useData } from '../providers/DataProvider';
import { useGamification } from '../providers/GamificationProvider';
import { ActivityCategory } from '../types';
import {
  getTransportOptions, getFoodOptions, getElectricityOptions, getShoppingOptions,
  getTravelOptions, getLifestyleOptions, getWasteOptions,
  calculateTransportEmission, calculateFoodEmission, calculateElectricityEmission,
  calculateShoppingEmission, calculateTravelEmission, calculateLifestyleEmission, calculateWasteEmission,
  calculateImpactScore, getImpactLabel,
} from '../lib/carbon-calculator';
import { formatCO2 } from '../lib/utils';

const categories = [
  { id: 'transportation' as ActivityCategory, icon: Car, label: 'Transport', color: '#3b82f6' },
  { id: 'food' as ActivityCategory, icon: UtensilsCrossed, label: 'Food', color: '#f59e0b' },
  { id: 'electricity' as ActivityCategory, icon: Zap, label: 'Energy', color: '#8b5cf6' },
  { id: 'shopping' as ActivityCategory, icon: ShoppingBag, label: 'Shopping', color: '#ec4899' },
  { id: 'travel' as ActivityCategory, icon: Plane, label: 'Travel', color: '#06b6d4' },
  { id: 'lifestyle' as ActivityCategory, icon: Heart, label: 'Lifestyle', color: '#10b981' },
  { id: 'waste' as ActivityCategory, icon: Trash2, label: 'Waste', color: '#6b7280' },
];

export default function CalculatorPage() {
  const { addLog, logs, deleteLog } = useData();
  const { addXp, completeMission } = useGamification();
  const [activeCategory, setActiveCategory] = useState<ActivityCategory>('transportation');
  const [selectedSub, setSelectedSub] = useState('');
  const [amount, setAmount] = useState('');
  const [co2Result, setCo2Result] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const getOptions = () => {
    switch (activeCategory) {
      case 'transportation': return getTransportOptions();
      case 'food': return getFoodOptions();
      case 'electricity': return getElectricityOptions();
      case 'shopping': return getShoppingOptions();
      case 'travel': return getTravelOptions();
      case 'lifestyle': return getLifestyleOptions();
      case 'waste': return getWasteOptions();
      default: return [];
    }
  };

  const options = getOptions();

  const calculateResult = () => {
    if (!selectedSub || !amount || parseFloat(amount) <= 0) return;
    const val = parseFloat(amount);
    let co2 = 0;

    switch (activeCategory) {
      case 'transportation': co2 = calculateTransportEmission(selectedSub as any, val); break;
      case 'food': co2 = calculateFoodEmission(selectedSub as any, val); break;
      case 'electricity': co2 = calculateElectricityEmission(selectedSub as any, val); break;
      case 'shopping': co2 = calculateShoppingEmission(selectedSub as any, val); break;
      case 'travel': co2 = calculateTravelEmission(selectedSub, val); break;
      case 'lifestyle': co2 = calculateLifestyleEmission(selectedSub, val); break;
      case 'waste': co2 = calculateWasteEmission(selectedSub, val); break;
    }

    setCo2Result(co2);
    setSaved(false);
  };

  const handleSave = () => {
    if (co2Result === null || !selectedSub) return;
    const opt = options.find(o => o.value === selectedSub);
    
    // Write log to DB/State
    addLog({
      category: activeCategory,
      subCategory: selectedSub,
      value: parseFloat(amount),
      unit: opt?.unit || '',
      co2Amount: co2Result,
      impactScore: calculateImpactScore(co2Result),
      date,
    });

    // Gamification Hookup
    addXp(10, `Logged activity for ${activeCategory}`);
    
    // Check missions
    if (activeCategory === 'food') completeMission('log_meal');
    if (activeCategory === 'transportation') completeMission('log_transport');

    setSaved(true);
    setTimeout(() => {
      setCo2Result(null);
      setAmount('');
      setSelectedSub('');
      setSaved(false);
    }, 1500);
  };

  const impactLabel = co2Result !== null ? getImpactLabel(calculateImpactScore(co2Result)) : null;

  // Filter history logs for the current active category
  const categoryHistory = logs.filter(l => l.category === activeCategory).slice(0, 5);

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Carbon Footprint Calculator</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Calculate your impact across all 7 categories and log them to monitor your daily allowance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin" role="tablist">
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveCategory(cat.id); setSelectedSub(''); setCo2Result(null); setAmount(''); }}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                style={
                  activeCategory === cat.id
                    ? { background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}40` }
                    : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                }
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Sub-category Selection */}
          <div className="stat-card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Select Item Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {options.map(opt => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedSub(opt.value); setCo2Result(null); }}
                  className="p-3 rounded-xl text-left transition-all cursor-pointer"
                  style={
                    selectedSub === opt.value
                      ? { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)' }
                      : { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }
                  }
                >
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{opt.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {opt.factor} kg CO₂/{opt.unit}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <AnimatePresence>
            {selectedSub && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="stat-card"
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Enter Activity Amount</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={amount}
                      onChange={e => { setAmount(e.target.value); setCo2Result(null); }}
                      placeholder={`Amount in ${options.find(o => o.value === selectedSub)?.unit || 'units'}`}
                      min="0"
                      step="0.1"
                      aria-label="Activity amount"
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      aria-label="Activity date"
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={calculateResult}
                    className="px-6 py-2 rounded-xl text-white text-xs font-semibold gradient-primary cursor-pointer"
                  >
                    Calculate Impact
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Calculation History */}
          {categoryHistory.length > 0 && (
            <div className="stat-card space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                <History className="w-4 h-4 text-emerald-500" />
                <span>Recent {activeCategory.replace(/^\w/, c => c.toUpperCase())} Logs</span>
              </div>
              <div className="space-y-2">
                {categoryHistory.map(log => (
                  <div key={log.id} className="flex justify-between items-center p-2 rounded-lg text-xs" style={{ background: 'var(--bg-secondary)' }}>
                    <div>
                      <p className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{log.subCategory.replace('_', ' ')}</p>
                      <p style={{ color: 'var(--text-secondary)' }}>{log.value} {log.unit} • {new Date(log.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-500">{log.co2Amount.toFixed(1)} kg CO₂</span>
                      <button 
                        onClick={() => deleteLog(log.id)}
                        className="text-rose-500 font-semibold hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result Panel */}
        <div className="space-y-6">
          <AnimatePresence>
            {co2Result !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="stat-card text-center"
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>CO₂ Emissions</h3>

                {/* Gauge */}
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-color)" strokeWidth="10" />
                    <motion.circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke={impactLabel?.color || '#10b981'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - Math.min(1, calculateImpactScore(co2Result) / 100)) }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatCO2(co2Result)}
                    </motion.span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>CO₂e</span>
                  </div>
                </div>

                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: `${impactLabel?.color}15`, color: impactLabel?.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: impactLabel?.color }} />
                  {impactLabel?.label} Impact
                </div>

                <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                  Equivalent to {(co2Result / 0.21).toFixed(0)} km driving a petrol car
                </p>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saved}
                  className="mt-4 w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  style={{
                    background: saved
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'linear-gradient(135deg, #10b981, #14b8a6)',
                  }}
                >
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Plus className="w-4 h-4" /> Add to Log (+10 XP)</>}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Tips */}
          <div className="stat-card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>💡 Quick Tips</h3>
            <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <p>🚲 Cycling saves 0.21 kg CO₂ per km vs driving</p>
              <p>🥗 A vegan meal is 38x less emissions than beef</p>
              <p>🔌 Videostreaming emits 18g CO₂ per hour</p>
              <p>♻️ Composting emits 25x less CO₂ than sending to landfill</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
