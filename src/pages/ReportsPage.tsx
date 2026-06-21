import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingDown, BarChart3, Leaf, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useData } from '../providers/DataProvider';
import { formatCO2, formatDateShort } from '../lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  transportation: '#3b82f6',
  food: '#f59e0b',
  electricity: '#8b5cf6',
  shopping: '#ec4899',
  travel: '#06b6d4',
  lifestyle: '#10b981',
  waste: '#6b7280',
};

export default function ReportsPage() {
  const { logs, getDailyTotals, getCategoryBreakdown, totalCO2Saved } = useData();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');

  // Filter logs based on selected date range
  const filteredLogs = useMemo(() => {
    if (dateRange === 'all') return logs;
    const days = parseInt(dateRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return logs.filter(l => l.date >= cutoffStr);
  }, [logs, dateRange]);

  const totalEmissions = useMemo(() => {
    return filteredLogs.reduce((s, l) => s + l.co2Amount, 0);
  }, [filteredLogs]);

  const totalDays = useMemo(() => {
    return Math.max(1, new Set(filteredLogs.map(l => l.date)).size);
  }, [filteredLogs]);

  const avgDaily = useMemo(() => {
    return totalEmissions / totalDays;
  }, [totalEmissions, totalDays]);

  const categoryBreakdown = useMemo(() => {
    const byCategory: Record<string, number> = {};
    filteredLogs.forEach(l => {
      byCategory[l.category] = (byCategory[l.category] || 0) + l.co2Amount;
    });
    return Object.entries(byCategory)
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
        color: CATEGORY_COLORS[category] || '#6b7280',
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredLogs]);

  const weeklyData = useMemo(() => {
    const daysToLoad = dateRange === '7' ? 7 : dateRange === '30' ? 28 : dateRange === '90' ? 90 : 28;
    const daily = getDailyTotals(daysToLoad);
    
    // Group into 4 periods based on days
    const chunk = Math.ceil(daysToLoad / 4);
    const periods: Array<{ label: string; total: number }> = [];
    
    for (let i = 0; i < 4; i++) {
      const slice = daily.slice(i * chunk, (i + 1) * chunk);
      periods.push({
        label: dateRange === '7' ? `Day ${i * chunk + 1}-${(i + 1) * chunk}` : `Week ${i + 1}`,
        total: Math.round(slice.reduce((s, d) => s + d.total, 0) * 10) / 10,
      });
    }
    return periods;
  }, [getDailyTotals, dateRange]);

  // AI Insights
  const insights = useMemo(() => [
    `Your average daily emissions for this period are ${formatCO2(avgDaily)}, ${avgDaily < 22 ? 'below' : 'above'} the global average of 22 kg.`,
    categoryBreakdown.length > 0 
      ? `Your highest emission category is ${categoryBreakdown[0].category} at ${formatCO2(categoryBreakdown[0].total)}.` 
      : 'Start logging activities to see insights.',
    `You've saved an estimated ${formatCO2(totalCO2Saved)} compared to the global average.`,
    `You've logged ${filteredLogs.length} activities across ${totalDays} days.`,
  ], [avgDaily, categoryBreakdown, totalCO2Saved, filteredLogs, totalDays]);

  const recommendations = [
    '🚌 Switch 2 car trips per week to public transit — save ~4 kg CO₂/week',
    '🥗 Add 2 plant-based meals per week — save ~8 kg CO₂/week',
    '💡 Switch remaining bulbs to LED — save ~4 kg CO₂/month',
    '🔌 Use smart power strips — save ~2 kg CO₂/month',
    '🛍️ Buy secondhand when possible — save ~5 kg CO₂/purchase',
  ];

  // Roadmap calculation based on user progress
  const roadmapMilestones = useMemo(() => {
    const foodLogs = logs.filter(l => l.category === 'food' && ['vegan', 'vegetarian'].includes(l.subCategory)).length;
    const transLogs = logs.filter(l => l.category === 'transportation' && ['bike', 'walk', 'metro'].includes(l.subCategory)).length;

    return [
      { id: 1, title: 'Carbon Tracker Initiate', desc: 'Log at least 5 activities in your logs', target: 5, current: logs.length, achieved: logs.length >= 5 },
      { id: 2, title: 'Transit Optimizer', desc: 'Log 5 eco-friendly transport choices (biking, walking, metro)', target: 5, current: transLogs, achieved: transLogs >= 5 },
      { id: 3, title: 'Plant-Based Explorer', desc: 'Log 5 vegetarian or vegan meals', target: 5, current: foodLogs, achieved: foodLogs >= 5 },
      { id: 4, title: 'Carbon Crusher', desc: 'Save 100 kg CO₂ compared to standard avg', target: 100, current: Math.round(totalCO2Saved), achieved: totalCO2Saved >= 100 },
    ];
  }, [logs, totalCO2Saved]);

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'SubCategory', 'Value', 'Unit', 'CO2 Amount (kg)'];
    const rows = filteredLogs.map(l => [
      l.date,
      l.category,
      l.subCategory,
      l.value,
      l.unit,
      l.co2Amount
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecosphere_carbon_report_${dateRange}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const reportHtml = `
      <html>
        <head>
          <title>EcoSphere AI — Carbon Footprint Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 50px; background: #fafafb; }
            .header-container { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #10b981; font-size: 26px; font-weight: 800; margin: 0; }
            .subtitle { color: #64748b; font-size: 13px; font-weight: 500; margin-top: 5px; }
            .section { margin-bottom: 30px; background: white; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .section-title { font-size: 14px; font-weight: 800; margin-bottom: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
            .stats-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .stat-label { font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
            .stat-val { font-size: 20px; font-weight: 800; color: #10b981; }
            .list-item { font-size: 13px; color: #334155; margin-bottom: 10px; line-height: 1.5; }
            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .table th, .table td { text-align: left; padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
            .table th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <h1>EcoSphere AI — Carbon Analysis Report</h1>
            <div class="subtitle">Generated on ${new Date().toLocaleDateString()} • Reporting Period: Last ${dateRange} days</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Emissions</div>
              <div class="stat-val">${totalEmissions.toFixed(2)} kg CO₂</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Daily Average</div>
              <div class="stat-val">${avgDaily.toFixed(2)} kg CO₂</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Estimated Saved</div>
              <div class="stat-val">${totalCO2Saved.toFixed(2)} kg CO₂</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Logged Actions</div>
              <div class="stat-val">${filteredLogs.length}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">AI Carbon Insights</div>
            ${insights.map(ins => `<div class="list-item">🌱 ${ins}</div>`).join('')}
          </div>
          
          <div class="section">
            <div class="section-title">Personalized Recommendations</div>
            ${recommendations.map(rec => `<div class="list-item">🎯 ${rec}</div>`).join('')}
          </div>
          
          <div class="section">
            <div class="section-title">Recent Carbon Log Entries</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Value</th>
                  <th>CO₂ (kg)</th>
                </tr>
              </thead>
              <tbody>
                ${filteredLogs.slice(0, 15).map(l => `
                  <tr>
                    <td>${l.date}</td>
                    <td>${l.category}</td>
                    <td>${l.subCategory}</td>
                    <td>${l.value} ${l.unit}</td>
                    <td>${l.co2Amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  return (
    <div className="page-container space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Reports</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Generated insights and carbon savings analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.03, y: -0.5 }} 
            whileTap={{ scale: 0.97 }}
            onClick={exportCSV} 
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shadow-sm" 
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.03, y: -0.5 }} 
            whileTap={{ scale: 0.97 }}
            onClick={exportPDF} 
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/15 text-white gradient-primary" 
          >
            <Download className="w-3.5 h-3.5" /> PDF Report
          </motion.button>
        </div>
      </motion.div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-2 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
        <Calendar className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-bold mr-2" style={{ color: 'var(--text-secondary)' }}>Reporting Period:</span>
        <div className="flex gap-1.5">
          {([
            { id: '7', label: 'Last 7 Days' },
            { id: '30', label: 'Last 30 Days' },
            { id: '90', label: 'Last 90 Days' },
            { id: 'all', label: 'All Time' },
          ] as const).map(p => (
            <button
              key={p.id}
              onClick={() => setDateRange(p.id)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={
                dateRange === p.id
                  ? { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Emissions', value: formatCO2(totalEmissions), icon: '📊', color: '#3b82f6' },
          { label: 'Daily Average', value: formatCO2(avgDaily), icon: '📈', color: '#f59e0b' },
          { label: 'CO₂ Saved', value: formatCO2(totalCO2Saved), icon: '🌱', color: '#10b981' },
          { label: 'Activities', value: filteredLogs.length.toString(), icon: '📝', color: '#8b5cf6' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <div className="stat-card">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Emissions Progress (Bar Chart)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="stat-card">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>🤖 AI Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                <Leaf className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{insight}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="stat-card lg:col-span-2">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>🎯 Personalized Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                {rec}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Visual Sustainability Roadmap Section */}
        <div className="stat-card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>🌱 Personalized Sustainability Roadmap</h3>
          </div>
          <div className="relative border-l-2 ml-4 pl-6 space-y-6" style={{ borderColor: 'var(--border-color)' }}>
            {roadmapMilestones.map((m) => (
              <div key={m.id} className="relative">
                {/* Visual marker */}
                <div className="absolute -left-[35px] top-1 p-0.5 rounded-full bg-slate-900 z-10">
                  {m.achieved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: m.achieved ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    <span>{m.title}</span>
                    {m.achieved && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                        COMPLETED
                      </span>
                    )}
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{m.desc}</p>
                  <div className="mt-2.5 w-full max-w-md bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${m.achieved ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                      style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] mt-1.5 block font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                    Progress: {m.current} / {m.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
