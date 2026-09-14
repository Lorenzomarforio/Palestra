import { isoDay, today, yesterday } from './dates';
import { Exercise } from './exerciseCatalog';

export interface Set {
  id: string;
  reps: number;
  weight: number; // in kg
  rpe?: number; // Rate of Perceived Exertion 1-10
  completed: boolean;
  restTime?: number; // in seconds
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: Set[];
  order: number;
  notes?: string;
}

/** Single source of truth for the Workout shape — every page imports this, none redefines it. */
export interface Workout {
  id: string;
  name: string;
  date: string; // ISO date string
  startTime?: string;
  endTime?: string;
  duration?: number; // in minutes
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
  supplements?: Record<string, boolean>; // keyed by supplement id, see src/config/supplements.ts
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  oneRepMax: number;
  date: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number; // kg
  bodyFatPercentage?: number;
  chest?: number; // cm
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  calves?: number;
  neck?: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Omit<WorkoutExercise, 'id' | 'sets'>[];
}

export interface UserSettings {
  unitSystem: 'metric' | 'imperial';
  restTimerDefault: number; // seconds
  autoRestTimer: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'it' | 'en';
  notifications: boolean;
}

export function getWorkoutStats(workout: Workout) {
  let totalVolume = 0;
  let totalSets = 0;
  workout.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      totalVolume += set.weight * set.reps;
      totalSets++;
    });
  });
  return { totalVolume, totalSets, exerciseCount: workout.exercises.length };
}

export function calculateStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;

  const sortedDates = [...workouts]
    .map((w) => w.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const uniqueDates = [...new Set(sortedDates)];
  let streak = 0;
  const todayStr = today();
  const yesterdayStr = yesterday();

  const checkDate = uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr ? uniqueDates[0] : null;

  if (!checkDate) return 0;

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(checkDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = isoDay(expectedDate);

    if (uniqueDates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function groupWorkoutsByWeek(workouts: Workout[]) {
  const groups: Record<string, Workout[]> = {};

  workouts.forEach((workout) => {
    const date = new Date(workout.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = isoDay(weekStart);

    if (!groups[weekKey]) groups[weekKey] = [];
    groups[weekKey].push(workout);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([weekStart, weekWorkouts]) => ({
      weekStart,
      weekLabel:
        new Date(weekStart).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) +
        ' - ' +
        new Date(new Date(weekStart).getTime() + 6 * 86400000).toLocaleDateString('it-IT', {
          day: 'numeric',
          month: 'short',
        }),
      workouts: weekWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
}

export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  // Epley formula
  return Math.round(weight * (1 + reps / 30));
}

export function calculateVolume(sets: Set[]): number {
  return sets.reduce((total, set) => total + set.reps * set.weight, 0);
}

export function formatWeight(weight: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'imperial') {
    const lbs = weight * 2.20462;
    return `${Math.round(lbs)} lbs`;
  }
  return `${weight} kg`;
}

export function formatDate(dateString: string, locale: 'it' | 'en' = 'it'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}
