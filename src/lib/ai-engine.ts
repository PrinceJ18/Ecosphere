// ==========================================
// EcoSphere AI — AI Engine
// Rule-based AI coach with personalized responses
// ==========================================

import { CarbonLog, AIMessage, ActivityCategory } from '../types';
import { generateId, formatCO2 } from './utils';

// ---- AI Response Templates ----
const GREETINGS = [
  "Hi there! 🌱 I'm your EcoSphere AI Coach. How can I help you live greener today?",
  "Hello! 🌍 Ready to make today more sustainable? I'm here to help!",
  "Welcome back! 💚 Let's continue your journey to a smaller carbon footprint.",
];

const TIPS_BY_CATEGORY: Record<string, string[]> = {
  transportation: [
    "💡 Did you know? Switching to public transit for your daily commute can save up to 2.6 tons of CO₂ per year!",
    "🚲 Cycling just 5km instead of driving saves about 1.05 kg CO₂ — that's like planting a tree every 2 weeks!",
    "🚗 If you must drive, carpooling with just one other person cuts your per-person emissions by 50%.",
    "⚡ Electric vehicles produce 50-70% less CO₂ than conventional cars, even accounting for electricity generation.",
    "🚶 Walking 2km instead of driving saves 0.42 kg CO₂ AND burns ~140 calories. Win-win!",
  ],
  food: [
    "🥗 A plant-based diet can reduce your food carbon footprint by up to 73%!",
    "🐄 Beef has the highest carbon footprint of any food — 27 kg CO₂ per kg. Try swapping for chicken (6.9 kg) or plant protein (0.7 kg).",
    "🌿 Having one 'Meatless Monday' per week can save about 600 kg CO₂ per year.",
    "🍎 Buying local, seasonal produce reduces transport emissions by up to 80%.",
    "♻️ Reducing food waste by just 30% can save 250 kg CO₂ per person annually.",
  ],
  electricity: [
    "💡 Switching to LED bulbs saves 75% of lighting energy — about 210 kg CO₂ per year per household.",
    "🌡️ Lowering your thermostat by just 1°C can reduce heating emissions by 10%.",
    "☀️ Solar panels can reduce household emissions by 1.5-2 tons CO₂ per year.",
    "🔌 Unplugging devices when not in use can save up to 10% on your electricity bill and 150 kg CO₂ annually.",
    "❄️ Air-drying clothes instead of using a dryer saves about 0.5 kg CO₂ per load.",
  ],
  shopping: [
    "👗 Fast fashion accounts for 10% of global carbon emissions. Choose quality over quantity!",
    "📱 Extending the life of electronics by 1 year saves about 25 kg CO₂ per device.",
    "♻️ Choosing products with minimal packaging can reduce your shopping footprint by 20%.",
    "🛍️ Bringing reusable bags saves 5-10 kg of CO₂ per year and keeps plastic out of oceans.",
    "🌿 Buying secondhand reduces the carbon footprint of clothing by up to 82%.",
  ],
  general: [
    "🌍 The average person produces about 4-8 tons of CO₂ per year. Your goal should be under 2 tons for climate targets!",
    "🌱 Even small changes add up. Reducing just 2 kg CO₂ per day saves 730 kg per year!",
    "💪 You're already making a difference by tracking your footprint. Awareness is the first step!",
    "📊 People who track their carbon footprint reduce it by an average of 25% in the first year.",
    "🎯 Setting specific, measurable goals increases your chances of reducing emissions by 40%.",
  ],
};

const WEEKLY_PLAN_TEMPLATE = `## 🗓️ Your Personalized Weekly Sustainability Plan

### Monday — Meatless Monday
- Have plant-based meals all day
- Expected savings: ~4 kg CO₂

### Tuesday — Transit Tuesday
- Use public transportation or bike
- Expected savings: ~3 kg CO₂

### Wednesday — Waste-Free Wednesday
- Zero single-use plastic today
- Compost food waste
- Expected savings: ~1 kg CO₂

### Thursday — Thrift Thursday
- If you need something, buy secondhand
- Repair something instead of replacing
- Expected savings: ~2 kg CO₂

### Friday — Footprint Friday
- Review your weekly analytics
- Adjust goals based on progress
- Share a tip in the community

### Saturday — Solar Saturday
- Air-dry laundry
- Use natural light
- Unplug unused electronics
- Expected savings: ~1.5 kg CO₂

### Sunday — Sustain Sunday
- Plan next week's meals (reduce waste)
- Prep for transit commutes
- Set new weekly goals

**📊 Total estimated weekly savings: 11.5 kg CO₂**
**📈 Annual impact: 598 kg CO₂ saved!**`;

// ---- AI Engine Functions ----

export function getAIGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

