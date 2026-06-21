// ==========================================
// EcoSphere AI — EcoCity Builder Page
// ==========================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, TreePine, Sun, Wind, Bike, Battery, Recycle, Flower2 } from 'lucide-react';
import { useData } from '../providers/DataProvider';
import { formatCO2 } from '../lib/utils';

const BUILDINGS = [
  { id: 'tree1', icon: '🌳', name: 'Oak Tree', co2: 5, x: 15, y: 70, unlockText: 'Save 5 kg CO₂' },
  { id: 'tree2', icon: '🌲', name: 'Pine Tree', co2: 10, x: 25, y: 65, unlockText: 'Save 10 kg CO₂' },
  { id: 'house', icon: '🏠', name: 'Eco House', co2: 25, x: 40, y: 60, unlockText: 'Save 25 kg CO₂' },
  { id: 'solar', icon: '☀️', name: 'Solar Farm', co2: 50, x: 60, y: 55, unlockText: 'Save 50 kg CO₂' },
  { id: 'park', icon: '🏞️', name: 'Green Park', co2: 75, x: 30, y: 45, unlockText: 'Save 75 kg CO₂' },
  { id: 'wind', icon: '🌬️', name: 'Wind Turbine', co2: 100, x: 75, y: 50, unlockText: 'Save 100 kg CO₂' },
  { id: 'garden', icon: '🌻', name: 'Community Garden', co2: 150, x: 50, y: 40, unlockText: 'Save 150 kg CO₂' },
  { id: 'bike', icon: '🚲', name: 'Bike Lane', co2: 200, x: 20, y: 35, unlockText: 'Save 200 kg CO₂' },
  { id: 'ev', icon: '⚡', name: 'EV Station', co2: 300, x: 65, y: 35, unlockText: 'Save 300 kg CO₂' },
  { id: 'recycle', icon: '♻️', name: 'Recycling Center', co2: 400, x: 45, y: 25, unlockText: 'Save 400 kg CO₂' },
  { id: 'school', icon: '🏫', name: 'Green School', co2: 500, x: 35, y: 20, unlockText: 'Save 500 kg CO₂' },
  { id: 'hospital', icon: '🏥', name: 'Eco Hospital', co2: 750, x: 55, y: 15, unlockText: 'Save 750 kg CO₂' },
  { id: 'tower', icon: '🏢', name: 'Carbon Tower', co2: 1000, x: 70, y: 20, unlockText: 'Save 1,000 kg CO₂' },
  { id: 'stadium', icon: '🏟️', name: 'Green Stadium', co2: 2000, x: 50, y: 10, unlockText: 'Save 2,000 kg CO₂' },
];

export default function EcoCityPage() {
  const { totalCO2Saved } = useData();
  const unlockedCount = useMemo(() => BUILDINGS.filter(b => totalCO2Saved >= b.co2).length, [totalCO2Saved]);
  const nextBuilding = useMemo(() => BUILDINGS.find(b => totalCO2Saved < b.co2), [totalCO2Saved]);
  const progress = nextBuilding ? ((totalCO2Saved / nextBuilding.co2) * 100) : 100;

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>EcoCity Builder</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Every kg of CO₂ saved grows your virtual sustainable city</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-primary-500">{formatCO2(totalCO2Saved)}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Saved</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-amber-500">{unlockedCount}/{BUILDINGS.length}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Buildings Unlocked</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Level {Math.floor(unlockedCount / 3) + 1}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>City Level</p>
        </div>
      </div>

      {/* Next Unlock */}
      {nextBuilding && (
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{nextBuilding.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Next: {nextBuilding.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{nextBuilding.unlockText}</p>
              </div>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{formatCO2(totalCO2Saved)} / {formatCO2(nextBuilding.co2)}</span>
          </div>
          <div className="progress-bar">
            <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${Math.min(100, progress)}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      )}

      {/* City View */}
      <div className="stat-card overflow-hidden" style={{ minHeight: '400px' }}>
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #0ea5e9 0%, #38bdf8 30%, #86efac 60%, #4ade80 80%, #16a34a 100%)' }}>
          {/* Sky elements */}
          <div className="absolute top-4 right-8 text-4xl opacity-80">☁️</div>
          <div className="absolute top-12 left-20 text-3xl opacity-60">☁️</div>
          <div className="absolute top-6 left-1/2 text-2xl opacity-40">☁️</div>

          {/* Buildings */}
          {BUILDINGS.map((building, i) => {
            const isUnlocked = totalCO2Saved >= building.co2;
            return (
              <motion.div
                key={building.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isUnlocked ? 1 : 0.5, opacity: isUnlocked ? 1 : 0.3 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                whileHover={isUnlocked ? { scale: 1.3, zIndex: 10 } : {}}
                className="absolute cursor-pointer"
                style={{ left: `${building.x}%`, top: `${building.y}%`, transform: 'translate(-50%, -50%)' }}
                title={isUnlocked ? `${building.name} ✓` : `${building.name} — ${building.unlockText}`}
              >
                <span className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>{building.icon}</span>
                {isUnlocked && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}

          {/* Ground decorations */}
          <div className="absolute bottom-0 left-0 right-0 h-1/5" style={{ background: 'linear-gradient(to top, #15803d, transparent)' }} />
        </div>
      </div>

      {/* Building Grid */}
      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>All Buildings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {BUILDINGS.map(b => {
            const unlocked = totalCO2Saved >= b.co2;
            return (
              <div key={b.id} className={`stat-card stat-card--compact text-center ${unlocked ? '' : 'opacity-50'}`}>
                <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>{b.icon}</span>
                <p className="text-[10px] font-medium mt-1 truncate" style={{ color: 'var(--text-primary)' }}>{b.name}</p>
                <p className="text-[9px]" style={{ color: unlocked ? '#10b981' : 'var(--text-tertiary)' }}>
                  {unlocked ? '✓ Unlocked' : `${formatCO2(b.co2)}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
