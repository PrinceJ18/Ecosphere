// ==========================================
// EcoSphere AI — Seed Data & Demo Mode
// Realistic data for 3 user personas
// ==========================================

import { User, CarbonLog, CommunityPost, LeaderboardEntry, MapLocation, EcoProduct, OffsetProject, Notification } from '../types';
import { generateId } from './utils';
import { ALL_BADGES } from './gamification';

// ---- Date Helpers ----
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- Demo Users ----
export const DEMO_USERS: Record<string, User> = {
  eco_warrior: {
    id: 'user_eco_warrior',
    email: 'maya@ecosphere.ai',
    name: 'Maya Green',
    avatar: '🦸‍♀️',
    joinedAt: '2025-01-15T00:00:00Z',
    level: 8,
    xp: 3200,
    totalXp: 3200,
    coins: 450,
    streak: 42,
    longestStreak: 67,
    lastActiveDate: daysAgo(0),
    role: 'user',
    preferences: { theme: 'dark', units: 'metric', notifications: true, weeklyReport: true, monthlyReport: true, language: 'en' },
  },
  average_user: {
    id: 'user_average',
    email: 'alex@ecosphere.ai',
    name: 'Alex Rivera',
    avatar: '🧑‍💻',
    joinedAt: '2025-06-01T00:00:00Z',
    level: 4,
    xp: 750,
    totalXp: 750,
    coins: 120,
    streak: 7,
    longestStreak: 14,
    lastActiveDate: daysAgo(0),
    role: 'user',
    preferences: { theme: 'dark', units: 'metric', notifications: true, weeklyReport: true, monthlyReport: false, language: 'en' },
  },
  beginner: {
    id: 'user_beginner',
    email: 'sam@ecosphere.ai',
    name: 'Sam Chen',
    avatar: '🌱',
    joinedAt: '2026-05-20T00:00:00Z',
    level: 2,
    xp: 150,
    totalXp: 150,
    coins: 30,
    streak: 3,
    longestStreak: 3,
    lastActiveDate: daysAgo(0),
    role: 'user',
    preferences: { theme: 'system', units: 'metric', notifications: true, weeklyReport: false, monthlyReport: false, language: 'en' },
  },
};

