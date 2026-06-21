// ==========================================
// EcoSphere AI — Gamification Engine
// XP, Levels, Badges, Streaks, Challenges
// ==========================================

import { Badge, Level, Achievement, Challenge, DailyMission } from '../types';

// ---- Level System ----
export const LEVELS: Level[] = [
  { level: 1, title: 'Seedling', minXp: 0, maxXp: 100, icon: '🌱' },
  { level: 2, title: 'Sprout', minXp: 100, maxXp: 300, icon: '🌿' },
  { level: 3, title: 'Sapling', minXp: 300, maxXp: 600, icon: '🪴' },
  { level: 4, title: 'Young Tree', minXp: 600, maxXp: 1000, icon: '🌳' },
  { level: 5, title: 'Oak', minXp: 1000, maxXp: 1500, icon: '🌲' },
  { level: 6, title: 'Forest Guardian', minXp: 1500, maxXp: 2200, icon: '🏕️' },
  { level: 7, title: 'River Keeper', minXp: 2200, maxXp: 3000, icon: '🏞️' },
  { level: 8, title: 'Mountain Spirit', minXp: 3000, maxXp: 4000, icon: '🏔️' },
  { level: 9, title: 'Ocean Protector', minXp: 4000, maxXp: 5500, icon: '🌊' },
  { level: 10, title: 'Earth Champion', minXp: 5500, maxXp: 7500, icon: '🌍' },
  { level: 11, title: 'Climate Hero', minXp: 7500, maxXp: 10000, icon: '🦸' },
  { level: 12, title: 'Eco Legend', minXp: 10000, maxXp: 15000, icon: '👑' },
  { level: 13, title: 'Planet Savior', minXp: 15000, maxXp: 20000, icon: '⭐' },
  { level: 14, title: 'Green Titan', minXp: 20000, maxXp: 30000, icon: '💎' },
  { level: 15, title: 'Sustainability God', minXp: 30000, maxXp: 50000, icon: '🏆' },
];

