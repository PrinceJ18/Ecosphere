import { describe, it, expect } from 'vitest';
import {
  getAIGreeting,
  generateAIResponse,
  getDailyInsight,
  generateCarbonTwin,
} from '../lib/ai-engine';
import { CarbonLog } from '../types';

describe('AI Coach Engine', () => {
  describe('getAIGreeting', () => {
    it('should return a valid greeting string', () => {
      const greeting = getAIGreeting();
      expect(greeting).toBeTypeOf('string');
      expect(greeting.length).toBeGreaterThan(5);
    });
  });

  describe('generateAIResponse', () => {
    const emptyLogs: CarbonLog[] = [];
    const dummyLogs: CarbonLog[] = [
      { id: '1', userId: 'user_1', category: 'food', subCategory: 'Beef', value: 1, unit: 'kg', co2Amount: 27, date: '2026-06-21', impactScore: 100, createdAt: new Date().toISOString() },
      { id: '2', userId: 'user_1', category: 'transportation', subCategory: 'Car', value: 10, unit: 'km', co2Amount: 2.1, date: '2026-06-21', impactScore: 10, createdAt: new Date().toISOString() },
    ];

    it('should return a greeting response when user says hi', () => {
      const res = generateAIResponse('hello', emptyLogs);
      expect(res.role).toBe('assistant');
      expect(res.content).toBeTypeOf('string');
    });

    it('should generate a weekly plan when requested', () => {
      const res = generateAIResponse('Give me a weekly plan', emptyLogs);
      expect(res.content).toContain('Weekly Sustainability Plan');
    });

    it('should analyze footprint when user has logs', () => {
      const res = generateAIResponse('Show my footprint analysis', dummyLogs);
      expect(res.content).toContain('Total tracked emissions');
      expect(res.content).toContain('food');
    });

    it('should suggest starting calculator if no logs present on analysis request', () => {
      const res = generateAIResponse('Show my footprint analysis', emptyLogs);
      expect(res.content).toContain('Start by logging some activities');
    });

    it('should return a comparison table when asked to compare', () => {
      const res = generateAIResponse('compare options', emptyLogs);
      expect(res.content).toContain('Carbon Footprint Comparisons');
    });

    it('should give goal recommendations', () => {
      const res = generateAIResponse('suggest goals', dummyLogs);
      expect(res.content).toContain('Recommended Goals');
    });
  });

  describe('getDailyInsight', () => {
    it('should suggest tracking if logs are empty', () => {
      expect(getDailyInsight([])).toContain('Start tracking your carbon footprint');
    });

    it('should give zero emission encouragement if no logs for today', () => {
      const logsFromYesterday = [
        { id: '1', userId: 'user_1', category: 'food' as const, subCategory: 'Vegan', value: 1, unit: 'meal', co2Amount: 0.7, date: '2026-06-20', impactScore: 3, createdAt: new Date().toISOString() },
      ];
      expect(getDailyInsight(logsFromYesterday)).toContain('No activities logged today yet');
    });

    it('should give excellent message for low emissions today (< 5)', () => {
      const today = new Date().toISOString().split('T')[0];
      const lowLogs = [
        { id: '1', userId: 'user_1', category: 'food' as const, subCategory: 'Vegan', value: 1, unit: 'meal', co2Amount: 0.7, date: today, impactScore: 3, createdAt: new Date().toISOString() },
      ];
      expect(getDailyInsight(lowLogs)).toContain('well below the daily average');
    });

    it('should give good message for moderate emissions today (5 to 15)', () => {
      const today = new Date().toISOString().split('T')[0];
      const moderateLogs = [
        { id: '1', userId: 'user_1', category: 'transportation' as const, subCategory: 'Car', value: 40, unit: 'km', co2Amount: 8.4, date: today, impactScore: 38, createdAt: new Date().toISOString() },
      ];
      expect(getDailyInsight(moderateLogs)).toContain("You're doing good, but there's room");
    });

    it('should advise reduction for high emissions today (> 15)', () => {
      const today = new Date().toISOString().split('T')[0];
      const highLogs = [
        { id: '1', userId: 'user_1', category: 'food' as const, subCategory: 'Beef', value: 1, unit: 'kg', co2Amount: 27.0, date: today, impactScore: 100, createdAt: new Date().toISOString() },
      ];
      expect(getDailyInsight(highLogs)).toContain('that\'s above average');
    });
  });

  describe('generateCarbonTwin', () => {
    it('should generate a 10-year projection trend array', () => {
      const twin = generateCarbonTwin(15);
      expect(twin.labels).toHaveLength(10);
      expect(twin.current).toHaveLength(10);
      expect(twin.optimistic).toHaveLength(10);
      expect(twin.pessimistic).toHaveLength(10);
      expect(twin.current[0]).toBeLessThan(twin.current[9]);
    });
  });
});
