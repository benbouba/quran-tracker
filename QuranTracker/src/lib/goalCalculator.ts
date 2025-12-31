/**
 * Goal Calculation Engine
 * 
 * Pure, deterministic logic for generating reading plans from user goals.
 * This is the core business logic of the application.
 */

import { UserGoal, DailyAssignment } from '@/types';
import {
  getPageCount,
  getJuzById,
  getSurahById,
  getAyahRangeForPage,
  getPageForAyah,
  parseAyahReference,
} from '@/services/quranData';

/**
 * Calculate the total number of units (pages, juz, etc.) based on the goal
 */
const calculateTotalUnits = (goal: UserGoal): number => {
  switch (goal.target) {
    case 'whole-quran':
      return goal.unit === 'pages' ? 604 : goal.unit === 'juz' ? 30 : 114;
    
    case 'specific-juz':
      if (!goal.targetValue) return 0;
      const juz = getJuzById(goal.targetValue);
      if (!juz) return 0;
      
      if (goal.unit === 'pages') {
        return juz.endPage - juz.startPage + 1;
      }
      return 1; // 1 juz
    
    case 'specific-surah':
      if (!goal.targetValue) return 0;
      const surah = getSurahById(goal.targetValue);
      if (!surah) return 0;
      
      if (goal.unit === 'pages') {
        return surah.endPage - surah.startPage + 1;
      }
      if (goal.unit === 'ayahs') {
        return surah.ayahCount;
      }
      return 1; // 1 surah
    
    default:
      return 0;
  }
};

/**
 * Get the starting page for the goal
 */
const getStartingPage = (goal: UserGoal): number => {
  switch (goal.target) {
    case 'whole-quran':
      return 1;
    
    case 'specific-juz':
      if (!goal.targetValue) return 1;
      const juz = getJuzById(goal.targetValue);
      return juz?.startPage || 1;
    
    case 'specific-surah':
      if (!goal.targetValue) return 1;
      const surah = getSurahById(goal.targetValue);
      return surah?.startPage || 1;
    
    default:
      return 1;
  }
};

/**
 * Get the ending page for the goal
 */
const getEndingPage = (goal: UserGoal): number => {
  switch (goal.target) {
    case 'whole-quran':
      return 604;
    
    case 'specific-juz':
      if (!goal.targetValue) return 1;
      const juz = getJuzById(goal.targetValue);
      return juz?.endPage || 1;
    
    case 'specific-surah':
      if (!goal.targetValue) return 1;
      const surah = getSurahById(goal.targetValue);
      return surah?.endPage || 1;
    
    default:
      return 1;
  }
};

/**
 * Get the starting ayah reference for the goal
 */
const getStartingAyah = (goal: UserGoal): string => {
  switch (goal.target) {
    case 'whole-quran':
      return '1:1'; // Al-Fatihah, ayah 1
    
    case 'specific-juz':
      if (!goal.targetValue) return '1:1';
      const juz = getJuzById(goal.targetValue);
      return juz?.startAyah || '1:1';
    
    case 'specific-surah':
      if (!goal.targetValue) return '1:1';
      return `${goal.targetValue}:1`;
    
    default:
      return '1:1';
  }
};

/**
 * Get the ending ayah reference for the goal
 */
const getEndingAyah = (goal: UserGoal): string => {
  switch (goal.target) {
    case 'whole-quran':
      return '114:6'; // An-Nas, ayah 6
    
    case 'specific-juz':
      if (!goal.targetValue) return '1:1';
      const juz = getJuzById(goal.targetValue);
      return juz?.endAyah || '1:1';
    
    case 'specific-surah':
      if (!goal.targetValue) return '1:1';
      const surah = getSurahById(goal.targetValue);
      if (!surah) return '1:1';
      return `${goal.targetValue}:${surah.ayahCount}`;
    
    default:
      return '1:1';
  }
};

/**
 * Generate array of dates for effective reading days
 */
