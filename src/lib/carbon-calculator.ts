// ==========================================
// EcoSphere AI — Carbon Calculator Engine
// Real-world CO₂ emission factors
// ==========================================

import { ActivityCategory, TransportMode, FoodType, ElectricityType, ShoppingType } from '../types';

// Emission factors in kg CO₂e per unit
const TRANSPORT_FACTORS: Record<TransportMode, { factor: number; unit: string; label: string }> = {
  car: { factor: 0.21, unit: 'km', label: 'Car' },
  motorcycle: { factor: 0.103, unit: 'km', label: 'Motorcycle' },
  bus: { factor: 0.089, unit: 'km', label: 'Bus' },
  metro: { factor: 0.041, unit: 'km', label: 'Metro/Subway' },
  train: { factor: 0.037, unit: 'km', label: 'Train' },
  flight: { factor: 0.255, unit: 'km', label: 'Flight' },
  ev: { factor: 0.053, unit: 'km', label: 'Electric Vehicle' },
  bike: { factor: 0.0, unit: 'km', label: 'Bicycle' },
  walk: { factor: 0.0, unit: 'km', label: 'Walking' },
};

const FOOD_FACTORS: Record<FoodType, { factor: number; unit: string; label: string }> = {
  beef: { factor: 27.0, unit: 'kg', label: 'Beef' },
  pork: { factor: 12.1, unit: 'kg', label: 'Pork' },
  chicken: { factor: 6.9, unit: 'kg', label: 'Chicken' },
  seafood: { factor: 11.0, unit: 'kg', label: 'Seafood' },
  dairy: { factor: 3.2, unit: 'kg', label: 'Dairy' },
  vegetarian: { factor: 2.0, unit: 'meal', label: 'Vegetarian Meal' },
  vegan: { factor: 0.7, unit: 'meal', label: 'Vegan Meal' },
  mixed: { factor: 5.5, unit: 'meal', label: 'Mixed Meal' },
};

const ELECTRICITY_FACTORS: Record<ElectricityType, { factor: number; unit: string; label: string }> = {
  electricity: { factor: 0.42, unit: 'kWh', label: 'Electricity' },
  gas: { factor: 2.0, unit: 'm³', label: 'Natural Gas' },
  water: { factor: 0.344, unit: 'm³', label: 'Water' },
  heating: { factor: 0.27, unit: 'kWh', label: 'Heating' },
  cooling: { factor: 0.45, unit: 'kWh', label: 'Air Conditioning' },
};

const SHOPPING_FACTORS: Record<ShoppingType, { factor: number; unit: string; label: string }> = {
  electronics: { factor: 50.0, unit: 'item', label: 'Electronics' },
  fashion: { factor: 25.0, unit: 'item', label: 'Clothing' },
  plastic: { factor: 6.0, unit: 'kg', label: 'Plastic Products' },
  paper: { factor: 1.1, unit: 'kg', label: 'Paper Products' },
  furniture: { factor: 80.0, unit: 'item', label: 'Furniture' },
  groceries: { factor: 2.5, unit: 'kg', label: 'Groceries' },
  other: { factor: 10.0, unit: 'item', label: 'Other Shopping' },
};

// Travel, Lifestyle, Waste factors
const TRAVEL_FACTORS: Record<string, { factor: number; unit: string; label: string }> = {
  flight_short: { factor: 0.254, unit: 'km', label: 'Short-haul Flight' },
  flight_long: { factor: 0.150, unit: 'km', label: 'Long-haul Flight' },
  train_long: { factor: 0.035, unit: 'km', label: 'Intercity Train' },
  hotel_stay: { factor: 15.0, unit: 'night', label: 'Hotel Stay' },
};

const LIFESTYLE_FACTORS: Record<string, { factor: number; unit: string; label: string }> = {
  streaming: { factor: 0.018, unit: 'hr', label: 'Video Streaming' },
  laundry_cold: { factor: 0.06, unit: 'cycle', label: 'Cold Laundry' },
  laundry_hot: { factor: 0.82, unit: 'cycle', label: 'Hot Laundry' },
  device_charge: { factor: 0.005, unit: 'charge', label: 'Device Charging' },
};

const WASTE_FACTORS: Record<string, { factor: number; unit: string; label: string }> = {
  landfill: { factor: 1.25, unit: 'kg', label: 'Landfill Waste' },
  recycling: { factor: 0.20, unit: 'kg', label: 'Recycling' },
  compost: { factor: 0.05, unit: 'kg', label: 'Composting' },
};

