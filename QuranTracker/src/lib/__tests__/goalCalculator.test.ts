/**
 * Unit Tests for Goal Calculator
 * 
 * These tests verify the core business logic of the goal calculation engine.
 */

import { generatePlan, validateGoal } from '../goalCalculator';
import { UserGoal } from '@/types';

describe('Goal Calculator', () => {
  describe('validateGoal', () => {
    it('should validate a correct whole Quran goal', () => {
      const goal: UserGoal = {
        id: 'test-1',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
      };
      
      const result = validateGoal(goal);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject goal with no days selected', () => {
      const goal: UserGoal = {
        id: 'test-2',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [],
      };
      
      const result = validateGoal(goal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one day of the week must be selected');
    });
    
    it('should reject goal with invalid daily amount', () => {
      const goal: UserGoal = {
        id: 'test-3',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 0,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [1, 2, 3],
      };
      
      const result = validateGoal(goal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Daily amount must be greater than 0');
    });
    
    it('should reject goal with deadline before start date', () => {
      const goal: UserGoal = {
        id: 'test-4',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-10'),
        deadline: new Date('2025-01-01'),
        daysOfWeek: [1, 2, 3],
      };
      
      const result = validateGoal(goal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Deadline must be after start date');
    });
    
    it('should validate specific juz goal', () => {
      const goal: UserGoal = {
        id: 'test-5',
        target: 'specific-juz',
        targetValue: 30,
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      };
      
      const result = validateGoal(goal);
      expect(result.valid).toBe(true);
    });
    
    it('should reject invalid juz number', () => {
      const goal: UserGoal = {
        id: 'test-6',
        target: 'specific-juz',
        targetValue: 31,
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [1, 2, 3],
      };
      
      const result = validateGoal(goal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Juz number must be between 1 and 30');
    });
  });
  
  describe('generatePlan', () => {
    it('should generate a plan for whole Quran with 1 page per day', () => {
      const goal: UserGoal = {
        id: 'test-plan-1',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
      };
      
      const plan = generatePlan(goal);
      
      // Should have 604 assignments (one for each page)
      expect(plan.length).toBe(604);
      
      // First assignment should start at page 1
      expect(plan[0].fromPage).toBe(1);
      expect(plan[0].toPage).toBe(1);
      
      // Last assignment should end at page 604
      expect(plan[plan.length - 1].toPage).toBe(604);
      
      // All assignments should be marked as not completed
      expect(plan.every(a => !a.completed)).toBe(true);
      
      // None should be catch-up days
      expect(plan.every(a => !a.isCatchUpDay)).toBe(true);
    });
    
    it('should generate a plan for whole Quran with 2 pages per day', () => {
      const goal: UserGoal = {
        id: 'test-plan-2',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 2,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      };
      
      const plan = generatePlan(goal);
      
      // Should have 302 assignments (604 pages / 2 per day)
      expect(plan.length).toBe(302);
      
      // First assignment should cover pages 1-2
      expect(plan[0].fromPage).toBe(1);
      expect(plan[0].toPage).toBe(2);
    });
    
    it('should respect selected days of the week', () => {
      const goal: UserGoal = {
        id: 'test-plan-3',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-01'), // Wednesday
        daysOfWeek: [3], // Only Wednesdays
      };
      
      const plan = generatePlan(goal);
      
      // All dates should be Wednesdays
      expect(plan.every(a => a.date.getDay() === 3)).toBe(true);
      
      // Dates should be one week apart
      if (plan.length > 1) {
        const firstDate = plan[0].date.getTime();
        const secondDate = plan[1].date.getTime();
        const daysDifference = (secondDate - firstDate) / (1000 * 60 * 60 * 24);
        expect(daysDifference).toBe(7);
      }
    });
    
    it('should generate a plan for specific juz', () => {
      const goal: UserGoal = {
        id: 'test-plan-4',
        target: 'specific-juz',
        targetValue: 30, // Juz Amma
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      };
      
      const plan = generatePlan(goal);
      
      // Juz 30 is about 21-22 pages
      expect(plan.length).toBeGreaterThan(15);
      expect(plan.length).toBeLessThan(25);
      
      // First page should be around 582 (start of Juz 30)
      expect(plan[0].fromPage).toBeGreaterThan(580);
      
      // Last page should be 604 (end of Quran)
      expect(plan[plan.length - 1].toPage).toBe(604);
    });
    
    it('should generate a plan for specific surah', () => {
      const goal: UserGoal = {
        id: 'test-plan-5',
        target: 'specific-surah',
        targetValue: 2, // Al-Baqarah
        unit: 'pages',
        dailyAmount: 1,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      };
      
      const plan = generatePlan(goal);
      
      // Al-Baqarah is about 49 pages (pages 2-50)
      expect(plan.length).toBeGreaterThan(40);
      expect(plan.length).toBeLessThan(52);
    });
    
    it('should have valid ayah references for all assignments', () => {
      const goal: UserGoal = {
        id: 'test-plan-6',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 5,
        startDate: new Date('2025-01-01'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      };
      
      const plan = generatePlan(goal);
      
      // All assignments should have valid ayah format (surah:ayah)
      const ayahRegex = /^\d+:\d+$/;
      expect(plan.every(a => ayahRegex.test(a.fromAyah))).toBe(true);
      expect(plan.every(a => ayahRegex.test(a.toAyah))).toBe(true);
    });
    
    it('should handle goals with deadline', () => {
      const startDate = new Date('2025-01-01');
      const deadline = new Date('2025-01-31'); // 31 days
      
      const goal: UserGoal = {
        id: 'test-plan-7',
        target: 'whole-quran',
        unit: 'pages',
        dailyAmount: 1,
        startDate,
        deadline,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      };
      
      const plan = generatePlan(goal);
      
      // Should not exceed 31 assignments due to deadline
      expect(plan.length).toBeLessThanOrEqual(31);
      
      // All dates should be before or on deadline
      expect(plan.every(a => a.date <= deadline)).toBe(true);
    });
  });
});