export function generateAIResponse(userMessage: string, logs: CarbonLog[]): AIMessage {
  const msg = userMessage.toLowerCase();
  let response = '';

  // Analyze intent
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    response = getAIGreeting();
  } else if (msg.includes('tip') || msg.includes('suggestion') || msg.includes('advice')) {
    response = getRandomTip();
  } else if (msg.includes('plan') || msg.includes('weekly') || msg.includes('schedule')) {
    response = WEEKLY_PLAN_TEMPLATE;
  } else if (msg.includes('footprint') || msg.includes('emissions') || msg.includes('how much')) {
    response = analyzeFootprint(logs);
  } else if (msg.includes('reduce') || msg.includes('save') || msg.includes('lower')) {
    response = getReductionAdvice(logs);
  } else if (msg.includes('food') || msg.includes('eat') || msg.includes('diet') || msg.includes('meal')) {
    response = getRandomCategoryTip('food');
  } else if (msg.includes('transport') || msg.includes('car') || msg.includes('drive') || msg.includes('commute')) {
    response = getRandomCategoryTip('transportation');
  } else if (msg.includes('energy') || msg.includes('electric') || msg.includes('power')) {
    response = getRandomCategoryTip('electricity');
  } else if (msg.includes('shop') || msg.includes('buy') || msg.includes('purchase')) {
    response = getRandomCategoryTip('shopping');
  } else if (msg.includes('compare') || msg.includes('vs') || msg.includes('better')) {
    response = getComparisonAdvice();
  } else if (msg.includes('goal') || msg.includes('target')) {
    response = getGoalAdvice(logs);
  } else if (msg.includes('challenge') || msg.includes('motivat')) {
    response = getChallengeMotivation();
  } else {
    response = getSmartResponse(msg, logs);
  }

  return {
    id: generateId(),
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString(),
    suggestions: getSuggestions(msg),
  };
}

function getRandomTip(): string {
  const categories = Object.keys(TIPS_BY_CATEGORY);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const tips = TIPS_BY_CATEGORY[category];
  return tips[Math.floor(Math.random() * tips.length)];
}

function getRandomCategoryTip(category: string): string {
  const tips = TIPS_BY_CATEGORY[category] || TIPS_BY_CATEGORY.general;
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return `Here's a ${category} tip for you:\n\n${tip}\n\nWould you like more tips or want me to create a personalized plan?`;
}

function analyzeFootprint(logs: CarbonLog[]): string {
  if (logs.length === 0) {
    return "I don't have any activity data from you yet! 📝\n\nStart by logging some activities in the Carbon Calculator, and I'll be able to give you detailed analysis of your footprint, trends, and personalized recommendations.\n\nWould you like to log an activity now?";
  }

  const totalCO2 = logs.reduce((sum, l) => sum + l.co2Amount, 0);
  const byCategory = logs.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + l.co2Amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const avgDaily = totalCO2 / Math.max(1, new Set(logs.map(l => l.date)).size);

  return `## 📊 Your Carbon Footprint Analysis

**Total tracked emissions:** ${formatCO2(totalCO2)}
**Daily average:** ${formatCO2(avgDaily)}
**Activities logged:** ${logs.length}

### Top emission source: **${topCategory[0]}** (${formatCO2(topCategory[1])})

${avgDaily > 22 ? '⚠️ Your daily average is above the global average of 22 kg CO₂. Let\'s work on reducing that!' : '✅ Great job! Your daily average is below the global average of 22 kg CO₂.'}

### Category Breakdown:
${Object.entries(byCategory)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, val]) => `- **${cat}**: ${formatCO2(val)} (${Math.round((val / totalCO2) * 100)}%)`)
  .join('\n')}

Would you like specific advice on reducing your ${topCategory[0]} emissions?`;
}

function getReductionAdvice(logs: CarbonLog[]): string {
  if (logs.length === 0) {
    return "Great that you want to reduce your footprint! 🌱\n\nHere are universal tips to get started:\n\n1. 🚌 Use public transit when possible\n2. 🥗 Try plant-based meals 2-3 times per week\n3. 💡 Switch to LED bulbs\n4. 🔌 Unplug electronics when not in use\n5. 🛍️ Bring reusable bags when shopping\n\nStart logging activities and I'll give you personalized reduction plans!";
  }

  const byCategory = logs.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + l.co2Amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const tips = TIPS_BY_CATEGORY[topCategory[0]] || TIPS_BY_CATEGORY.general;

  return `## 🎯 Personalized Reduction Plan

Your biggest emission source is **${topCategory[0]}** at ${formatCO2(topCategory[1])}.

Here's how to cut it down:

${tips.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}

### Quick Wins:
- Start with the easiest change first
- Track your progress daily
- Celebrate small victories!

**Estimated annual savings if you follow these tips: 500-1,500 kg CO₂** 🌍`;
}

function getComparisonAdvice(): string {
  return `## ⚖️ Carbon Footprint Comparisons

| Activity | CO₂ Impact |
|----------|-----------|
| 🐄 1 kg Beef | 27.0 kg CO₂ |
| 🍗 1 kg Chicken | 6.9 kg CO₂ |
| 🥗 1 Vegan Meal | 0.7 kg CO₂ |
| 🚗 1 km by Car | 0.21 kg CO₂ |
| 🚌 1 km by Bus | 0.089 kg CO₂ |
| 🚲 1 km by Bike | 0 kg CO₂ |
| ✈️ 1 km Flight | 0.255 kg CO₂ |
| 💡 1 kWh Electricity | 0.42 kg CO₂ |

### Fun Facts:
- One beef burger = driving 15 km in a car
- One year of cycling to work (10km) saves 504 kg CO₂
- Going vegan saves more CO₂ than giving up your car!

Would you like to compare specific activities?`;
}