// ---- Generate Carbon Logs ----
function generateLogs(userId: string, days: number, intensity: 'low' | 'medium' | 'high'): CarbonLog[] {
  const logs: CarbonLog[] = [];
  const multiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1;

  for (let i = 0; i < days; i++) {
    const date = daysAgo(i);

    // Transportation (1-2 per day)
    const transTypes: Array<{ sub: string; value: number; co2: number }> = [
      { sub: 'car', value: 15 + Math.random() * 30, co2: 0 },
      { sub: 'bus', value: 10 + Math.random() * 20, co2: 0 },
      { sub: 'bike', value: 5 + Math.random() * 10, co2: 0 },
      { sub: 'walk', value: 1 + Math.random() * 5, co2: 0 },
      { sub: 'metro', value: 8 + Math.random() * 15, co2: 0 },
      { sub: 'ev', value: 10 + Math.random() * 25, co2: 0 },
    ];

    const transport = randomItem(intensity === 'low'
      ? transTypes.filter(t => ['bike', 'walk', 'metro', 'bus'].includes(t.sub))
      : transTypes
    );
    const tVal = Math.round(transport.value * multiplier * 10) / 10;
    const factors: Record<string, number> = { car: 0.21, bus: 0.089, bike: 0, walk: 0, metro: 0.041, ev: 0.053, train: 0.037 };
    const tCO2 = Math.round(tVal * (factors[transport.sub] || 0.1) * 100) / 100;

    logs.push({
      id: generateId(),
      userId,
      category: 'transportation',
      subCategory: transport.sub,
      value: tVal,
      unit: 'km',
      co2Amount: tCO2,
      impactScore: Math.min(100, Math.round((tCO2 / 22) * 100)),
      date,
      createdAt: date + 'T08:00:00Z',
    });

    // Food (2-3 per day)
    const meals = intensity === 'low'
      ? ['vegan', 'vegetarian', 'chicken']
      : intensity === 'high'
        ? ['beef', 'chicken', 'mixed', 'pork']
        : ['vegetarian', 'chicken', 'mixed', 'vegan'];

    for (let m = 0; m < 2 + Math.floor(Math.random() * 2); m++) {
      const mealType = randomItem(meals);
      const foodFactors: Record<string, number> = { beef: 27, pork: 12.1, chicken: 6.9, seafood: 11, dairy: 3.2, vegetarian: 2, vegan: 0.7, mixed: 5.5 };
      const mealAmount = 0.2 + Math.random() * 0.5;
      const mealCO2 = Math.round(mealAmount * (foodFactors[mealType] || 3) * 100) / 100;

      logs.push({
        id: generateId(),
        userId,
        category: 'food',
        subCategory: mealType,
        value: Math.round(mealAmount * 100) / 100,
        unit: 'meal',
        co2Amount: mealCO2,
        impactScore: Math.min(100, Math.round((mealCO2 / 22) * 100)),
        date,
        createdAt: date + 'T12:00:00Z',
      });
    }

    // Electricity (1 per day)
    const elecKwh = (5 + Math.random() * 15) * multiplier;
    const elecCO2 = Math.round(elecKwh * 0.42 * 100) / 100;
    logs.push({
      id: generateId(),
      userId,
      category: 'electricity',
      subCategory: 'electricity',
      value: Math.round(elecKwh * 10) / 10,
      unit: 'kWh',
      co2Amount: elecCO2,
      impactScore: Math.min(100, Math.round((elecCO2 / 22) * 100)),
      date,
      createdAt: date + 'T20:00:00Z',
    });

    // Shopping (occasional)
    if (Math.random() < 0.2) {
      const shopTypes = ['electronics', 'fashion', 'groceries', 'other'];
      const shopType = randomItem(shopTypes);
      const shopFactors: Record<string, number> = { electronics: 50, fashion: 25, groceries: 2.5, other: 10, plastic: 6, paper: 1.1 };
      const shopQty = Math.random() < 0.5 ? 1 : 2;
      const shopCO2 = Math.round(shopQty * (shopFactors[shopType] || 10) * 100) / 100;

      logs.push({
        id: generateId(),
        userId,
        category: 'shopping',
        subCategory: shopType,
        value: shopQty,
        unit: 'item',
        co2Amount: shopCO2,
        impactScore: Math.min(100, Math.round((shopCO2 / 22) * 100)),
        date,
        createdAt: date + 'T15:00:00Z',
      });
    }
  }

  return logs;
}

export function getDemoLogs(persona: string): CarbonLog[] {
  switch (persona) {
    case 'eco_warrior': return generateLogs('user_eco_warrior', 180, 'low');
    case 'average_user': return generateLogs('user_average', 90, 'medium');
    case 'beginner': return generateLogs('user_beginner', 30, 'high');
    default: return [];
  }
}