// ---- Calculator Functions ----

export function calculateTransportEmission(mode: TransportMode, distance: number): number {
  return Math.round(TRANSPORT_FACTORS[mode].factor * distance * 100) / 100;
}

export function calculateFoodEmission(type: FoodType, quantity: number): number {
  return Math.round(FOOD_FACTORS[type].factor * quantity * 100) / 100;
}

export function calculateElectricityEmission(type: ElectricityType, amount: number): number {
  return Math.round(ELECTRICITY_FACTORS[type].factor * amount * 100) / 100;
}

export function calculateShoppingEmission(type: ShoppingType, quantity: number): number {
  return Math.round(SHOPPING_FACTORS[type].factor * quantity * 100) / 100;
}

export function calculateTravelEmission(type: string, distance: number): number {
  return Math.round((TRAVEL_FACTORS[type]?.factor || 0.1) * distance * 100) / 100;
}

export function calculateLifestyleEmission(type: string, amount: number): number {
  return Math.round((LIFESTYLE_FACTORS[type]?.factor || 0.01) * amount * 100) / 100;
}

export function calculateWasteEmission(type: string, amount: number): number {
  return Math.round((WASTE_FACTORS[type]?.factor || 0.5) * amount * 100) / 100;
}

export function calculateImpactScore(co2Amount: number): number {
  const dailyAvg = 22;
  const score = Math.min(100, Math.round((co2Amount / dailyAvg) * 100));
  return score;
}

export function getImpactLabel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: 'Very Low', color: '#22c55e' };
  if (score <= 40) return { label: 'Low', color: '#84cc16' };
  if (score <= 60) return { label: 'Moderate', color: '#f59e0b' };
  if (score <= 80) return { label: 'High', color: '#f97316' };
  return { label: 'Very High', color: '#ef4444' };
}

// ---- Accessors ----

export function getTransportOptions() {
  return Object.entries(TRANSPORT_FACTORS).map(([key, val]) => ({
    value: key as TransportMode,
    ...val,
  }));
}

export function getFoodOptions() {
  return Object.entries(FOOD_FACTORS).map(([key, val]) => ({
    value: key as FoodType,
    ...val,
  }));
}

export function getElectricityOptions() {
  return Object.entries(ELECTRICITY_FACTORS).map(([key, val]) => ({
    value: key as ElectricityType,
    ...val,
  }));
}

export function getShoppingOptions() {
  return Object.entries(SHOPPING_FACTORS).map(([key, val]) => ({
    value: key as ShoppingType,
    ...val,
  }));
}

export function getTravelOptions() {
  return Object.entries(TRAVEL_FACTORS).map(([key, val]) => ({
    value: key,
    ...val,
  }));
}

export function getLifestyleOptions() {
  return Object.entries(LIFESTYLE_FACTORS).map(([key, val]) => ({
    value: key,
    ...val,
  }));
}

export function getWasteOptions() {
  return Object.entries(WASTE_FACTORS).map(([key, val]) => ({
    value: key,
    ...val,
  }));
}

export function getCategoryIcon(category: ActivityCategory): string {
  const icons: Record<ActivityCategory, string> = {
    transportation: 'Car',
    food: 'UtensilsCrossed',
    electricity: 'Zap',
    shopping: 'ShoppingBag',
    travel: 'Plane',
    lifestyle: 'Heart',
    waste: 'Trash2',
  };
  return icons[category];
}

export function getCategoryColor(category: ActivityCategory): string {
  const colors: Record<ActivityCategory, string> = {
    transportation: '#3b82f6',
    food: '#f59e0b',
    electricity: '#8b5cf6',
    shopping: '#ec4899',
    travel: '#06b6d4',
    lifestyle: '#10b981',
    waste: '#6b7280',
  };
  return colors[category];
}