function getGoalAdvice(logs: CarbonLog[]): string {
  const totalCO2 = logs.reduce((sum, l) => sum + l.co2Amount, 0);
  const target = Math.max(1, Math.round(totalCO2 * 0.8));

  return `## 🎯 Recommended Goals

Based on your activity, here are some goals I'd suggest:

### Short-term (This Week)
1. **Log activities daily** — Awareness is the first step
2. **One meatless day** — Save ~4 kg CO₂
3. **Walk or bike for trips under 3km** — Save ~0.6 kg CO₂ per trip

### Medium-term (This Month)
1. **Reduce overall emissions by 20%** — Target: ${formatCO2(target)}/month
2. **Complete 3 daily challenges** per week
3. **Switch to renewable energy** if available

### Long-term (This Year)
1. **Bring annual footprint under 4 tons CO₂**
2. **Offset remaining emissions** through tree planting
3. **Inspire 3 friends** to start tracking

Set these goals in the Goals page and I'll help you track progress! 🚀`;
}

function getChallengeMotivation(): string {
  const motivations = [
    "You've got this! 💪 Every challenge completed is a step toward a greener planet. Remember, consistency beats perfection!",
    "Think of challenges as mini-adventures in sustainability! 🏔️ Each one teaches you something new and builds eco-habits that last a lifetime.",
    "Here's a secret: the hardest part is starting. Once you complete your first challenge, the momentum carries you forward! 🚀",
    "Your effort matters more than you think. If everyone reduced just 10%, we'd prevent billions of tons of CO₂! You're part of the solution. 🌍",
  ];
  return motivations[Math.floor(Math.random() * motivations.length)];
}

function getSmartResponse(msg: string, logs: CarbonLog[]): string {
  // General intelligent response
  const total = logs.reduce((sum, l) => sum + l.co2Amount, 0);
  const tip = getRandomTip();

  if (total > 0) {
    return `Great question! Based on your ${logs.length} logged activities totaling ${formatCO2(total)}, here's what I think:\n\n${tip}\n\n💡 **Quick suggestion:** Focus on your biggest emission category first — small changes there have the largest impact.\n\nWhat else would you like to know?`;
  }

  return `That's a great question! Here's something to consider:\n\n${tip}\n\n📝 **Pro tip:** Start logging your daily activities to get personalized insights and recommendations.\n\nFeel free to ask me about:\n- 📊 Your footprint analysis\n- 🎯 Goal setting\n- 💡 Sustainability tips\n- 🗓️ Weekly plans\n- ⚖️ Activity comparisons`;
}

function getSuggestions(msg: string): string[] {
  const suggestions = [
    "Show my footprint analysis",
    "Give me a weekly plan",
    "How can I reduce emissions?",
    "Compare food options",
    "Suggest goals for me",
  ];

  // Filter out suggestions that are too similar to the user's message
  return suggestions.filter(s => !msg.includes(s.toLowerCase().split(' ')[0])).slice(0, 3);
}

// ---- Daily Insight ----
export function getDailyInsight(logs: CarbonLog[]): string {
  if (logs.length === 0) {
    return "Start tracking your carbon footprint today! Log your first activity to get personalized AI insights. 🌱";
  }

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === today);
  const todayTotal = todayLogs.reduce((sum, l) => sum + l.co2Amount, 0);

  if (todayTotal === 0) {
    return "No activities logged today yet. A great start for a zero-emission day! 🌈 Can you keep it going?";
  }

  if (todayTotal < 5) {
    return `Excellent! Only ${formatCO2(todayTotal)} today — well below the daily average. Keep up the amazing work! 🌟`;
  }

  if (todayTotal < 15) {
    return `${formatCO2(todayTotal)} logged today. You're doing good, but there's room for improvement. Check your biggest category! 💡`;
  }

  return `${formatCO2(todayTotal)} logged today — that's above average. Let's look at ways to bring it down. Try a plant-based meal or walk instead of driving! 🌿`;
}

// ---- Carbon Twin Projection ----
export function generateCarbonTwin(dailyAvgKg: number): { labels: string[]; current: number[]; optimistic: number[]; pessimistic: number[] } {
  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const annualCurrent = dailyAvgKg * 365;

  return {
    labels: years.map(y => `Year ${y}`),
    current: years.map(y => Math.round(annualCurrent * y)),
    optimistic: years.map(y => Math.round(annualCurrent * y * Math.pow(0.9, y))), // 10% reduction per year
    pessimistic: years.map(y => Math.round(annualCurrent * y * Math.pow(1.03, y))), // 3% increase per year
  };
}
