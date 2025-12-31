Quran Tracker - Master Specification & Build Plan
File: .github/copilot-instructions.md
Purpose: This file is the complete architectural blueprint and sequence of work for the GitHub Copilot Agent to autonomously build the Quran Tracker React Native app. The agent must follow this plan sequentially.

1. Project Constitution & Absolute Rules
1.1 Core Identity
Project Name: Quran Tracker

Mission: A mobile app for setting, tracking, and achieving personalized Quran reading goals with intelligent scheduling and progress visualization.

Core User Value: Transform the intention to complete the Quran into a manageable, flexible, and motivating daily plan.

1.2 Mandatory Technical Stack
Framework: React Native (CLI), initialized with the TypeScript template.

Language: TypeScript. All core logic must have explicit interfaces.

UI Component Library: React Native Paper. Use its theming, components, and icons for 100% of UI.

State Management: Zustand. For simple, fast global state (goals, plan, progress).

Navigation: React Navigation (v6). Use a Bottom Tab Navigator for main app areas and Stack Navigators within tabs.

Local Persistence: @react-native-async-storage/async-storage for Phase 1-3. Plan for migration to WatermelonDB.

Quran Data: Integrate the quran-engine npm package. This is the primary data source for Surah, Juz, Page, and Ayah mapping. Fallback to a local quran.json if necessary.

Project Path Aliasing: Use @/ prefix for imports (e.g., @/components/Button). Configure via babel.config.js.

1.3 Code & Quality Mandates
Atomic Commits: Each feature or fix must be in its own commit/PR.

TypeScript First: Define interfaces before writing functions.

Functional Components: Use React Hooks exclusively. No class components.

Clean Architecture: Separate logic (/src/lib), services (/src/services), state (/src/store), UI (/src/components), and screens (/src/screens).

UI Consistency: The primary theme color is #1a5e1a. Use React Native Paper's Provider and MD3LightTheme.

2. Complete Development Roadmap
The agent must execute these phases in order. Do not proceed to the next phase without completing and verifying the core objectives of the current one.

PHASE 0: Repository & Project Foundation
Objective: Create the codebase and foundational configuration.

0.1: Create a new private GitHub repository named quran-tracker.

0.2: Initialize the React Native project: npx react-native init QuranTracker --template react-native-template-typescript.

0.3: Install core dependencies:

bash
npm install react-native-paper zustand @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-native-async-storage/async-storage
npm install --save-dev @types/react-native @types/node
0.4: Set up path aliasing in babel.config.js and tsconfig.json.

0.5: Create the project directory structure:

text
/src
  /components (Reusable UI components)
  /screens (App screens)
  /services (Quran data, storage, APIs)
  /lib (Pure logic: calculators, formatters)
  /store (Zustand state stores)
  /types (Global TypeScript definitions)
  /navigation (Navigators)
  /assets (Fonts, images, local data)
0.6: Place this instruction file as .github/copilot-instructions.md in the root.

PHASE 1: Data Layer & Core Calculation Engine (The Brain)
Objective: Build the non-UI, critical logic. This is the app's most important component.

1.1: Quran Data Service (/src/services/quranData.ts)

Integrate quran-engine. Create a clean API for the app.

Key Functions: getJuzList(), getSurahList(), getVersesByPage(pageNum), getPageCount(), getAyahsForSurah(surahId).

This service must abstract the data source. It returns structured objects.

1.2: Goal Calculation Engine (/src/lib/goalCalculator.ts)

Define Interfaces: UserGoal, DailyAssignment (see Appendix A).

Function: generatePlan(goal: UserGoal): DailyAssignment[].

Algorithm Logic:

Calculate total "units" (e.g., 604 pages for whole Quran).

Determine number of effective reading days based on selectedDays[] and deadline.

Evenly distribute units across these days.

Map the unit ranges to specific Quranic text (starting/ending Ayah keys, page numbers) using the quranData service.

Generate the array of DailyAssignment objects with real dates.

This must be pure, deterministic logic. Write unit tests in a separate __tests__ folder.

PHASE 2: Application State & Navigation Skeleton
Objective: Create the global state and connect the app's flow.

2.1: Zustand Global Store (/src/store/useGoalStore.ts)

State: currentGoal: UserGoal | null, plan: DailyAssignment[], lastUpdated: Date.

Actions: setGoal(goal), markDayAsComplete(date), getTodaysAssignment(), clearPlan().

The store must be the single source of truth for all goal-related data.

2.2: Navigation Structure (/src/navigation/)

Create AppNavigator.tsx.

Implement a BottomTabNavigator with 3 tabs: "Dashboard" (home), "Plan", "Settings".

Inside the "Plan" tab, nest a StackNavigator with two screens: GoalSetupScreen and CalendarViewScreen.

PHASE 3: User Interface Implementation
Objective: Build each screen atomically, connecting to state and logic.

3.1: Goal Setup Screen (/src/screens/GoalSetupScreen.tsx)

UI Components: React Native Paper Card, RadioButton (for target), TextInput (for days), Chip (for days of week), Button.

Logic: On submit, validate input, call useGoalStore.getState().setGoal(newGoal), then navigate to the Dashboard.

3.2: Dashboard/Home Screen (/src/screens/DashboardScreen.tsx)

Display: a) A large circular progress bar (react-native-paper). b) A Card showing getTodaysAssignment(). c) A "Mark as Done" Button. d) A streak counter. e) A quick "Jump to Today" action.

State: Heavily uses useGoalStore.

3.3: Calendar Plan Screen (/src/screens/CalendarScreen.tsx)

A FlatList of DailyAssignment cards. Each card shows date, page/ayah range, and a Checkbox for completion.

Tapping the checkbox toggles markDayAsComplete().

3.4: Settings Screen (/src/screens/SettingsScreen.tsx)

Options for notifications, Mushaf style, data backup/export, and app info.

PHASE 4: Polish, Persistence & Release
Objective: Make the app robust, persistent, and shippable.

4.1: Persistent Storage Service (/src/services/storageService.ts)

Bridge between Zustand and AsyncStorage. Automatically save/load the store state on app launch/close.

4.2: Notification Service (/src/services/notificationService.ts)

Integrate react-native-push-notification. Schedule reminders for the user's selected reading days.

4.3: Final Polish

Add loading states, error boundaries, empty states.

Implement celebratory feedback (e.g., a modal when a Juz is completed).

Ensure consistent theming and responsiveness.

4.4: Build & Release Prep

Generate Android release build (AAB).

Build iOS archive.

Update README.md with project overview and setup instructions.

Appendix A: Core TypeScript Interfaces
typescript
// /src/types/index.ts
interface UserGoal {
  id: string;
  target: 'whole-quran' | 'specific-juz' | 'specific-surah';
  targetValue?: number; // e.g., 30 for Juz 30
  unit: 'pages' | 'juz' | 'surah' | 'ayahs';
  dailyAmount: number; // e.g., 1 (page/juz/etc.)
  deadline?: Date; // Optional end date
  startDate: Date;
  daysOfWeek: number[]; // 0 (Sun) to 6 (Sat)
}

interface DailyAssignment {
  date: Date;
  fromAyah: string; // "2:255" (Surah:Ayah)
  toAyah: string;
  fromPage: number;
  toPage: number;
  completed: boolean;
  isCatchUpDay: boolean;
}