// ---- Community Posts ----
export const DEMO_POSTS: CommunityPost[] = [
  {
    id: 'post_1', userId: 'user_eco_warrior', userName: 'Maya Green', userAvatar: '🦸‍♀️', userLevel: 8,
    content: "Just completed my 42-day streak! 🔥 The key is making it a daily habit. I check in every morning with my coffee. Who else is on a streak? Let's keep each other motivated! 💪🌱",
    likes: 47, liked: false, comments: [
      { id: 'c1', userId: 'user_average', userName: 'Alex Rivera', userAvatar: '🧑‍💻', content: 'Amazing streak! I\'m on day 7 🎉', createdAt: daysAgo(0) + 'T10:30:00Z', likes: 5 },
      { id: 'c2', userId: 'user_3', userName: 'Jordan Park', userAvatar: '🌿', content: 'Day 15 here! This community keeps me going 💚', createdAt: daysAgo(0) + 'T11:00:00Z', likes: 3 },
    ],
    tags: ['streak', 'motivation', 'habits'], createdAt: daysAgo(0) + 'T09:00:00Z', type: 'achievement',
  },
  {
    id: 'post_2', userId: 'user_average', userName: 'Alex Rivera', userAvatar: '🧑‍💻', userLevel: 4,
    content: "🚲 Switched to biking for my 5km commute this week. Saving 1.05 kg CO₂ per trip AND getting exercise. Best decision I've made this month! The morning air feels amazing. #BikeToWork",
    likes: 32, liked: false, comments: [
      { id: 'c3', userId: 'user_eco_warrior', userName: 'Maya Green', userAvatar: '🦸‍♀️', content: 'Welcome to the bike gang! 🚲💨', createdAt: daysAgo(1) + 'T14:00:00Z', likes: 8 },
    ],
    tags: ['transportation', 'biking', 'health'], createdAt: daysAgo(1) + 'T13:00:00Z', type: 'tip',
  },
  {
    id: 'post_3', userId: 'user_5', userName: 'Priya Sharma', userAvatar: '🌸', userLevel: 6,
    content: "Made an incredible vegan mushroom risotto tonight 🍄 Creamy, delicious, and only 0.7 kg CO₂ per serving vs 27 kg for a beef dish. Saving the planet never tasted so good! Recipe in comments 👇",
    likes: 56, liked: false, comments: [
      { id: 'c4', userId: 'user_6', userName: 'Chris Lee', userAvatar: '🍳', content: 'Recipe please!! This looks amazing 🤤', createdAt: daysAgo(2) + 'T20:00:00Z', likes: 4 },
      { id: 'c5', userId: 'user_5', userName: 'Priya Sharma', userAvatar: '🌸', content: 'Arborio rice, mushrooms, veggie stock, nutritional yeast, white wine, garlic. Cook 25 mins. Magic! ✨', createdAt: daysAgo(2) + 'T20:15:00Z', likes: 12 },
    ],
    tags: ['food', 'vegan', 'recipe', 'cooking'], createdAt: daysAgo(2) + 'T19:30:00Z', type: 'tip',
  },
  {
    id: 'post_4', userId: 'user_7', userName: 'Taylor Kim', userAvatar: '⚡', userLevel: 7,
    content: "Our household installed solar panels last month ☀️ Already seeing 40% reduction in electricity emissions. The EcoSphere home energy simulator helped us make the decision! ROI in ~8 years. Totally worth it. 🏡",
    likes: 89, liked: false, comments: [
      { id: 'c6', userId: 'user_eco_warrior', userName: 'Maya Green', userAvatar: '🦸‍♀️', content: 'This is incredible! Goals 🎯', createdAt: daysAgo(3) + 'T12:00:00Z', likes: 6 },
    ],
    tags: ['energy', 'solar', 'home'], createdAt: daysAgo(3) + 'T11:00:00Z', type: 'achievement',
  },
  {
    id: 'post_5', userId: 'user_beginner', userName: 'Sam Chen', userAvatar: '🌱', userLevel: 2,
    content: "Day 3 on EcoSphere! 🌱 Just realized my daily beef lunch was 27 kg CO₂/kg. Switching to chicken and veggie options. Small steps but I can already see the difference in my dashboard! Any beginner tips welcome 🙏",
    likes: 24, liked: false, comments: [
      { id: 'c7', userId: 'user_eco_warrior', userName: 'Maya Green', userAvatar: '🦸‍♀️', content: 'Welcome! 🎉 Awareness is the biggest step. You\'re already ahead of most people! Focus on one habit at a time.', createdAt: daysAgo(0) + 'T16:00:00Z', likes: 9 },
      { id: 'c8', userId: 'user_average', userName: 'Alex Rivera', userAvatar: '🧑‍💻', content: 'I started exactly the same way! Now I do Meatless Mondays automatically. You got this! 💪', createdAt: daysAgo(0) + 'T16:30:00Z', likes: 7 },
    ],
    tags: ['beginner', 'food', 'journey'], createdAt: daysAgo(0) + 'T15:30:00Z', type: 'general',
  },
];

