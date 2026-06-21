// ==========================================
// EcoSphere AI — AI Coach Page
// ==========================================

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Lightbulb, Calendar, BarChart3, Target } from 'lucide-react';
import { useData } from '../providers/DataProvider';
import { AIMessage } from '../types';
import { generateAIResponse, getAIGreeting, generateCarbonTwin } from '../lib/ai-engine';
import { generateId, formatCO2 } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AICoachPage() {
  const { logs } = useData();
  const [messages, setMessages] = useState<AIMessage[]>([
    { id: generateId(), role: 'assistant', content: getAIGreeting(), timestamp: new Date().toISOString(), suggestions: ['Show my footprint analysis', 'Give me a weekly plan', 'How can I reduce emissions?'] },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTwin, setShowTwin] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const dailyAvg = useMemo(() => {
    if (logs.length === 0) return 15;
    const days = new Set(logs.map(l => l.date)).size || 1;
    return logs.reduce((s, l) => s + l.co2Amount, 0) / days;
  }, [logs]);

  const twinData = useMemo(() => {
    const twin = generateCarbonTwin(dailyAvg);
    return twin.labels.map((label, i) => ({
      name: label,
      current: Math.round(twin.current[i]),
      optimistic: Math.round(twin.optimistic[i]),
      pessimistic: Math.round(twin.pessimistic[i]),
    }));
  }, [dailyAvg]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: AIMessage = { id: generateId(), role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(msg, logs);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const quickActions = [
    { icon: BarChart3, label: 'Analyze Footprint', action: 'Show my footprint analysis' },
    { icon: Calendar, label: 'Weekly Plan', action: 'Create a weekly sustainability plan' },
    { icon: Target, label: 'Set Goals', action: 'Suggest goals for me' },
    { icon: Lightbulb, label: 'Get Tips', action: 'Give me a sustainability tip' },
  ];

  return (
    <div className="page-container flex flex-col" style={{ height: 'calc(100vh - 110px)' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>AI Climate Coach</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Powered by EcoSphere Intelligence</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowTwin(!showTwin)}
          className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5"
          style={{
            background: showTwin ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
            color: showTwin ? '#10b981' : 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5" /> Carbon Twin
        </motion.button>
      </motion.div>

      {/* Carbon Twin Panel */}
      <AnimatePresence>
        {showTwin && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="stat-card">
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🌍 Carbon Twin — Future Projection</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Your cumulative CO₂ over the next 10 years based on current habits ({formatCO2(dailyAvg)}/day avg)
              </p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={twinData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(v: number) => [`${formatCO2(v)}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="pessimistic" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="No changes" />
                    <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} dot={false} name="Current pace" />
                    <Line type="monotone" dataKey="optimistic" stroke="#10b981" strokeWidth={2} dot={false} name="With improvements" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {quickActions.map(qa => (
          <motion.button
            key={qa.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSend(qa.action)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          >
            <qa.icon className="w-3 h-3" /> {qa.label}
          </motion.button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center mr-2 mt-1 shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
              <div className="text-sm whitespace-pre-wrap leading-relaxed" style={msg.role === 'assistant' ? { color: 'var(--text-primary)' } : {}}>
                {msg.content}
              </div>
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {msg.suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium text-primary-500 transition-colors"
                      style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex gap-1 p-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary-500"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="mt-6 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything about sustainability..."
          className="flex-1"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="px-4 rounded-xl text-white gradient-primary disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