export function getLevelForXp(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXpProgress(xp: number): { current: number; required: number; percentage: number } {
  const level = getLevelForXp(xp);
  const current = xp - level.minXp;
  const required = level.maxXp - level.minXp;
  return {
    current,
    required,
    percentage: Math.min(100, Math.round((current / required) * 100)),
  };
}

export function getNextLevel(xp: number): Level | null {
  const currentLevel = getLevelForXp(xp);
  const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

// ---- XP Rewards ----
export const XP_REWARDS = {
  logActivity: 10,
  completeChallenge: 50,
  dailyLogin: 5,
  weeklyStreak: 25,
  communityPost: 15,
  communityLike: 2,
  communityComment: 5,
  goalMilestone: 30,
  goalComplete: 100,
  badgeUnlock: 20,
  scanReceipt: 15,
  offsetPurchase: 40,
  shareAchievement: 10,
};

// ---- Badges ----
export const ALL_BADGES: Badge[] = [
  // Streak Badges
  { id: 'streak_3', name: 'Getting Started', description: '3-day login streak', icon: '🔥', category: 'streak', requirement: '3-day streak', xpReward: 20, coinReward: 10, rarity: 'common', unlocked: false },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day login streak', icon: '⚡', category: 'streak', requirement: '7-day streak', xpReward: 50, coinReward: 25, rarity: 'common', unlocked: false },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day login streak', icon: '🌟', category: 'streak', requirement: '30-day streak', xpReward: 150, coinReward: 75, rarity: 'rare', unlocked: false },
  { id: 'streak_100', name: 'Century Club', description: '100-day login streak', icon: '💫', category: 'streak', requirement: '100-day streak', xpReward: 500, coinReward: 250, rarity: 'epic', unlocked: false },
  { id: 'streak_365', name: 'Year of Green', description: '365-day login streak', icon: '🏆', category: 'streak', requirement: '365-day streak', xpReward: 2000, coinReward: 1000, rarity: 'legendary', unlocked: false },

  // Reduction Badges
  { id: 'save_10', name: 'First Steps', description: 'Save 10 kg CO₂', icon: '🌱', category: 'reduction', requirement: 'Save 10 kg CO₂', xpReward: 20, coinReward: 10, rarity: 'common', unlocked: false },
  { id: 'save_100', name: 'Green Saver', description: 'Save 100 kg CO₂', icon: '🌿', category: 'reduction', requirement: 'Save 100 kg CO₂', xpReward: 100, coinReward: 50, rarity: 'rare', unlocked: false },
  { id: 'save_1000', name: 'Carbon Crusher', description: 'Save 1,000 kg CO₂', icon: '💚', category: 'reduction', requirement: 'Save 1,000 kg CO₂', xpReward: 300, coinReward: 150, rarity: 'epic', unlocked: false },
  { id: 'save_10000', name: 'Planet Guardian', description: 'Save 10,000 kg CO₂', icon: '🌍', category: 'reduction', requirement: 'Save 10,000 kg CO₂', xpReward: 1000, coinReward: 500, rarity: 'legendary', unlocked: false },

  // Community Badges
  { id: 'first_post', name: 'Voice Heard', description: 'Create your first community post', icon: '📢', category: 'community', requirement: 'First post', xpReward: 15, coinReward: 5, rarity: 'common', unlocked: false },
  { id: 'helpful', name: 'Helpful Hand', description: 'Get 10 likes on a post', icon: '👍', category: 'community', requirement: '10 likes on a post', xpReward: 50, coinReward: 25, rarity: 'rare', unlocked: false },
  { id: 'influencer', name: 'Eco Influencer', description: 'Get 100 likes total', icon: '🌟', category: 'community', requirement: '100 total likes', xpReward: 200, coinReward: 100, rarity: 'epic', unlocked: false },

  // Challenge Badges
  { id: 'challenge_1', name: 'Challenger', description: 'Complete your first challenge', icon: '🎯', category: 'challenge', requirement: 'First challenge', xpReward: 25, coinReward: 10, rarity: 'common', unlocked: false },
  { id: 'challenge_10', name: 'Challenge Champion', description: 'Complete 10 challenges', icon: '🏅', category: 'challenge', requirement: '10 challenges', xpReward: 150, coinReward: 75, rarity: 'rare', unlocked: false },
  { id: 'challenge_50', name: 'Unstoppable', description: 'Complete 50 challenges', icon: '🎖️', category: 'challenge', requirement: '50 challenges', xpReward: 500, coinReward: 250, rarity: 'epic', unlocked: false },

  // Special Badges
  { id: 'zero_day', name: 'Zero Day Hero', description: 'Log zero emissions for a full day', icon: '🌈', category: 'special', requirement: 'Zero emission day', xpReward: 100, coinReward: 50, rarity: 'rare', unlocked: false },
  { id: 'tree_planter', name: 'Tree Planter', description: 'Offset carbon by planting trees', icon: '🌳', category: 'special', requirement: 'Plant a tree', xpReward: 50, coinReward: 25, rarity: 'common', unlocked: false },
  { id: 'eco_scanner', name: 'Eco Scanner', description: 'Scan 20 receipts', icon: '📸', category: 'special', requirement: '20 scans', xpReward: 75, coinReward: 35, rarity: 'rare', unlocked: false },
  { id: 'early_adopter', name: 'Early Adopter', description: 'Join EcoSphere AI', icon: '🚀', category: 'special', requirement: 'Join the platform', xpReward: 50, coinReward: 25, rarity: 'common', unlocked: true, unlockedAt: new Date().toISOString() },
];

// ---- Achievements ----
export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'log_10', title: 'Logger', description: 'Log 10 activities', icon: '📝', progress: 0, target: 10, completed: false, xpReward: 30 },
  { id: 'log_50', title: 'Dedicated Tracker', description: 'Log 50 activities', icon: '📊', progress: 0, target: 50, completed: false, xpReward: 100 },
  { id: 'log_200', title: 'Data Master', description: 'Log 200 activities', icon: '🎯', progress: 0, target: 200, completed: false, xpReward: 300 },
  { id: 'vegan_7', title: 'Vegan Week', description: 'Log 7 vegan meals', icon: '🥗', progress: 0, target: 7, completed: false, xpReward: 50 },
  { id: 'bike_10', title: 'Pedal Power', description: 'Bike 10 times', icon: '🚲', progress: 0, target: 10, completed: false, xpReward: 50 },
  { id: 'transit_20', title: 'Public Transit Pro', description: 'Take public transit 20 times', icon: '🚌', progress: 0, target: 20, completed: false, xpReward: 75 },
  { id: 'goal_3', title: 'Goal Setter', description: 'Complete 3 goals', icon: '🎯', progress: 0, target: 3, completed: false, xpReward: 100 },
  { id: 'community_5', title: 'Community Member', description: 'Make 5 community posts', icon: '💬', progress: 0, target: 5, completed: false, xpReward: 50 },
];