// ---- Leaderboard ----
export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'user_10', userName: 'Elena Volkov', userAvatar: '🏆', level: 12, co2Saved: 4520, xp: 12500, streak: 156, badges: 18 },
  { rank: 2, userId: 'user_11', userName: 'Marcus Johnson', userAvatar: '🌟', level: 11, co2Saved: 3890, xp: 10200, streak: 98, badges: 15 },
  { rank: 3, userId: 'user_12', userName: 'Aisha Patel', userAvatar: '💎', level: 10, co2Saved: 3210, xp: 8900, streak: 87, badges: 14 },
  { rank: 4, userId: 'user_eco_warrior', userName: 'Maya Green', userAvatar: '🦸‍♀️', level: 8, co2Saved: 2150, xp: 3200, streak: 42, badges: 10 },
  { rank: 5, userId: 'user_13', userName: 'Lucas Müller', userAvatar: '🌲', level: 7, co2Saved: 1890, xp: 2800, streak: 35, badges: 9 },
  { rank: 6, userId: 'user_14', userName: 'Yuki Tanaka', userAvatar: '🌸', level: 7, co2Saved: 1670, xp: 2500, streak: 28, badges: 8 },
  { rank: 7, userId: 'user_15', userName: 'Sofia Costa', userAvatar: '🌊', level: 6, co2Saved: 1340, xp: 2100, streak: 21, badges: 7 },
  { rank: 8, userId: 'user_average', userName: 'Alex Rivera', userAvatar: '🧑‍💻', level: 4, co2Saved: 560, xp: 750, streak: 7, badges: 4 },
  { rank: 9, userId: 'user_16', userName: 'Omar Hassan', userAvatar: '🌍', level: 3, co2Saved: 320, xp: 450, streak: 5, badges: 3 },
  { rank: 10, userId: 'user_beginner', userName: 'Sam Chen', userAvatar: '🌱', level: 2, co2Saved: 45, xp: 150, streak: 3, badges: 1 },
];

// ---- Map Locations ----
export const DEMO_LOCATIONS: MapLocation[] = [
  { id: 'loc_1', name: 'City Recycling Center', type: 'recycling', lat: 40.7128, lng: -74.006, address: '123 Green St, New York', rating: 4.5, description: 'Full-service recycling center accepting paper, plastic, glass, and electronics.', openHours: 'Mon-Sat 8AM-6PM', icon: '♻️' },
  { id: 'loc_2', name: 'ChargePoint Station', type: 'ev_charging', lat: 40.7200, lng: -73.995, address: '456 Volt Ave, New York', rating: 4.2, description: 'Level 2 and DC fast charging available. 8 ports.', openHours: '24/7', icon: '⚡' },
  { id: 'loc_3', name: 'Central Green Park', type: 'green_park', lat: 40.7282, lng: -73.985, address: 'Central Park, New York', rating: 4.8, description: 'Beautiful urban park with walking trails and bike paths.', openHours: '6AM-10PM', icon: '🌳' },
  { id: 'loc_4', name: 'EcoMart Organic Store', type: 'eco_store', lat: 40.7150, lng: -74.000, address: '789 Organic Blvd, New York', rating: 4.6, description: 'Organic and locally-sourced groceries, zero-waste products.', openHours: 'Mon-Sun 7AM-9PM', icon: '🌿' },
  { id: 'loc_5', name: 'Refill Station', type: 'water_refill', lat: 40.7180, lng: -73.998, address: '321 Hydrate Lane, New York', rating: 4.3, description: 'Free filtered water refill station. Bring your reusable bottle!', openHours: '24/7', icon: '💧' },
  { id: 'loc_6', name: 'Community Tree Plantation', type: 'tree_plantation', lat: 40.7250, lng: -73.990, address: '654 Forest Rd, New York', rating: 4.7, description: 'Community-driven tree planting initiative. Volunteers welcome!', openHours: 'Weekends 9AM-4PM', icon: '🌲' },
  { id: 'loc_7', name: 'Tesla Supercharger', type: 'ev_charging', lat: 40.730, lng: -73.980, address: '111 Electric Dr, New York', rating: 4.4, description: 'Tesla Supercharger station with 12 stalls. 250kW charging.', openHours: '24/7', icon: '⚡' },
  { id: 'loc_8', name: 'GreenCycle Drop-off', type: 'recycling', lat: 40.710, lng: -74.010, address: '222 Recycle Way, New York', rating: 4.1, description: 'Drop-off point for electronics, batteries, and textiles.', openHours: 'Tue-Sun 9AM-5PM', icon: '♻️' },
];