const generateReadingDates = (goal: UserGoal, totalUnits: number): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(goal.startDate);
  currentDate.setHours(0, 0, 0, 0); // Reset to start of day
  
  const unitsPerDay = goal.dailyAmount;
  const totalDaysNeeded = Math.ceil(totalUnits / unitsPerDay);
  
  let daysAdded = 0;
  let iterations = 0;
  const maxIterations = totalDaysNeeded * 10; // Safety limit
  
  while (daysAdded < totalDaysNeeded && iterations < maxIterations) {
    iterations++;
    
    // Check if this day of week is selected for reading
    const dayOfWeek = currentDate.getDay();
    if (goal.daysOfWeek.includes(dayOfWeek)) {
      // Check if we're within deadline (if specified)
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        deadline.setHours(23, 59, 59, 999); // End of deadline day
        
        if (currentDate > deadline) {
          break; // Stop if we've passed the deadline
        }
      }
      
      dates.push(new Date(currentDate));
      daysAdded++;
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Calculate ayah range for a given page range
 */
const getAyahsForPageRange = (startPage: number, endPage: number): { fromAyah: string; toAyah: string } => {
  const startRange = getAyahRangeForPage(startPage);
  const endRange = getAyahRangeForPage(endPage);
  
  return {
    fromAyah: startRange?.start || '1:1',
    toAyah: endRange?.end || '1:1',
  };
};

/**
 * Increment ayah reference by a given number of ayahs
 */
const incrementAyah = (currentAyah: string, count: number): string => {
  const parsed = parseAyahReference(currentAyah);
  if (!parsed) return currentAyah;
  
  let { surahId, ayahNumber } = parsed;
  let remaining = count;
  
  while (remaining > 0 && surahId <= 114) {
    const surah = getSurahById(surahId);
    if (!surah) break;
    
    const ayahsLeftInSurah = surah.ayahCount - ayahNumber;
    
    if (remaining <= ayahsLeftInSurah) {
      ayahNumber += remaining;
      remaining = 0;
    } else {
      remaining -= (ayahsLeftInSurah + 1);
      surahId++;
      ayahNumber = 1;
    }
  }
  
  return `${surahId}:${ayahNumber}`;
};

/**
 * Generate a complete reading plan from a user goal
 * 
 * This is the main function of the goal calculator.
 * It creates an array of daily assignments based on the user's preferences.
 */
export const generatePlan = (goal: UserGoal): DailyAssignment[] => {
  // Step 1: Calculate total units
  const totalUnits = calculateTotalUnits(goal);
  
  if (totalUnits === 0) {
    return [];
  }
  
  // Step 2: Generate reading dates
  const readingDates = generateReadingDates(goal, totalUnits);
  
  if (readingDates.length === 0) {
    return [];
  }
  
  // Step 3: Distribute units across dates
  const unitsPerDay = goal.dailyAmount;
  const assignments: DailyAssignment[] = [];
  
  // Get starting position
  let currentPage = getStartingPage(goal);
  let currentAyah = getStartingAyah(goal);
  const endingPage = getEndingPage(goal);
  const endingAyah = getEndingAyah(goal);
  
  // Generate assignments based on unit type
  for (const date of readingDates) {
    if (goal.unit === 'pages') {
      // Calculate page range for this day
      const fromPage = currentPage;
      const toPage = Math.min(currentPage + unitsPerDay - 1, endingPage);
      
      // Get ayah range for this page range
      const ayahRange = getAyahsForPageRange(fromPage, toPage);
      
      assignments.push({
        date,
        fromAyah: ayahRange.fromAyah,
        toAyah: ayahRange.toAyah,
        fromPage,
        toPage,
        completed: false,
        isCatchUpDay: false,
      });
      
      currentPage = toPage + 1;
      
      // Break if we've reached the end
      if (currentPage > endingPage) {
        break;
      }
    } else if (goal.unit === 'ayahs') {
      // Calculate ayah range for this day
      const fromAyah = currentAyah;
      const toAyah = incrementAyah(currentAyah, unitsPerDay - 1);
      
      // Get page numbers for these ayahs
      const fromParsed = parseAyahReference(fromAyah);
      const toParsed = parseAyahReference(toAyah);
      
      const fromPage = fromParsed ? (getPageForAyah(fromParsed.surahId, fromParsed.ayahNumber) || 1) : 1;
      const toPage = toParsed ? (getPageForAyah(toParsed.surahId, toParsed.ayahNumber) || 1) : 1;
      
      assignments.push({
        date,
        fromAyah,
        toAyah,
        fromPage,
        toPage,
        completed: false,
        isCatchUpDay: false,
      });
      
      currentAyah = incrementAyah(toAyah, 1);
      
      // Break if we've reached or passed the ending ayah
      const endParsed = parseAyahReference(endingAyah);
      const currentParsed = parseAyahReference(currentAyah);
      
      if (endParsed && currentParsed) {
        if (currentParsed.surahId > endParsed.surahId ||
            (currentParsed.surahId === endParsed.surahId && currentParsed.ayahNumber > endParsed.ayahNumber)) {
          break;
        }
      }
    } else {
      // For juz or surah units, distribute pages evenly
      const fromPage = currentPage;
      const toPage = Math.min(currentPage + unitsPerDay - 1, endingPage);
      
      const ayahRange = getAyahsForPageRange(fromPage, toPage);
      
      assignments.push({
        date,
        fromAyah: ayahRange.fromAyah,
        toAyah: ayahRange.toAyah,
        fromPage,
        toPage,
        completed: false,
        isCatchUpDay: false,
      });
      
      currentPage = toPage + 1;
      
      if (currentPage > endingPage) {
        break;
      }
    }
  }
  
  return assignments;
};

/**
 * Recalculate plan when a user misses days
 * This can be used to create catch-up assignments
 */
export const recalculatePlanWithCatchUp = (
  originalPlan: DailyAssignment[],
  missedAssignments: DailyAssignment[]
): DailyAssignment[] => {
  // This function can be implemented later for advanced features
  // For now, we'll just return the original plan
  return originalPlan;
};

/**
 * Validate a user goal before generating a plan
 */
export const validateGoal = (goal: UserGoal): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if daysOfWeek is not empty
  if (goal.daysOfWeek.length === 0) {
    errors.push('At least one day of the week must be selected');
  }
  
  // Check if startDate is valid
  const startDate = new Date(goal.startDate);
  if (isNaN(startDate.getTime())) {
    errors.push('Invalid start date');
  }
  
  // Check if deadline is after start date (if provided)
  if (goal.deadline) {
    const deadline = new Date(goal.deadline);
    if (isNaN(deadline.getTime())) {
      errors.push('Invalid deadline');
    } else if (deadline < startDate) {
      errors.push('Deadline must be after start date');
    }
  }
  
  // Check if dailyAmount is positive
  if (goal.dailyAmount <= 0) {
    errors.push('Daily amount must be greater than 0');
  }
  
  // Check target-specific validations
  if (goal.target === 'specific-juz' || goal.target === 'specific-surah') {
    if (!goal.targetValue) {
      errors.push('Target value is required for specific juz or surah goals');
    } else {
      if (goal.target === 'specific-juz' && (goal.targetValue < 1 || goal.targetValue > 30)) {
        errors.push('Juz number must be between 1 and 30');
      }
      if (goal.target === 'specific-surah' && (goal.targetValue < 1 || goal.targetValue > 114)) {
        errors.push('Surah number must be between 1 and 114');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
