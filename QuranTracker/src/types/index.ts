/**
 * Core TypeScript Interfaces for Quran Tracker
 * 
 * These interfaces define the shape of data throughout the application.
 * All interfaces are immutable and should be treated as read-only.
 */

/**
 * User's personalized Quran reading goal
 */
export interface UserGoal {
  /** Unique identifier for the goal */
  id: string;
  
  /** Type of reading goal */
  target: 'whole-quran' | 'specific-juz' | 'specific-surah';
  
  /** Specific target value (e.g., 30 for Juz 30, 2 for Surah Al-Baqarah) */
  targetValue?: number;
  
  /** Unit of measurement for daily reading */
  unit: 'pages' | 'juz' | 'surah' | 'ayahs';
  
  /** Amount to read per day (e.g., 1 page, 1 juz, 10 ayahs) */
  dailyAmount: number;
  
  /** Optional deadline to complete the goal */
  deadline?: Date;
  
  /** When the user wants to start reading */
  startDate: Date;
  
  /** Days of the week user wants to read (0 = Sunday, 6 = Saturday) */
  daysOfWeek: number[];
}

/**
 * A single day's reading assignment
 */
export interface DailyAssignment {
  /** Date for this assignment */
  date: Date;
  
  /** Starting Ayah in format "surah:ayah" (e.g., "2:255") */
  fromAyah: string;
  
  /** Ending Ayah in format "surah:ayah" (e.g., "2:286") */
  toAyah: string;
  
  /** Starting page number (Madani Mushaf) */
  fromPage: number;
  
  /** Ending page number (Madani Mushaf) */
  toPage: number;
  
  /** Whether this assignment has been completed */
  completed: boolean;
  
  /** Whether this is a catch-up day for missed reading */
  isCatchUpDay: boolean;
}

/**
 * Surah (Chapter) information
 */
export interface Surah {
  /** Surah number (1-114) */
  id: number;
  
  /** Arabic name */
  nameArabic: string;
  
  /** Transliterated name */
  nameTransliteration: string;
  
  /** English translation of the name */
  nameTranslation: string;
  
  /** Number of ayahs (verses) in this surah */
  ayahCount: number;
  
  /** Revelation type */
  revelationType: 'Meccan' | 'Medinan';
  
  /** Starting page number */
  startPage: number;
  
  /** Ending page number */
  endPage: number;
}

/**
 * Juz (Part) information
 */
export interface Juz {
  /** Juz number (1-30) */
  id: number;
  
  /** Starting page number */
  startPage: number;
  
  /** Ending page number */
  endPage: number;
  
  /** Starting Ayah reference */
  startAyah: string;
  
  /** Ending Ayah reference */
  endAyah: string;
}

/**
 * Ayah (Verse) information
 */
export interface Ayah {
  /** Surah number */
  surahId: number;
  
  /** Ayah number within the surah */
  ayahNumber: number;
  
  /** Page number where this ayah appears */
  page: number;
  
  /** Juz number where this ayah appears */
  juz: number;
  
  /** Arabic text of the ayah */
  text: string;
  
  /** Unique identifier in format "surah:ayah" */
  key: string;
}

/**
 * Application Settings
 */
export interface AppSettings {
  /** Enable/disable notifications */
  notificationsEnabled: boolean;
  
  /** Time for daily reminder (in 24h format, e.g., "09:00") */
  reminderTime?: string;
  
  /** Mushaf style preference */
  mushafStyle: 'madani' | 'standard';
  
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';
  
  /** Language preference */
  language: 'en' | 'ar';
}

/**
 * Progress statistics
 */
export interface ProgressStats {
  /** Total assignments */
  totalAssignments: number;
  
  /** Completed assignments */
  completedAssignments: number;
  
  /** Current streak (consecutive days) */
  currentStreak: number;
  
  /** Best streak ever */
  bestStreak: number;
  
  /** Percentage of goal completed */
  completionPercentage: number;
  
  /** Total pages read */
  totalPagesRead: number;
  
  /** Total ayahs read */
  totalAyahsRead: number;
}
