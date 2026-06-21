import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown, TrendingUp, Target, Bot, Leaf, ChevronRight, Footprints, 
  ChevronLeft, CloudRain, Sun, Cloud, Thermometer, Trophy, Activity, Sparkles, Clock, Zap
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../providers/AuthProvider';
import { useData } from '../providers/DataProvider';
import { useGamification } from '../providers/GamificationProvider';
import { formatCO2, getGreeting, getMotivationalQuote } from '../lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  transportation: '#3b82f6',
  food: '#f59e0b',
  electricity: '#8b5cf6',
  shopping: '#ec4899',
  travel: '#06b6d4',
  lifestyle: '#10b981',
  waste: '#6b7280',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { logs, getTodayTotal, getWeekTotal, getMonthTotal, getDailyTotals, getCategoryBreakdown, totalCO2Saved } = useData();
  const { level, xpProgress, dailyMissions, achievements, completeMission } = useGamification();
  const navigate = useNavigate();

  const [achievementIdx, setAchievementIdx] = useState(0);

  const dailyTotals = useMemo(() => getDailyTotals(7), [getDailyTotals]);
  const monthlyTotals = useMemo(() => getDailyTotals(30), [getDailyTotals]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(), [getCategoryBreakdown]);

  const todayTotal = getTodayTotal();
  const weekTotal = getWeekTotal();
  const monthTotal = getMonthTotal();

  const prevWeekTotal = useMemo(() => {
    const twoWeeks = getDailyTotals(14);
    return twoWeeks.slice(0, 7).reduce((s, d) => s + d.total, 0);
  }, [getDailyTotals]);
  const weekChange = prevWeekTotal > 0 ? Math.round(((weekTotal - prevWeekTotal) / prevWeekTotal) * 100) : 0;

  // AI Daily insight
  const aiInsight = useMemo(() => {
    if (logs.length === 0) return "Start logging your daily carbon activities. I'll analyze your patterns and give you custom footprint reductions.";
    const highestCat = categoryBreakdown[0];
    if (highestCat) {
      return `Your highest emission category is currently ${highestCat.category.toUpperCase()}. Swapping driving for transit or moving to lower-impact meals can save over 15kg CO₂ per week!`;
    }
    return "Your emissions are looking stable. Try to complete your daily eco-missions to unlock new badges and boost your sustainability rank!";
  }, [logs, categoryBreakdown]);

  // Weather simulator
  const weatherSim = useMemo(() => {
    const month = new Date().getMonth();
    let temp = 22;
    let condition = 'Sunny';
    let icon = <Sun className="w-5 h-5 text-amber-500" />;
    let tip = 'Perfect sunny day! Walk or bike short trips instead of driving to save CO₂.';
    
    if (month >= 10 || month <= 2) {
      temp = 5 + Math.floor(Math.random() * 5);
      condition = 'Overcast';
      icon = <Cloud className="w-5 h-5 text-slate-400" />;
      tip = 'Cold day. Lower heating thermostat by 1°C to reduce electric footprint by 2kg.';
    } else if (month >= 5 && month <= 8) {
      temp = 29 + Math.floor(Math.random() * 5);
      condition = 'Hot Sunny';
      icon = <Sun className="w-5 h-5 text-amber-500" />;
      tip = 'High heat. Keep blinds closed during peak hours to save AC energy.';
    } else {
      temp = 15 + Math.floor(Math.random() * 5);
      condition = 'Light Rain';
      icon = <CloudRain className="w-5 h-5 text-blue-400" />;
      tip = 'Wet roads. Opt for electric train or metro to bypass traffic jams.';
    }
    return { temp, condition, icon, tip };
  }, []);

  // Filter in-progress achievements for carousel
  const activeAchievements = useMemo(() => {
    return achievements.filter(a => !a.completed);
  }, [achievements]);

  const handleNextAchievement = () => {
    setAchievementIdx(prev => (prev + 1) % Math.max(1, activeAchievements.length));
  };

  const handlePrevAchievement = () => {
    setAchievementIdx(prev => (prev - 1 + activeAchievements.length) % Math.max(1, activeAchievements.length));
  };

  // Daily target config
  const dailyTarget = 15; // 15kg limit allowance
  const todayPercentage = Math.min(100, Math.round((todayTotal / dailyTarget) * 100));
  const isBudgetExceeded = todayTotal > dailyTarget;

  // Circular progress ring parameters
  const ringRadius = 24;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeOffset = ringCircumference - (todayPercentage / 100) * ringCircumference;

  // Prompt 2: AI Intelligence Section Calculations
  const highestEmissionCat = useMemo(() => {
    if (!categoryBreakdown || categoryBreakdown.length === 0) return null;
    return [...categoryBreakdown].sort((a, b) => b.total - a.total)[0];
  }, [categoryBreakdown]);

  const topRecommendations = useMemo(() => {
    const cat = highestEmissionCat?.category || 'general';
    const recs: Record<string, string[]> = {
      transportation: [
        "🚲 Walk or cycle for journeys under 3km to eliminate commuter emissions.",
        "🚇 Swapping solo car trips for public transit (train/metro) reduces carbon output by 80%.",
        "🚗 Maintain steady highway speeds and correct tire pressure to improve fuel mileage by 10%."
      ],
      food: [
        "🥗 Swap one meat dish for a plant-based meal today (saves up to 4.2kg CO₂).",
        "🍎 Choose locally sourced, seasonal fruits and vegetables to minimize transport miles.",
        "♻️ Plan weekly grocery lists in advance to slash organic food waste by 30%."
      ],
      electricity: [
        "🔌 Switch off and unplug idle chargers and appliances to prevent phantom power load.",
        "🌡️ Lower the heating thermostat by 1°C to reduce electric footprint by 2kg daily.",
        "👕 Wash clothes at 30°C and opt for air-drying instead of energy-intensive dryers."
      ],
      shopping: [
        "👗 Opt for durable, high-quality garments or thrift secondhand items over fast fashion.",
        "🛍️ Carry reusable bags for all retail purchases to eliminate plastic/paper waste.",
        "📦 Consolidate online orders to reduce freight packaging and delivery trip footprint."
      ],
      travel: [
        "🚇 Prefer high-speed trains or buses instead of short-haul flights when possible.",
        "🏨 Choose eco-certified hotels and practice resource saving (reusing towels, lights off).",
        "🧳 Pack light to reduce aircraft and transit weight, directly improving fuel efficiency."
      ],
      lifestyle: [
        "💡 Refuse single-use plastics and switch to stainless steel or bamboo reusables.",
        "🌱 Compost kitchen scraps to reduce methane release in municipal landfills.",
        "🌿 Participate in community cleanups and plant native flora to sequester carbon."
      ],
      waste: [
        "♻️ Thoroughly clean and sort containers to ensure materials actually get recycled.",
        "📦 Avoid purchasing goods with double or non-recyclable plastic packaging.",
        "💧 Choose tap water with an filter bottle instead of buying single-use bottled water."
      ],
      general: [
        "🥗 Swap one meat dish for a plant-based alternative today to save ~3.5kg CO₂.",
        "🔌 Unplug home electronics before going to bed to prevent stand-by power draw.",
        "🚶 Walk or bike for any trip under 2 kilometers to burn calories and eliminate fuel exhaust."
      ]
    };
    return recs[cat] || recs.general;
  }, [highestEmissionCat]);

  const estimatedSavings = useMemo(() => {
    const cat = highestEmissionCat?.category || 'general';
    const savings: Record<string, number> = {
      transportation: 6.8,
      food: 5.4,
      electricity: 4.8,
      shopping: 3.2,
      travel: 12.5,
      lifestyle: 2.5,
      waste: 2.0,
      general: 3.5
    };
    return savings[cat] || 3.5;
  }, [highestEmissionCat]);

  const encouragementMsg = useMemo(() => {
    if (todayTotal === 0) {
      return "You haven't logged any carbon emissions today. Keep it clean and aim for a zero-emissions day! 🌿";
    }
    if (todayTotal <= 15) {
      return "Your footprint is well within green boundaries today. You are doing fantastic, keep this pace up! 🌟";
    }
    return "Your emissions are slightly elevated today, but every choice is a new opportunity to restore balance. 💚";
  }, [todayTotal]);

  const healthScore = useMemo(() => {
    const baseline = 100;
    const budgetPenalty = Math.max(0, todayTotal - dailyTarget) * 4;
    const streakBonus = Math.min(10, (user?.streak || 0) * 0.5);
    const highestTotal = highestEmissionCat?.total || 0;
    const emissionPenalty = Math.min(15, highestTotal * 0.5);
    
    return Math.max(30, Math.min(100, Math.round(baseline - budgetPenalty + streakBonus - emissionPenalty)));
  }, [todayTotal, dailyTarget, user, highestEmissionCat]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 85) return { label: 'Excellent', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: 'text-emerald-500', desc: 'Your carbon lifestyle is highly sustainable. Keep setting the standard!' };
    if (healthScore >= 70) return { label: 'Good', color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', text: 'text-amber-500', desc: 'Solid sustainability habits. Swap a few more trips or meals to reach Excellent!' };
    return { label: 'Needs Action', color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', text: 'text-rose-500', desc: 'Emissions are currently exceeding limits. Try implementing today\'s suggestions.' };
  }, [healthScore]);

  const predictedWeeklyCO2 = useMemo(() => {
    if (logs.length === 0) return 65;
    const activeDays = new Set(logs.map(l => l.date)).size || 1;
    const totalCO2 = logs.reduce((sum, l) => sum + l.co2Amount, 0);
    const dailyAvg = totalCO2 / activeDays;
    return Math.round(dailyAvg * 7 * 0.94 * 10) / 10;
  }, [logs]);

  const forecastTrend = useMemo(() => {
    if (weekChange < -2) return { label: 'Decreasing', icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (weekChange > 2) return { label: 'Increasing', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' };
    return { label: 'Stable', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  }, [weekChange]);

  const confidenceScore = useMemo(() => {
    const uniqueDays = new Set(logs.map(l => l.date)).size;
    return Math.min(98, Math.max(55, 60 + uniqueDays * 3));
  }, [logs]);

  const nextBestAction = useMemo(() => {
    const cat = highestEmissionCat?.category || 'general';
    const actions: Record<string, { title: string, co2: string, difficulty: 'Easy' | 'Medium' | 'Hard', time: string, color: string }> = {
      transportation: { title: "Ditch the car for short trips today", co2: "2.1 kg", difficulty: "Easy", time: "15 min", color: "text-blue-500" },
      food: { title: "Swap beef for chicken or plant meals", co2: "4.5 kg", difficulty: "Medium", time: "30 min", color: "text-amber-500" },
      electricity: { title: "Unplug standby home electronics", co2: "1.2 kg", difficulty: "Easy", time: "5 min", color: "text-purple-500" },
      shopping: { title: "Repair or reuse items instead of buying", co2: "8.0 kg", difficulty: "Medium", time: "1 hour", color: "text-pink-500" },
      travel: { title: "Prefer electric train over short flight", co2: "24.0 kg", difficulty: "Hard", time: "3 hours", color: "text-cyan-500" },
      lifestyle: { title: "Start composting kitchen leftovers", co2: "1.5 kg", difficulty: "Easy", time: "10 min", color: "text-emerald-500" },
      waste: { title: "Avoid items with double plastic wrap", co2: "0.8 kg", difficulty: "Easy", time: "5 min", color: "text-gray-500" },
      general: { title: "Swap beef for a plant-based option", co2: "3.5 kg", difficulty: "Easy", time: "20 min", color: "text-emerald-500" }
    };
    return actions[cat] || actions.general;
  }, [highestEmissionCat]);

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {getGreeting()}, {user?.name?.split(' ')[0]} {level?.icon}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {getMotivationalQuote()}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/calculator')}
          className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 self-start cursor-pointer shadow-md shadow-emerald-500/15"
        >
          <span>➕</span> Log Activity
        </motion.button>
      </motion.div>

      {/* AI Daily Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="stat-card stat-card--spacious glow-emerald bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-500/20 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-between relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <Bot className="w-5.5 h-5.5 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">AI Climate Coach</h4>
                <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>Daily Intelligence Summary</h3>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Today's carbon footprint is currently <span className="text-emerald-500 font-extrabold">{formatCO2(todayTotal)}</span>. 
                {highestEmissionCat ? (
                  <span> Your highest emission source is <strong className="capitalize text-emerald-500 font-bold">{highestEmissionCat.category}</strong> (contributing {Math.round((highestEmissionCat.total / Math.max(1, todayTotal)) * 100)}% of today's footprint).</span>
                ) : (
                  <span> Start logging activities to view source distribution.</span>
                )}
              </p>
              
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-xl text-xs font-semibold text-emerald-500 flex items-center gap-2 w-fit">
                <span>🍀 Estimated CO₂ reduction potential:</span>
                <span className="font-extrabold bg-emerald-500 text-white dark:text-slate-900 px-2 py-0.5 rounded-full">~{estimatedSavings} kg CO₂ / week</span>
              </div>
            </div>

            <div className="pt-2 text-xs italic font-semibold text-emerald-600 dark:text-emerald-400">
              {encouragementMsg}
            </div>
          </div>

          <div className="flex-1 w-full lg:max-w-md bg-white/40 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Sparkles className="w-4 h-4 text-amber-500" /> Top Personalized Suggestions
            </h4>
            <div className="space-y-2">
              {topRecommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="text-emerald-500 shrink-0 font-bold">0{idx + 1}.</span>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/ai-coach')}
              className="w-full mt-4 text-xs font-bold py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-emerald-500/15"
            >
              Talk to Coach <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats row with Circular Progress ring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today budget ring card */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="stat-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Today's Allowance</span>
            <motion.p 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="text-xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              {formatCO2(todayTotal)}
            </motion.p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Limit: {dailyTarget} kg</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r={ringRadius} fill="transparent" stroke="var(--border-color)" strokeWidth="3" />
              <circle 
                cx="28" 
                cy="28" 
                r={ringRadius} 
                fill="transparent" 
                stroke={isBudgetExceeded ? '#f43f5e' : '#10b981'} 
                strokeWidth="3.5" 
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 3px ${isBudgetExceeded ? 'rgba(244,63,94,0.4)' : 'rgba(16,185,129,0.4)'})` }}
              />
            </svg>
            <span className="absolute text-[10px] font-bold animate-pulse" style={{ color: isBudgetExceeded ? '#f43f5e' : 'var(--text-primary)' }}>
              {todayPercentage}%
            </span>
          </div>
        </motion.div>

        {/* Regular stats */}
        {[
          { label: 'This Week', value: formatCO2(weekTotal), icon: TrendingDown, color: '#3b82f6', trend: weekChange },
          { label: 'This Month', value: formatCO2(monthTotal), icon: Target, color: '#8b5cf6', trend: null },
          { label: 'Total CO₂ Saved', value: formatCO2(totalCO2Saved), icon: Leaf, color: '#10b981', trend: null },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i + 1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <motion.p 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + (i + 1) * 0.1, type: 'spring', stiffness: 100 }}
              className="text-xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              {stat.value}
            </motion.p>
            {stat.trend !== null && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${stat.trend <= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                {stat.trend <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                <span>{Math.abs(stat.trend)}% vs last week</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* AI Intelligence & Predictions Hub */}
      <div className="space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Activity className="w-5 h-5 text-emerald-500" /> AI Insights & Predictions Hub
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carbon Health Score Card */}
          <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="stat-card stat-card--spacious flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carbon Health Score</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Overall lifestyle rating</p>
            </div>
            
            <div className="my-6 flex items-center justify-around gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="var(--border-color)" strokeWidth="4" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    fill="transparent" 
                    stroke={healthStatus.color} 
                    strokeWidth="5" 
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 - (healthScore / 100) * (2 * Math.PI * 32)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 4px ${healthStatus.color}40)` }}
                  />
                </svg>
                <span className="absolute text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  {healthScore}
                </span>
              </div>
              <div className="space-y-1">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block ${healthStatus.text}`} style={{ background: healthStatus.bg, border: `1px solid ${healthStatus.border}` }}>
                  {healthStatus.label}
                </span>
                <p className="text-[10px] leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {healthStatus.desc}
                </p>
              </div>
            </div>
            
            <div className="text-[10px] text-center pt-2 border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
              Target limit: {dailyTarget} kg CO₂ / day
            </div>
          </motion.div>

          {/* Carbon Forecast Card */}
          <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="stat-card stat-card--spacious flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carbon Forecast</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Next 7-day projection</p>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${forecastTrend.color} ${forecastTrend.bg}`}>
                <forecastTrend.icon className="w-3 h-3" /> {forecastTrend.label}
              </span>
            </div>

            <div className="my-4 space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{predictedWeeklyCO2}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>kg CO₂e</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--text-secondary)' }}>Offset weekly:</span>
                <span className="font-bold text-emerald-500">{confidenceScore}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${confidenceScore}%` }} />
              </div>
            </div>

            <div className="text-[10px] pt-2 border-t leading-relaxed" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
              💡 suggestion: Log commute patterns to improve confidence model.
            </div>
          </motion.div>

          {/* Next Best Action Card */}
          <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible" className="stat-card stat-card--spacious flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Best Action</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Highest impact today</p>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                ⭐ HIGH PRIORITY
              </span>
            </div>

            <div className="my-4 space-y-2 p-4 rounded-xl bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/10">
              <h4 className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" /> {nextBestAction.title}
              </h4>
              
              <div className="flex items-center justify-between text-[10px] font-semibold pt-1" style={{ color: 'var(--text-secondary)' }}>
                <span>Savings: <strong className="text-emerald-500 font-bold">-{nextBestAction.co2}</strong></span>
                <span>Diff: <strong className="text-amber-500 font-bold">{nextBestAction.difficulty}</strong></span>
                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-slate-400" /> {nextBestAction.time}</span>
              </div>
            </div>

            <div className="text-[10px] text-center pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button 
                onClick={() => navigate('/challenges')} 
                className="text-emerald-500 font-bold hover:underline cursor-pointer"
              >
                View Available Challenges &gt;
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Emissions History</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Log trend over past 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> kg CO₂e
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTotals}>
                <defs>
                  <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} kg CO₂`, 'Emissions']}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#gradientArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category breakdown pie */}
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" className="stat-card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Sources Breakdown</h3>
          <div className="h-40 flex items-center justify-center">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="total"
                    nameKey="category"
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)} kg`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No data logged yet</p>
            )}
          </div>
          <div className="space-y-1.5 mt-2">
            {categoryBreakdown.slice(0, 4).map(cat => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{cat.category}</span>
                </div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatCO2(cat.total)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Simulator Widget */}
        <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible" className="stat-card space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              <Thermometer className="w-4 h-4 text-emerald-500" />
              <span>Weather-Impact Forecast</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {weatherSim.icon}
              <span className="font-semibold">{weatherSim.temp}°C</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Today's Condition: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{weatherSim.condition}</span>
            </p>
            <div className="p-4 rounded-xl text-xs space-y-2 bg-emerald-500/5 border border-emerald-500/10" style={{ color: 'var(--text-secondary)' }}>
              <p className="font-semibold text-emerald-500 flex items-center gap-1.5">💡 Daily Climate Action Recommendation</p>
              <p className="leading-relaxed mt-1 text-[11px]">{weatherSim.tip}</p>
            </div>
          </div>
        </motion.div>

        {/* Streak & Level */}
        <motion.div custom={7} variants={cardVariants} initial="hidden" animate="visible" className="stat-card">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Eco Leaderboard Status</h3>

          <div className="flex items-center gap-4 mb-4 p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              🔥
            </motion.div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{user?.streak || 0}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Day Streak</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.longestStreak || 0}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Best</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-2xl">{level?.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Level {level?.level} — {level?.title}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>{xpProgress?.current}/{xpProgress?.required} XP</span>
              </div>
              <div className="progress-bar bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="progress-bar-fill h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress?.percentage || 0}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-center">
            <div className="flex-1 p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user?.xp || 0}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Total XP</p>
            </div>
            <div className="flex-1 p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-lg font-bold text-amber-500">{user?.coins || 0}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>EcoCoins</p>
            </div>
          </div>
        </motion.div>

        {/* Mini Achievements Carousel */}
        <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible" className="stat-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Trophy className="w-4 h-4 text-amber-500" />
              Active Achievements
            </h3>
            {activeAchievements.length > 1 && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevAchievement}
                  className="p-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                </button>
                <button 
                  onClick={handleNextAchievement}
                  className="p-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          <div className="py-4 flex-1 flex flex-col justify-center">
            {activeAchievements.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl p-1 bg-slate-800 rounded-xl">{activeAchievements[achievementIdx].icon}</span>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{activeAchievements[achievementIdx].title}</h4>
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{activeAchievements[achievementIdx].description}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    <span>Progress: {activeAchievements[achievementIdx].progress} / {activeAchievements[achievementIdx].target}</span>
                    <span>{Math.round((activeAchievements[achievementIdx].progress / activeAchievements[achievementIdx].target) * 100)}%</span>
                  </div>
                  <div className="progress-bar h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="progress-bar-fill h-full bg-amber-500" 
                      style={{ width: `${(activeAchievements[achievementIdx].progress / activeAchievements[achievementIdx].target) * 100}%` }}
                    />
                  </div>
                </div>
                
                <span className="text-[10px] font-semibold text-emerald-500 block">Reward: +{activeAchievements[achievementIdx].xpReward} XP</span>
              </div>
            ) : (
              <div className="text-center py-4 space-y-1 text-slate-400">
                <p className="text-xs font-bold text-emerald-500">🏆 All Achievements Completed!</p>
                <p className="text-[10px]">You are a certified carbon master.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Daily missions & Weekly graph row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Missions */}
        <motion.div custom={9} variants={cardVariants} initial="hidden" animate="visible" className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Eco-Missions</h3>
            <span className="text-xs px-2 py-0.5 rounded-full gradient-primary text-white">
              {dailyMissions.filter(m => m.completed).length}/{dailyMissions.length}
            </span>
          </div>
          <div className="space-y-2">
            {dailyMissions.map(mission => (
              <motion.div
                key={mission.id}
                whileHover={{ x: 4 }}
                onClick={() => {
                  if (!mission.completed) {
                    completeMission(mission.id);
                  } else {
                    navigate(`/${mission.action}`);
                  }
                }}
                className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 bg-slate-50 dark:bg-slate-800/40"
                style={{ 
                  border: mission.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                }}
              >
                <span className="text-lg">{mission.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{mission.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{mission.description}</p>
                </div>
                {mission.completed ? (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Done</span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-500">+{mission.xpReward} XP</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Sparkline */}
        <motion.div custom={10} variants={cardVariants} initial="hidden" animate="visible" className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Carbon Allowance Graph</h3>
            <button onClick={() => navigate('/timeline')} className="text-xs text-emerald-500 flex items-center gap-1 hover:gap-2 transition-all font-bold">
              View Timeline Analysis <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-4 pt-2">
            {dailyTotals.map((day, i) => {
              const max = Math.max(...dailyTotals.map(d => d.total), 1);
              const height = Math.max(8, (day.total / max) * 100);
              const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  <div className="w-full h-20 flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      className="w-full max-w-8 rounded-t-lg"
                      style={{
                        background: day.total > dailyTarget
                          ? '#f43f5e'
                          : day.total > 0
                            ? `linear-gradient(to top, #10b981, #14b8a6)`
                            : 'var(--border-color)',
                      }}
                    />
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{dayLabel}</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{day.total.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