// ---- Products ----
export const DEMO_PRODUCTS: EcoProduct[] = [
  { id: 'prod_1', name: 'Insulated Reusable Water Bottle', description: 'Double-wall vacuum insulated, keeps drinks cold 24h or hot 12h. BPA-free stainless steel.', category: 'reusable', price: 29.99, sustainabilityScore: 92, co2Savings: 83, image: '🫗', rating: 4.8, reviews: 2340, alternativeTo: 'Single-use plastic bottles', whySwitch: 'A reusable bottle replaces 167 single-use plastic bottles per year, saving 83 kg CO₂ and keeping plastic out of oceans.' },
  { id: 'prod_2', name: 'Portable Solar Charger', description: '20W solar panel with dual USB output. Foldable, waterproof, perfect for outdoor activities.', category: 'solar', price: 49.99, sustainabilityScore: 88, co2Savings: 45, image: '☀️', rating: 4.5, reviews: 1567, alternativeTo: 'Grid electricity charging', whySwitch: 'Solar charging your devices eliminates ~45 kg CO₂ per year from grid electricity.' },
  { id: 'prod_3', name: 'LED Smart Bulb Pack (4)', description: 'WiFi-enabled, 9W (60W equivalent), 16 million colors, voice control compatible.', category: 'led', price: 34.99, sustainabilityScore: 95, co2Savings: 210, image: '💡', rating: 4.7, reviews: 5678, alternativeTo: 'Incandescent bulbs', whySwitch: 'LED bulbs use 75% less energy and last 25x longer than incandescent, saving 210 kg CO₂ per year per household.' },
  { id: 'prod_4', name: 'Organic Cotton Tote Bag Set', description: 'Set of 3 durable, washable organic cotton bags. Perfect for groceries and daily use.', category: 'eco_bags', price: 19.99, sustainabilityScore: 90, co2Savings: 12, image: '🛍️', rating: 4.6, reviews: 3210, alternativeTo: 'Single-use plastic bags', whySwitch: 'Each reusable bag replaces 500+ plastic bags over its lifetime, preventing ocean pollution and saving 12 kg CO₂.' },
  { id: 'prod_5', name: 'Organic Fair-Trade Coffee', description: 'Single-origin Arabica, shade-grown, bird-friendly certified. 500g whole bean.', category: 'organic', price: 14.99, sustainabilityScore: 85, co2Savings: 8, image: '☕', rating: 4.9, reviews: 8901, alternativeTo: 'Conventional coffee', whySwitch: 'Shade-grown organic coffee preserves forests, protects biodiversity, and uses 50% less water than conventional farming.' },
  { id: 'prod_6', name: 'Bamboo Utensil Travel Set', description: 'Knife, fork, spoon, chopsticks, straw & cleaning brush in a cotton pouch.', category: 'reusable', price: 12.99, sustainabilityScore: 93, co2Savings: 15, image: '🥢', rating: 4.4, reviews: 1890, alternativeTo: 'Disposable plastic utensils', whySwitch: 'Bamboo grows 30x faster than trees and biodegrades naturally. One set replaces 1,000+ disposable utensils per year.' },
];

