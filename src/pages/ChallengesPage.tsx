import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Users, Zap, Check, Plus } from 'lucide-react';
import { useGamification } from '../providers/GamificationProvider';
import { formatNumber } from '../lib/utils';

const UPCOMING_CHALLENGES = [
  {
    id: 'up_compost',
    title: 'Zero Food Waste Week',
    description: 'Compost all organic waste and reduce leftovers to zero.',
    type: 'weekly',
    xpReward: 80,
    coinReward: 35,
    icon: '🍂',
    participants: 1240,
    startsIn: 'Starts in 4 days',
  },
  {
    id: 'up_plastic',
    title: 'Plastic Free Journey',
    description: 'Avoid single-use plastic bottles, bags, and packaging for 10 days.',
    type: 'monthly',
    xpReward: 150,
    coinReward: 70,
    icon: '🚫',
    participants: 3105,
    startsIn: 'Starts in 11 days',
  },
];

export default function ChallengesPage() {
  const [tab, setTab] = useState<'available' | 'active' | 'completed' | 'upcoming'>('available');
  const { challenges, joinChallenge, progressChallenge } = useGamification();

  // Filter based on tabs
  const displayedChallenges = challenges.filter(c => {
    if (tab === 'available') return c.status !== 'completed' && !c.joined;
    if (tab === 'active') return c.status === 'active' && c.joined;
    if (tab === 'completed') return c.status === 'completed';
    return false;
  });

  const handleLogProgress = (challengeId: string, unit: string) => {
    // Increment progress: 1 for meals/trips, 0.5 for km
    const increment = unit === 'km' ? 0.5 : 1;
    progressChallenge(challengeId, increment);
  };

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Eco Challenges</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Join real-time environmental challenges, compete with the community, and earn rewards</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit overflow-x-auto max-w-full scrollbar-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {([
          { id: 'available', label: 'Available' },
          { id: 'active', label: 'Active' },
          { id: 'completed', label: 'Completed' },
          { id: 'upcoming', label: 'Upcoming' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer"
            style={
              tab === t.id
                ? { background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Render Regular Challenges */}
        {tab !== 'upcoming' && displayedChallenges.map((challenge, i) => {
          const progress = (challenge.currentValue / challenge.targetValue) * 100;
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="stat-card flex flex-col justify-between"
              style={challenge.status === 'completed' ? { border: '1px solid rgba(16, 185, 129, 0.2)' } : {}}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2 rounded-xl bg-slate-900/50">{challenge.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                      challenge.type === 'daily' ? 'bg-blue-500/10 text-blue-400' :
                      challenge.type === 'weekly' ? 'bg-purple-500/10 text-purple-400' :
                      challenge.type === 'monthly' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {challenge.type}
                    </span>
                    {challenge.status === 'completed' && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold mt-1.5 truncate" style={{ color: 'var(--text-primary)' }}>{challenge.title}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{challenge.description}</p>

                  {/* Progress (Only for Active / Completed) */}
                  {challenge.joined && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Progress: {challenge.currentValue} / {challenge.targetValue} {challenge.unit}
                        </span>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(progress)}%</span>
                      </div>
                      <div className="progress-bar h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="progress-bar-fill h-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, progress)}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 font-semibold text-emerald-500"><Zap className="w-3.5 h-3.5" />{challenge.xpReward} XP</span>
                      <span className="flex items-center gap-1 font-semibold text-amber-500">🪙 {challenge.coinReward}</span>
                    </div>
                    {challenge.participants && (
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        <Users className="w-3.5 h-3.5" /> {formatNumber(challenge.participants)} joined
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4">
                {!challenge.joined && challenge.status !== 'completed' && (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Join Challenge
                  </button>
                )}
                {challenge.joined && challenge.status === 'active' && (
                  <button
                    onClick={() => handleLogProgress(challenge.id, challenge.unit)}
                    className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Progress (+{challenge.unit === 'km' ? '0.5' : '1'} {challenge.unit})
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Render Upcoming Challenges */}
        {tab === 'upcoming' && UPCOMING_CHALLENGES.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card flex flex-col justify-between"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl p-2 rounded-xl bg-slate-900/50">{challenge.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400">
                    {challenge.type}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> {challenge.startsIn}
                  </span>
                </div>
                <h3 className="text-sm font-bold mt-1.5 truncate" style={{ color: 'var(--text-primary)' }}>{challenge.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{challenge.description}</p>

                <div className="flex items-center justify-between mt-4 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-emerald-500"><Zap className="w-3.5 h-3.5" />{challenge.xpReward} XP</span>
                    <span className="flex items-center gap-1 font-semibold text-amber-500">🪙 {challenge.coinReward}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    <Users className="w-3.5 h-3.5" /> {formatNumber(challenge.participants)} interested
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {tab !== 'upcoming' && displayedChallenges.length === 0 && (
        <div className="stat-card stat-card--empty">
          <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {tab === 'active' 
              ? 'No active challenges. Head over to the "Available" tab to join some!' 
              : tab === 'completed' 
                ? 'No completed challenges yet. Earn your first badge today!' 
                : 'No available challenges right now.'}
          </p>
        </div>
      )}
    </div>
  );
}