// ---- Trip Optimizer ----
export function calculateTripOptions(distanceKm: number) {
  return [
    {
      mode: 'walk' as TransportMode,
      distance: distanceKm,
      duration: Math.round(distanceKm * 12),
      co2: 0,
      cost: 0,
      calories: Math.round(distanceKm * 65),
      icon: 'Footprints',
    },
    {
      mode: 'bike' as TransportMode,
      distance: distanceKm,
      duration: Math.round(distanceKm * 4),
      co2: 0,
      cost: 0,
      calories: Math.round(distanceKm * 30),
      icon: 'Bike',
    },
    {
      mode: 'bus' as TransportMode,
      distance: distanceKm,
      duration: Math.round(distanceKm * 3),
      co2: calculateTransportEmission('bus', distanceKm),
      cost: Math.round(distanceKm * 0.15 * 100) / 100,
      calories: 0,
      icon: 'Bus',
    },
    {
      mode: 'metro' as TransportMode,
      distance: distanceKm,
      duration: Math.round(distanceKm * 2.5),
      co2: calculateTransportEmission('metro', distanceKm),
      cost: Math.round(distanceKm * 0.12 * 100) / 100,
      calories: 0,
      icon: 'TrainFront',
    },
    {
      mode: 'ev' as TransportMode,
      distance: distanceKm,
      duration: Math.round(distanceKm * 1.5),
      co2: calculateTransportEmission('ev', distanceKm),
      cost: Math.round(distanceKm * 0.08 * 100) / 100,
      calories: 0,
      icon: 'BatteryCharging',
    },
    {
      mode: 'car' as TransportMode,
      distance: distanceKm,
      duration: Math.round(distanceKm * 1.5),
      co2: calculateTransportEmission('car', distanceKm),
      cost: Math.round(distanceKm * 0.25 * 100) / 100,
      calories: 0,
      icon: 'Car',
    },
  ];
}

// ---- Annual Projections ----
export function projectAnnualEmissions(dailyAvgKg: number): { year1: number; year5: number; year10: number } {
  return {
    year1: Math.round(dailyAvgKg * 365),
    year5: Math.round(dailyAvgKg * 365 * 5),
    year10: Math.round(dailyAvgKg * 365 * 10),
  };
}

// ---- Home Energy Savings ----
export function calculateHomeEnergySavings() {
  return [
    {
      id: 'led',
      name: 'LED Lighting',
      category: 'lighting' as const,
      currentOption: 'Incandescent Bulbs',
      ecoOption: 'LED Bulbs',
      annualSavingsKwh: 500,
      annualSavingsCo2: 210,
      annualSavingsMoney: 75,
      installCost: 50,
      paybackYears: 0.7,
      enabled: false,
      icon: 'Lightbulb',
    },
    {
      id: 'solar',
      name: 'Solar Panels',
      category: 'renewable' as const,
      currentOption: 'Grid Electricity',
      ecoOption: 'Solar Panels (5kW)',
      annualSavingsKwh: 6500,
      annualSavingsCo2: 2730,
      annualSavingsMoney: 975,
      installCost: 15000,
      paybackYears: 15.4,
      enabled: false,
      icon: 'Sun',
    },
    {
      id: 'insulation',
      name: 'Wall Insulation',
      category: 'insulation' as const,
      currentOption: 'Uninsulated Walls',
      ecoOption: 'Cavity Wall Insulation',
      annualSavingsKwh: 2200,
      annualSavingsCo2: 924,
      annualSavingsMoney: 330,
      installCost: 2500,
      paybackYears: 7.6,
      enabled: false,
      icon: 'Home',
    },
    {
      id: 'heatpump',
      name: 'Heat Pump',
      category: 'hvac' as const,
      currentOption: 'Gas Boiler',
      ecoOption: 'Air Source Heat Pump',
      annualSavingsKwh: 4000,
      annualSavingsCo2: 1680,
      annualSavingsMoney: 600,
      installCost: 8000,
      paybackYears: 13.3,
      enabled: false,
      icon: 'Thermometer',
    },
    {
      id: 'smartthermo',
      name: 'Smart Thermostat',
      category: 'hvac' as const,
      currentOption: 'Manual Thermostat',
      ecoOption: 'Smart Thermostat',
      annualSavingsKwh: 1100,
      annualSavingsCo2: 462,
      annualSavingsMoney: 165,
      installCost: 250,
      paybackYears: 1.5,
      enabled: false,
      icon: 'Gauge',
    },
    {
      id: 'efficient_appliances',
      name: 'Energy Star Appliances',
      category: 'appliance' as const,
      currentOption: 'Standard Appliances',
      ecoOption: 'Energy Star Rated',
      annualSavingsKwh: 800,
      annualSavingsCo2: 336,
      annualSavingsMoney: 120,
      installCost: 1200,
      paybackYears: 10,
      enabled: false,
      icon: 'Refrigerator',
    },
  ];
}