// ---- Daily Missions ----
export function generateDailyMissions(): DailyMission[] {
  const allMissions: DailyMission[] = [
    { id: 'log_meal', title: 'Log a Meal', description: 'Track what you ate today', xpReward: 10, coinReward: 5, completed: false, icon: '🍽️', action: 'calculator' },
    { id: 'log_transport', title: 'Track Commute', description: 'Log your transportation', xpReward: 10, coinReward: 5, completed: false, icon: '🚗', action: 'calculator' },
    { id: 'check_coach', title: 'Ask AI Coach', description: 'Get a tip from AI Coach', xpReward: 10, coinReward: 5, completed: false, icon: '🤖', action: 'ai-coach' },
    { id: 'community_engage', title: 'Community Engage', description: 'Like or comment on a post', xpReward: 10, coinReward: 5, completed: false, icon: '💬', action: 'community' },
    { id: 'view_analytics', title: 'Review Progress', description: 'Check your carbon timeline', xpReward: 5, coinReward: 3, completed: false, icon: '📊', action: 'timeline' },
    { id: 'eco_tip', title: 'Learn Eco Tip', description: 'Read today\'s sustainability tip', xpReward: 5, coinReward: 3, completed: false, icon: '💡', action: 'dashboard' },
    { id: 'set_goal', title: 'Set a Goal', description: 'Create or update a sustainability goal', xpReward: 15, coinReward: 8, completed: false, icon: '🎯', action: 'goals' },
    { id: 'scan_item', title: 'Scan Something', description: 'Use the receipt scanner', xpReward: 15, coinReward: 8, completed: false, icon: '📸', action: 'scanner' },
  ];

  // Pick 5 random missions
  const shuffled = allMissions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// ---- Challenges ----
export function getDefaultChallenges(): Challenge[] {
  const now = new Date();
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
  const endOfWeek = new Date(now); endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return [
    {
      id: 'daily_walk', title: 'Walk 2km Today', description: 'Replace a short car trip with walking',
      type: 'daily', category: 'transportation', targetValue: 2, currentValue: 0, unit: 'km',
      xpReward: 25, coinReward: 10, startDate: now.toISOString(), endDate: endOfDay.toISOString(),
      status: 'active', icon: '🚶', participants: 1247,
    },
    {
      id: 'daily_vegan', title: 'Vegan Meal', description: 'Have at least one vegan meal today',
      type: 'daily', category: 'food', targetValue: 1, currentValue: 0, unit: 'meals',
      xpReward: 20, coinReward: 8, startDate: now.toISOString(), endDate: endOfDay.toISOString(),
      status: 'active', icon: '🥗', participants: 892,
    },
    {
      id: 'weekly_transit', title: 'Public Transit Week', description: 'Use public transit 5 times this week',
      type: 'weekly', category: 'transportation', targetValue: 5, currentValue: 0, unit: 'trips',
      xpReward: 75, coinReward: 30, startDate: now.toISOString(), endDate: endOfWeek.toISOString(),
      status: 'active', icon: '🚌', participants: 3456,
    },
    {
      id: 'weekly_energy', title: 'Energy Saver', description: 'Reduce electricity usage by 10% this week',
      type: 'weekly', category: 'electricity', targetValue: 10, currentValue: 0, unit: '%',
      xpReward: 60, coinReward: 25, startDate: now.toISOString(), endDate: endOfWeek.toISOString(),
      status: 'active', icon: '⚡', participants: 2134,
    },
    {
      id: 'monthly_offset', title: 'Carbon Neutral Month', description: 'Offset all emissions this month',
      type: 'monthly', category: 'mixed', targetValue: 100, currentValue: 0, unit: '%',
      xpReward: 200, coinReward: 100, startDate: now.toISOString(), endDate: endOfMonth.toISOString(),
      status: 'active', icon: '🌍', participants: 567,
    },
    {
      id: 'community_green', title: 'Green Together', description: 'Community goal: Save 10,000 kg CO₂ collectively',
      type: 'community', category: 'mixed', targetValue: 10000, currentValue: 7234, unit: 'kg CO₂',
      xpReward: 150, coinReward: 75, startDate: now.toISOString(), endDate: endOfMonth.toISOString(),
      status: 'active', icon: '🤝', participants: 12456,
    },
  ];
}
