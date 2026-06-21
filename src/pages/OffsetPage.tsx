import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Award, Download, Check, History, Globe } from 'lucide-react';
import { DEMO_OFFSET_PROJECTS } from '../lib/seed-data';
import { useAuth } from '../providers/AuthProvider';
import { useNotifications } from '../providers/NotificationProvider';
import { useGamification } from '../providers/GamificationProvider';
import { formatCO2, getStorageItem, setStorageItem } from '../lib/utils';
import { OffsetPurchase } from '../types';

export default function OffsetPage() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const { addXp, awardCoins, unlockBadge } = useGamification();
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [amount, setAmount] = useState('10');
  const [purchased, setPurchased] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<OffsetPurchase[]>([]);

  // Load purchase history
  useEffect(() => {
    if (user) {
      const userPurchases = getStorageItem<OffsetPurchase[]>('offset_purchases', [])
        .filter(p => p.userId === user.id);
      setPurchases(userPurchases);
      setPurchased(userPurchases.map(p => p.projectId));
    }
  }, [user]);

  const handleOffset = (projectId: string) => {
    const project = DEMO_OFFSET_PROJECTS.find(p => p.id === projectId);
    if (!project || !user) return;
    
    const cost = parseFloat(amount);
    if (isNaN(cost) || cost <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }
    
    const co2Offset = (cost / project.pricePerTon) * 1000; // in kg
    
    const newPurchase: OffsetPurchase = {
      id: 'tx_' + Math.random().toString(36).substring(2, 11),
      userId: user.id,
      projectId,
      projectName: project.name,
      amount: cost,
      co2Offset,
      date: new Date().toISOString(),
      certificate: `cert_${Math.random().toString(36).substring(2, 11)}`,
    };

    const updated = [newPurchase, ...purchases];
    setPurchases(updated);
    
    // Save to global list in localStorage
    const all = getStorageItem<OffsetPurchase[]>('offset_purchases', []);
    setStorageItem('offset_purchases', [newPurchase, ...all]);

    // Gamification
    addXp(40, `Carbon Offset: ${project.name}`);
    awardCoins(Math.round(cost * 2), `Offset Reward`);
    
    if (project.type === 'tree_planting') {
      unlockBadge('tree_planter');
    }

    setPurchased(prev => [...prev, projectId]);
    setSelectedProject(null);
    showToast(`Offset ${formatCO2(co2Offset)} successfully! Download your certificate below.`, 'success');
  };

  const downloadCertificate = (purchase: OffsetPurchase) => {
    const svgString = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#022c22" />
          </linearGradient>
        </defs>
        <rect width="780" height="580" x="10" y="10" rx="20" fill="url(#cardGrad)" stroke="#10b981" stroke-width="4"/>
        <circle cx="400" cy="180" r="60" fill="#10b981" opacity="0.1"/>
        <text x="400" y="195" font-family="system-ui, sans-serif" font-size="50" text-anchor="middle">🌱</text>
        <text x="400" y="80" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#10b981" text-anchor="middle">CARBON OFFSET CERTIFICATE</text>
        <text x="400" y="115" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">AWARDED BY ECOSPHERE AI</text>
        
        <text x="400" y="300" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">This certifies that</text>
        <text x="400" y="340" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">${user?.name || 'Eco Champion'}</text>
        
        <text x="400" y="390" font-family="system-ui, sans-serif" font-size="16" fill="#e2e8f0" text-anchor="middle">has contributed to neutralize</text>
        <text x="400" y="440" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="#10b981" text-anchor="middle">${(purchase.co2Offset).toFixed(1)} kg CO₂e</text>
        
        <text x="400" y="480" font-family="system-ui, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Project: ${purchase.projectName}</text>
        <line x1="200" y1="520" x2="600" y2="520" stroke="#1e293b" stroke-width="1"/>
        <text x="400" y="550" font-family="system-ui, sans-serif" font-size="11" fill="#475569" text-anchor="middle">Certificate ID: ${purchase.certificate} • Transaction ID: ${purchase.id}</text>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `ecosphere_certificate_${purchase.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Certificate download initiated!', 'success');
  };

  const project = DEMO_OFFSET_PROJECTS.find(p => p.id === selectedProject);
  const offsetKg = project ? (parseFloat(amount) / project.pricePerTon) * 1000 : 0;

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Carbon Offset</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Support verified carbon mitigation programs to balance your personal emissions footprint</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Projects Partnered', value: DEMO_OFFSET_PROJECTS.length.toString(), icon: '🌍' },
          { label: 'Trees Funded', value: '12,450', icon: '🌳' },
          { label: 'Total CO₂ Offset', value: '2.4M kg', icon: '💨' },
          { label: 'Eco Contributors', value: '8,920', icon: '👥' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card text-center">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEMO_OFFSET_PROJECTS.map((proj, i) => (
          <motion.div
            key={proj.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card stat-card--flush overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="h-32 flex items-center justify-center text-5xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/20 border-b border-dashed border-slate-200 dark:border-slate-800">
                {proj.image}
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  {proj.verified && (
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white dark:text-slate-900 shadow-sm shadow-emerald-500/20 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" /> VERIFIED
                    </span>
                  )}
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 capitalize">
                    {proj.type.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{proj.name}</h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{proj.description}</p>
                </div>

                <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {proj.type === 'tree_planting' ? <TreePine className="w-3.5 h-3.5 shrink-0 text-emerald-500" /> : <Globe className="w-3.5 h-3.5 shrink-0 text-teal-500" />}
                  <span>
                    {proj.type === 'tree_planting' 
                      ? 'Targeted re-forestation & wildlife corridor expansion' 
                      : 'Displacing grid emissions with clean wind/solar generation'}
                  </span>
                </div>

                {/* Trust and Registry Metrics */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[10px]" style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-color)' }}>
                  <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Certification Standard:</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">Gold Standard Verified</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Registry ID:</span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">GS-483{i + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Annual Offset:</span>
                    <span className="font-bold text-emerald-500">{proj.totalOffset.toLocaleString()} tons CO₂</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <span>Org: <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{proj.organization}</strong></span>
                  <span>📍 {proj.location}</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>${proj.pricePerTon}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}> /ton CO₂</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedProject(proj.id)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white gradient-primary cursor-pointer shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all"
                >
                  Offset Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase History Section */}
      {purchases.length > 0 && (
        <div className="stat-card space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Offset Contribution History</h3>
          </div>
          <div className="space-y-4">
            {purchases.map(p => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4 text-xs" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div className="space-y-1">
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.projectName}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Offset: <span className="font-semibold text-emerald-500">{formatCO2(p.co2Offset)}</span> • Contributed: <span className="font-semibold">${p.amount}</span>
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>ID: {p.id} • Date: {new Date(p.date).toLocaleDateString()}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => downloadCertificate(p)}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer w-fit border border-emerald-500/15 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Certificate
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offset Modal */}
      <AnimatePresence>
        {selectedProject && project && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProject(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="stat-card stat-card--spacious w-full max-w-md space-y-4"
            >
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Offset Emissions</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.name}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="offset-amount" className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Amount ($)</label>
                  <input
                    id="offset-amount"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="p-4 rounded-2xl text-center space-y-2" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Estimating carbon offset amount:</p>
                  <p className="text-3xl font-black text-emerald-500">{formatCO2(offsetKg)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Equivalent to protecting biodiversity & cooling atmosphere</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 border border-slate-700 transition-all cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleOffset(project.id)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white gradient-primary transition-all cursor-pointer"
                  >
                    Pay & Offset
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