// ---- Offset Projects ----
export const DEMO_OFFSET_PROJECTS: OffsetProject[] = [
  { id: 'off_1', name: 'Amazon Rainforest Preservation', description: 'Protect 10,000 hectares of virgin rainforest in the Brazilian Amazon from deforestation.', type: 'conservation', organization: 'Rainforest Trust', pricePerTon: 15, totalOffset: 50000, location: 'Brazil', image: '🌿', rating: 4.9, verified: true },
  { id: 'off_2', name: 'Community Tree Planting', description: 'Plant native trees in urban and rural communities. Each tree absorbs ~22 kg CO₂ per year.', type: 'tree_planting', organization: 'One Tree Planted', pricePerTon: 8, totalOffset: 25000, location: 'Global', image: '🌳', rating: 4.7, verified: true },
  { id: 'off_3', name: 'Wind Farm Development', description: 'Support the construction of wind turbines in developing regions, replacing coal-fired power.', type: 'renewable', organization: 'Clean Energy Foundation', pricePerTon: 12, totalOffset: 100000, location: 'India', image: '🌬️', rating: 4.6, verified: true },
  { id: 'off_4', name: 'Clean Cookstoves Initiative', description: 'Provide fuel-efficient cookstoves to rural communities, reducing wood fuel consumption by 60%.', type: 'community', organization: 'Global Alliance', pricePerTon: 10, totalOffset: 15000, location: 'Kenya', image: '🔥', rating: 4.8, verified: true },
];

// ---- Notifications ----
export function generateDemoNotifications(userId: string): Notification[] {
  return [
    { id: 'n1', userId, title: '🔥 Streak Alert!', message: 'You\'re on a roll! Keep logging to maintain your streak.', type: 'reminder', read: false, createdAt: daysAgo(0) + 'T08:00:00Z', icon: '🔥' },
    { id: 'n2', userId, title: '🏅 Badge Unlocked!', message: 'You earned the "Week Warrior" badge for a 7-day streak!', type: 'achievement', read: false, createdAt: daysAgo(0) + 'T09:00:00Z', icon: '🏅', actionUrl: '/badges' },
    { id: 'n3', userId, title: '🎯 Challenge Update', message: 'You\'re 60% through the "Vegan Meal" challenge. Keep going!', type: 'challenge', read: true, createdAt: daysAgo(1) + 'T18:00:00Z', icon: '🎯' },
    { id: 'n4', userId, title: '💡 AI Insight', message: 'Your transportation emissions dropped 15% this week! Great improvement.', type: 'ai', read: true, createdAt: daysAgo(1) + 'T20:00:00Z', icon: '💡' },
    { id: 'n5', userId, title: '👥 Community', message: 'Maya Green liked your post about biking to work!', type: 'social', read: true, createdAt: daysAgo(2) + 'T14:00:00Z', icon: '👥' },
  ];
}

// ---- Demo Badge State ----
export function getDemoBadges(persona: string) {
  const badges = ALL_BADGES.map(b => ({ ...b }));
  const unlockedIds = persona === 'eco_warrior'
    ? ['early_adopter', 'streak_3', 'streak_7', 'streak_30', 'save_10', 'save_100', 'save_1000', 'first_post', 'helpful', 'challenge_1', 'challenge_10']
    : persona === 'average_user'
      ? ['early_adopter', 'streak_3', 'streak_7', 'save_10', 'first_post', 'challenge_1']
      : ['early_adopter', 'streak_3'];

  return badges.map(b => ({
    ...b,
    unlocked: unlockedIds.includes(b.id),
    unlockedAt: unlockedIds.includes(b.id) ? new Date().toISOString() : undefined,
  }));
}
