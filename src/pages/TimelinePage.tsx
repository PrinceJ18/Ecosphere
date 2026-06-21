// ==========================================
// EcoSphere AI — Timeline/Analytics Page
// ==========================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, BarChart3, TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useData } from '../providers/DataProvider';
import { formatCO2, formatDateShort } from '../lib/utils';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#6b7280'];

export default function TimelinePage() {
  const { logs, getDailyTotals, getCategoryBreakdown } = useData();
  const [range, setRange] = useState<'7' | '30' | '90' | '365'>('30');

  const dailyTotals = useMemo(() => getDailyTotals(parseInt(range)), [getDailyTotals, range]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(), [getCategoryBreakdown]);
  const totalEmissions = useMemo(() => dailyTotals.reduce((s, d) => s + d.total, 0), [dailyTotals]);
  const avgDaily = useMemo(() => totalEmissions / Math.max(1, parseInt(range)), [totalEmissions, range]);

  // Heatmap data - last 12 weeks
  const heatmapData = useMemo(() => {
    const weeks: Array<Array<{ date: string; total: number }>> = [];
    const totals = getDailyTotals(84); // 12 weeks
    for (let w = 0; w < 12; w++) {
      weeks.push(totals.slice(w * 7, (w + 1) * 7));
    }
    return weeks;
  }, [getDailyTotals]);

  // Radar data
  const radarData = useMemo(() => {
    return categoryBreakdown.map(c => ({
      category: c.category.charAt(0).toUpperCase() + c.category.slice(1),
      value: c.total,
      fullMark: Math.max(...categoryBreakdown.map(x => x.total), 1),
    }));
  }, [categoryBreakdown]);

  // Bar chart data for weekly comparison
  const chartData = useMemo(() => {
    return dailyTotals.map(d => ({
      ...d,
      label: formatDateShort(d.date),
    }));
  }, [dailyTotals]);

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'var(--border-color)';
    const max = Math.max(...heatmapData.flat().map(d => d.total), 1);
    const intensity = value / max;
    if (intensity < 0.25) return '#065f46';
    if (intensity < 0.5) return '#059669';
    if (intensity < 0.75) return '#10b981';
    return '#34d399';
  };

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Carbon Timeline</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Track your emissions over time</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          {[
            { val: '7', label: '7D' }, { val: '30', label: '30D' },
            { val: '90', label: '90D' }, { val: '365', label: '1Y' },
          ].map(r => (
            <button
              key={r.val}
              onClick={() => setRange(r.val as any)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={range === r.val ? { background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white' } : { color: 'var(--text-secondary)' }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Emissions', value: formatCO2(totalEmissions), color: '#3b82f6' },
          { label: 'Daily Average', value: formatCO2(avgDaily), color: '#f59e0b' },
          { label: 'Activities Logged', value: logs.length.toString(), color: '#8b5cf6' },
          { label: 'Categories', value: categoryBreakdown.length.toString(), color: '#10b981' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Emissions Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} interval={Math.floor(parseInt(range) / 10)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Category Breakdown</h3>
          <div className="h-56 flex items-center">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="total" nameKey="category">
                    {categoryBreakdown.map((entry, i) => <Cell key={entry.category} fill={entry.color || COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number) => [`${v.toFixed(1)} kg`, '']} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm mx-auto" style={{ color: 'var(--text-tertiary)' }}>No data yet</p>}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryBreakdown.map(c => (
              <div key={c.category} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="capitalize truncate" style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                <span className="ml-auto font-medium" style={{ color: 'var(--text-primary)' }}>{formatCO2(c.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Category Radar</h3>
          <div className="h-56">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                  <PolarRadiusAxis tick={{ fontSize: 8, fill: 'var(--text-tertiary)' }} />
                  <Radar name="Emissions" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm flex items-center justify-center h-full" style={{ color: 'var(--text-tertiary)' }}>No data yet</p>}
          </div>
        </div>

        {/* Heatmap */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Activity Heatmap (12 weeks)</h3>
          <div className="flex gap-1 mb-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="w-6 text-center">{d[0]}</span>
            ))}
          </div>
          <div className="flex gap-1">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <motion.div
                    key={day.date}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.005 }}
                    className="w-6 h-6 rounded-sm cursor-pointer"
                    style={{ background: getHeatmapColor(day.total) }}
                    title={`${day.date}: ${day.total.toFixed(1)} kg CO₂`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            <span>Less</span>
            {['var(--border-color)', '#065f46', '#059669', '#10b981', '#34d399'].map(c => (
              <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
