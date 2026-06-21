import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmission,
  calculateFoodEmission,
  calculateElectricityEmission,
  calculateShoppingEmission,
  calculateImpactScore,
  calculateTripOptions,
  projectAnnualEmissions,
} from '../lib/carbon-calculator';

describe('Carbon Calculator Logic', () => {
  describe('calculateTransportEmission', () => {
    it('should correctly calculate emissions for cars', () => {
      expect(calculateTransportEmission('car', 10)).toBe(2.1); // 0.21 * 10
    });

    it('should correctly calculate emissions for buses', () => {
      expect(calculateTransportEmission('bus', 50)).toBe(4.45); // 0.089 * 50
    });

    it('should return 0 for active transport modes', () => {
      expect(calculateTransportEmission('bike', 100)).toBe(0);
      expect(calculateTransportEmission('walk', 20)).toBe(0);
    });
  });

  describe('calculateFoodEmission', () => {
    it('should calculate beef emissions correctly', () => {
      expect(calculateFoodEmission('beef', 2)).toBe(54.0); // 27 * 2
    });

    it('should calculate vegan emissions correctly', () => {
      expect(calculateFoodEmission('vegan', 3)).toBe(2.1); // 0.7 * 3
    });
  });

  describe('calculateElectricityEmission', () => {
    it('should calculate electricity emissions correctly', () => {
      expect(calculateElectricityEmission('electricity', 100)).toBe(42.0); // 0.42 * 100
    });

    it('should calculate gas emissions correctly', () => {
      expect(calculateElectricityEmission('gas', 10)).toBe(20.0); // 2.0 * 10
    });
  });

  describe('calculateShoppingEmission', () => {
    it('should calculate electronics shopping emissions correctly', () => {
      expect(calculateShoppingEmission('electronics', 2)).toBe(100.0); // 50 * 2
    });
  });

  describe('calculateImpactScore', () => {
    it('should compute scores relative to daily average of 22kg CO2', () => {
      expect(calculateImpactScore(11)).toBe(50);
      expect(calculateImpactScore(22)).toBe(100);
      expect(calculateImpactScore(44)).toBe(100); // capped at 100
    });
  });

  describe('calculateTripOptions', () => {
    it('should return a comparative array of transport choices', () => {
      const options = calculateTripOptions(10);
      expect(options).toHaveLength(6);
      expect(options.map(o => o.mode)).toContain('walk');
      expect(options.map(o => o.mode)).toContain('bike');
      expect(options.map(o => o.mode)).toContain('bus');
      expect(options.map(o => o.mode)).toContain('metro');
      expect(options.map(o => o.mode)).toContain('ev');
      expect(options.map(o => o.mode)).toContain('car');
    });
  });

  describe('projectAnnualEmissions', () => {
    it('should project emissions over 1, 5, and 10 years', () => {
      const projection = projectAnnualEmissions(10);
      expect(projection.year1).toBe(3650);
      expect(projection.year5).toBe(18250);
      expect(projection.year10).toBe(36500);
    });
  });
});
