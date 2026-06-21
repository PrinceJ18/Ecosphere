// ==========================================
// EcoSphere AI — Complete Type Definitions
// ==========================================

// ---- User & Auth ----
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  joinedAt: string;
  level: number;
  xp: number;
  totalXp: number;
  coins: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  notifications: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  language: string;
}

// ---- Carbon Logging ----
export type ActivityCategory = 
  | 'transportation'
  | 'food'
  | 'electricity'
  | 'shopping'
  | 'travel'
  | 'lifestyle'
  | 'waste';

export type TransportMode = 
  | 'car' | 'bike' | 'walk' | 'bus' | 'metro' 
  | 'flight' | 'ev' | 'train' | 'motorcycle';

export type FoodType = 
  | 'vegan' | 'vegetarian' | 'chicken' | 'beef' 
  | 'seafood' | 'pork' | 'dairy' | 'mixed';

export type ElectricityType = 
  | 'electricity' | 'gas' | 'water' | 'heating' | 'cooling';

export type ShoppingType = 
  | 'electronics' | 'fashion' | 'plastic' | 'paper' 
  | 'furniture' | 'groceries' | 'other';

export interface CarbonLog {
  id: string;
  userId: string;
  category: ActivityCategory;
  subCategory: string;
  value: number;        // amount (km, kg, kWh, etc.)
  unit: string;
  co2Amount: number;    // kg CO₂e
  impactScore: number;  // 1-100
  date: string;         // ISO date
  notes?: string;
  createdAt: string;
}

// ---- Goals ----
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ActivityCategory | 'overall';
  targetReduction: number; // percentage
  currentProgress: number;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'failed' | 'paused';
  aiSuggested: boolean;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  achieved: boolean;
  achievedAt?: string;
}

// ---- Gamification ----
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'reduction' | 'community' | 'challenge' | 'special';
  requirement: string;
  xpReward: number;
  coinReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  xpReward: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'community';
  category: ActivityCategory | 'mixed';
  targetValue: number;
  currentValue: number;
  unit: string;
  xpReward: number;
  coinReward: number;
  participants?: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  icon: string;
  joined?: boolean;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  icon: string;
  action: string;
}

export interface Level {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  icon: string;
}

// ---- Community ----
export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  content: string;
  image?: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  tags: string[];
  createdAt: string;
  type: 'tip' | 'achievement' | 'challenge' | 'general' | 'photo';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  level: number;
  co2Saved: number;
  xp: number;
  streak: number;
  badges: number;
  isCurrentUser?: boolean;
}

// ---- AI ----
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  charts?: AIChartData[];
}

export interface AIChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: Array<{ name: string; value: number; color?: string }>;
}

export interface AIReport {
  id: string;
  userId: string;
  type: 'weekly' | 'monthly' | 'annual';
  period: string;
  totalEmissions: number;
  reduction: number;
  topCategory: string;
  insights: string[];
  recommendations: string[];
  score: number;
  createdAt: string;
}

export interface CarbonTwin {
  year1: number;
  year5: number;
  year10: number;
  scenarioOptimistic: number[];
  scenarioCurrent: number[];
  scenarioPessimistic: number[];
}

// ---- Map ----
export interface MapLocation {
  id: string;
  name: string;
  type: 'recycling' | 'ev_charging' | 'green_park' | 'eco_store' | 'water_refill' | 'tree_plantation';
  lat: number;
  lng: number;
  address: string;
  rating: number;
  description: string;
  openHours?: string;
  icon: string;
}

// ---- Marketplace ----
export interface EcoProduct {
  id: string;
  name: string;
  description: string;
  category: 'reusable' | 'solar' | 'led' | 'eco_bags' | 'organic' | 'local';
  price: number;
  sustainabilityScore: number; // 1-100
  co2Savings: number; // kg CO₂ per year
  image: string;
  rating: number;
  reviews: number;
  alternativeTo?: string;
  whySwitch: string;
}

// ---- Offset ----
export interface OffsetProject {
  id: string;
  name: string;
  description: string;
  type: 'tree_planting' | 'renewable' | 'conservation' | 'community';
  organization: string;
  pricePerTon: number;
  totalOffset: number; // tons CO₂
  location: string;
  image: string;
  rating: number;
  verified: boolean;
}

export interface OffsetPurchase {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  amount: number; // dollars
  co2Offset: number; // kg CO₂
  date: string;
  certificate?: string;
}

// ---- Notifications ----
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'challenge' | 'reminder' | 'social' | 'ai' | 'system';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  icon: string;
}

// ---- Home Energy ----
export interface HomeEnergyItem {
  id: string;
  name: string;
  category: 'lighting' | 'appliance' | 'insulation' | 'renewable' | 'hvac';
  currentOption: string;
  ecoOption: string;
  annualSavingsKwh: number;
  annualSavingsCo2: number;
  annualSavingsMoney: number;
  installCost: number;
  paybackYears: number;
  enabled: boolean;
  icon: string;
}

// ---- Scanner ----
export interface ScannedItem {
  id: string;
  name: string;
  category: ActivityCategory;
  co2Amount: number;
  sustainabilityScore: number;
  alternatives?: string[];
  quantity: number;
}

// ---- Trip Optimizer ----
export interface TripOption {
  mode: TransportMode;
  distance: number;
  duration: number; // minutes
  co2: number;      // kg CO₂
  cost: number;     // dollars
  calories: number;
  icon: string;
}

// ---- EcoCity ----
export interface EcoCityBuilding {
  id: string;
  name: string;
  type: 'house' | 'tree' | 'park' | 'solar' | 'wind' | 'garden' | 'bike_lane' | 'ev_station' | 'recycling';
  co2Required: number; // kg CO₂ saved to unlock
  unlocked: boolean;
  x: number;
  y: number;
  level: number;
  icon: string;
}
