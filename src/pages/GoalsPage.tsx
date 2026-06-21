// ==========================================
// EcoSphere AI — Goals Page
// ==========================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Check, Clock, TrendingDown } from 'lucide-react';
import { useData } from '../providers/DataProvider';
import { formatCO2 } from '../lib/utils';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useData();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('20');
  const [category, setCategory] = useState('overall');

  const suggestedGoals = [
    { title: 'Reduce transport emissions by 30%', desc: 'Switch to public transit or bike for short trips', category: 'transportation', target: 30 },
    { title: 'Go meatless 3 days/week', desc: 'Replace meat with plant-based alternatives', category: 'food', target: 40 },
    { title: 'Cut electricity usage by 15%', desc: 'Use LED bulbs, unplug devices, use natural light', category: 'electricity', target: 15 },
    { title: 'Zero single-use plastic for a month', desc: 'Use reusable bags, bottles, and containers', category: 'shopping', target: 100 },
  ];

  const handleAdd = () => {
    if (!title) return;
    addGoal({
      title,
      description: desc,
      category: category as any,
      targetReduction: parseInt(target),
      currentProgress: 0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      milestones: [
        { id: '1', title: '25% complete', targetValue: 25, achieved: false },
        { id: '2', title: '50% complete', targetValue: 50, achieved: false },
        { id: '3', title: '75% complete', targetValue: 75, achieved: false },
        { id: '4', title: 'Goal achieved!', targetValue: 100, achieved: false },
      ],
      status: 'active',
      aiSuggested: false,
    });
    setTitle(''); setDesc(''); setShowForm(false);
  };

  const handleQuickAdd = (g: typeof suggestedGoals[0]) => {
    addGoal({
      title: g.title,
      description: g.desc,
      category: g.category as any,
      targetReduction: g.target,
      currentProgress: Math.floor(Math.random() * 40),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      milestones: [
        { id: '1', title: '25% complete', targetValue: 25, achieved: false },
        { id: '2', title: '50% complete', targetValue: 50, achieved: false },
        { id: '3', title: '75% complete', targetValue: 75, achieved: false },
        { id: '4', title: 'Goal achieved!', targetValue: 100, achieved: false },
      ],
      status: 'active',
      aiSuggested: true,
    });
  };

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Sustainability Goals</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Set targets and track your progress</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Goal
        </motion.button>
      </motion.div>

      {/* New Goal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="stat-card space-y-4">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title" />
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" />
              <div className="flex gap-4">
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="overall">Overall</option>
                  <option value="transportation">Transportation</option>
                  <option value="food">Food</option>
                  <option value="electricity">Electricity</option>
                  <option value="shopping">Shopping</option>
                </select>
                <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="Target %" className="w-24" />
                <motion.button whileHover={{ scale: 1.03 }} onClick={handleAdd} className="px-4 rounded-xl text-white gradient-primary text-sm font-semibold">Add</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggested Goals */}
      <div>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          🤖 AI Suggested Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestedGoals.map(g => (
            <motion.div key={g.title} whileHover={{ scale: 1.01 }} className="stat-card cursor-pointer" onClick={() => handleQuickAdd(g)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{g.title}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{g.desc}</p>
                </div>
                <Plus className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>{g.category}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>Target: {g.target}% reduction</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Goals */}
      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Goals ({goals.length})</h3>
        {goals.length === 0 ? (
          <div className="stat-card stat-card--empty">
            <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No goals yet. Create one above or pick a suggested goal!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map(goal => (
              <motion.div key={goal.id} layout className="stat-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                       {goal.aiSuggested && <span className="text-xs">🤖</span>}
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{goal.title}</p>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{goal.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => updateGoal(goal.id, { currentProgress: Math.min(100, goal.currentProgress + 10) })} className="p-1.5 rounded-lg hover:bg-primary-500/10 text-primary-500">
                      <TrendingDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>{goal.currentProgress}% complete</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>Target: {goal.targetReduction}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${goal.currentProgress}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  {/* Milestones */}
                  <div className="flex gap-1 mt-2">
                    {goal.milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-1 text-[10px]" style={{ color: goal.currentProgress >= m.targetValue ? '#10b981' : 'var(--text-tertiary)' }}>
                        {goal.currentProgress >= m.targetValue ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {m.targetValue}%
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
