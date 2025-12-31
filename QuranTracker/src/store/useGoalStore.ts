/**
 * Global State Management using Zustand
 * 
 * This is the single source of truth for all goal-related data in the app.
 */

import { create } from 'zustand';
import { UserGoal, DailyAssignment } from '@/types';
import { generatePlan } from '@/lib/goalCalculator';

interface GoalState {
  /** Current active goal */
  currentGoal: UserGoal | null;
  
  /** Generated plan with daily assignments */
  plan: DailyAssignment[];
  
  /** Timestamp of last update */
  lastUpdated: Date | null;
  
  /** Current streak (consecutive days completed) */
  currentStreak: number;
  
  /** Best streak achieved */
  bestStreak: number;
  
  /** Total days completed */
  totalDaysCompleted: number;
}

interface GoalActions {
  /** Set a new goal and generate its plan */
  setGoal: (goal: UserGoal) => void;
  
  /** Mark a specific day as complete */
  markDayAsComplete: (date: Date) => void;
  
  /** Mark a specific day as incomplete */
  markDayAsIncomplete: (date: Date) => void;
  
  /** Get today's assignment */
  getTodaysAssignment: () => DailyAssignment | null;
  
  /** Clear all goal data */
  clearPlan: () => void;
  
  /** Get progress percentage (0-100) */
  getProgressPercentage: () => number;
  
  /** Get total completed assignments */
  getCompletedCount: () => number;
  
  /** Get total assignments in plan */
  getTotalCount: () => number;
  
  /** Update streaks based on completion status */
  updateStreaks: () => void;
}

type GoalStore = GoalState & GoalActions;

/**
 * Helper function to check if two dates are the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Helper function to calculate streaks
 */
const calculateStreaks = (plan: DailyAssignment[]): { current: number; best: number } => {
  const sortedAssignments = [...plan].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  
  for (const assignment of sortedAssignments) {
    if (assignment.completed) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
      
      // If this is today or yesterday, it counts towards current streak
      const daysDiff = Math.floor(
        (today.getTime() - assignment.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff <= 1) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }
  
  return { current: currentStreak, best: bestStreak };
};

export const useGoalStore = create<GoalStore>((set, get) => ({
  // Initial state
  currentGoal: null,
  plan: [],
  lastUpdated: null,
  currentStreak: 0,
  bestStreak: 0,
  totalDaysCompleted: 0,
  
  // Actions
  setGoal: (goal: UserGoal) => {
    const newPlan = generatePlan(goal);
    const streaks = calculateStreaks(newPlan);
    const completed = newPlan.filter(a => a.completed).length;
    
    set({
      currentGoal: goal,
      plan: newPlan,
      lastUpdated: new Date(),
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      totalDaysCompleted: completed,
    });
  },
  
  markDayAsComplete: (date: Date) => {
    const { plan } = get();
    const updatedPlan = plan.map(assignment => {
      if (isSameDay(assignment.date, date)) {
        return { ...assignment, completed: true };
      }
      return assignment;
    });
    
    const streaks = calculateStreaks(updatedPlan);
    const completed = updatedPlan.filter(a => a.completed).length;
    
    set({
      plan: updatedPlan,
      lastUpdated: new Date(),
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      totalDaysCompleted: completed,
    });
  },
  
  markDayAsIncomplete: (date: Date) => {
    const { plan } = get();
    const updatedPlan = plan.map(assignment => {
      if (isSameDay(assignment.date, date)) {
        return { ...assignment, completed: false };
      }
      return assignment;
    });
    
    const streaks = calculateStreaks(updatedPlan);
    const completed = updatedPlan.filter(a => a.completed).length;
    
    set({
      plan: updatedPlan,
      lastUpdated: new Date(),
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      totalDaysCompleted: completed,
    });
  },
  
  getTodaysAssignment: () => {
    const { plan } = get();
    const today = new Date();
    
    const todaysAssignment = plan.find(assignment =>
      isSameDay(assignment.date, today)
    );
    
    return todaysAssignment || null;
  },
  
  clearPlan: () => {
    set({
      currentGoal: null,
      plan: [],
      lastUpdated: null,
      currentStreak: 0,
      bestStreak: 0,
      totalDaysCompleted: 0,
    });
  },
  
  getProgressPercentage: () => {
    const { plan } = get();
    if (plan.length === 0) return 0;
    
    const completed = plan.filter(a => a.completed).length;
    return Math.round((completed / plan.length) * 100);
  },
  
  getCompletedCount: () => {
    const { plan } = get();
    return plan.filter(a => a.completed).length;
  },
  
  getTotalCount: () => {
    const { plan } = get();
    return plan.length;
  },
  
  updateStreaks: () => {
    const { plan } = get();
    const streaks = calculateStreaks(plan);
    const completed = plan.filter(a => a.completed).length;
    
    set({
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      totalDaysCompleted: completed,
    });
  },
}));
