export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment?: Equipment;
  instructions?: string;
}

export type ExerciseCategory =
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'powerlifting'
  | 'olympic'
  | 'bodyweight'
  | 'crossfit';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'traps'
  | 'neck';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'band'
  | 'medicine_ball'
  | 'pull_up_bar'
  | 'bench'
  | 'rack'
  | 'platform';

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

export const EXERCISE_CATEGORIES: { value: ExerciseCategory; label: string; icon: string }[] = [
  { value: 'strength', label: 'Strength', icon: '💪' },
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
  { value: 'powerlifting', label: 'Powerlifting', icon: '🏋️' },
  { value: 'olympic', label: 'Olympic Lifting', icon: '⚡' },
  { value: 'bodyweight', label: 'Bodyweight', icon: '🤸' },
  { value: 'crossfit', label: 'CrossFit', icon: '🔥' },
];

export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'abs', label: 'Abs' },
  { value: 'obliques', label: 'Obliques' },
  { value: 'lower_back', label: 'Lower Back' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'quadriceps', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'calves', label: 'Calves' },
  { value: 'traps', label: 'Traps' },
  { value: 'neck', label: 'Neck' },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'machine', label: 'Machine' },
  { value: 'cable', label: 'Cable' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'band', label: 'Resistance Band' },
  { value: 'medicine_ball', label: 'Medicine Ball' },
  { value: 'pull_up_bar', label: 'Pull-up Bar' },
  { value: 'bench', label: 'Bench' },
  { value: 'rack', label: 'Power Rack' },
  { value: 'platform', label: 'Platform' },
];

export const COMMON_EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'barbell' },
  { id: 'incline-bench', name: 'Incline Bench Press', category: 'strength', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'dumbbell-press', name: 'Dumbbell Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'dumbbell' },
  { id: 'push-ups', name: 'Push-ups', category: 'bodyweight', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'bodyweight' },
  { id: 'dips', name: 'Dips', category: 'bodyweight', muscleGroups: ['chest', 'triceps'], equipment: 'bodyweight' },
  { id: 'flyes', name: 'Dumbbell Flyes', category: 'strength', muscleGroups: ['chest'], equipment: 'dumbbell' },

  // Back
  { id: 'deadlift', name: 'Deadlift', category: 'powerlifting', muscleGroups: ['back', 'glutes', 'hamstrings', 'lower_back'], equipment: 'barbell' },
  { id: 'pull-ups', name: 'Pull-ups', category: 'bodyweight', muscleGroups: ['back', 'biceps'], equipment: 'pull_up_bar' },
  { id: 'bent-over-row', name: 'Bent Over Row', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'barbell' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'machine' },
  { id: 'seated-row', name: 'Seated Cable Row', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'cable' },
  { id: 'face-pulls', name: 'Face Pulls', category: 'strength', muscleGroups: ['back', 'shoulders'], equipment: 'cable' },

  // Shoulders
  { id: 'ohp', name: 'Overhead Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'dumbbell-ohp', name: 'Dumbbell Shoulder Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbell' },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'strength', muscleGroups: ['shoulders'], equipment: 'dumbbell' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'strength', muscleGroups: ['shoulders'], equipment: 'dumbbell' },
  { id: 'arnold-press', name: 'Arnold Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbell' },

  // Arms
  { id: 'bicep-curl', name: 'Bicep Curl', category: 'strength', muscleGroups: ['biceps'], equipment: 'dumbbell' },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'strength', muscleGroups: ['biceps', 'forearms'], equipment: 'dumbbell' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'strength', muscleGroups: ['triceps'], equipment: 'cable' },
  { id: 'skull-crushers', name: 'Skull Crushers', category: 'strength', muscleGroups: ['triceps'], equipment: 'barbell' },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'strength', muscleGroups: ['biceps'], equipment: 'machine' },

  // Legs
  { id: 'squat', name: 'Squat', category: 'powerlifting', muscleGroups: ['quadriceps', 'glutes', 'hamstrings'], equipment: 'barbell' },
  { id: 'front-squat', name: 'Front Squat', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'barbell' },
  { id: 'leg-press', name: 'Leg Press', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'machine' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'strength', muscleGroups: ['hamstrings', 'glutes', 'lower_back'], equipment: 'barbell' },
  { id: 'leg-curl', name: 'Leg Curl', category: 'strength', muscleGroups: ['hamstrings'], equipment: 'machine' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'strength', muscleGroups: ['quadriceps'], equipment: 'machine' },
  { id: 'calf-raise', name: 'Calf Raise', category: 'strength', muscleGroups: ['calves'], equipment: 'machine' },
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'strength', muscleGroups: ['glutes', 'hamstrings'], equipment: 'barbell' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'dumbbell' },
  { id: 'lunges', name: 'Lunges', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'dumbbell' },

  // Core
  { id: 'plank', name: 'Plank', category: 'bodyweight', muscleGroups: ['abs', 'lower_back'], equipment: 'bodyweight' },
  { id: 'crunch', name: 'Crunch', category: 'bodyweight', muscleGroups: ['abs'], equipment: 'bodyweight' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', category: 'bodyweight', muscleGroups: ['abs', 'obliques'], equipment: 'pull_up_bar' },
  { id: 'russian-twist', name: 'Russian Twist', category: 'bodyweight', muscleGroups: ['obliques', 'abs'], equipment: 'bodyweight' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', category: 'bodyweight', muscleGroups: ['abs', 'lower_back'], equipment: 'bodyweight' },

  // Cardio
  { id: 'running', name: 'Running', category: 'cardio', muscleGroups: ['calves', 'quadriceps', 'hamstrings', 'glutes'], equipment: 'bodyweight' },
  { id: 'cycling', name: 'Cycling', category: 'cardio', muscleGroups: ['quadriceps', 'hamstrings', 'calves'], equipment: 'machine' },
  { id: 'rowing', name: 'Rowing', category: 'cardio', muscleGroups: ['back', 'biceps', 'quadriceps', 'hamstrings'], equipment: 'machine' },
  { id: 'jump-rope', name: 'Jump Rope', category: 'cardio', muscleGroups: ['calves', 'shoulders'], equipment: 'bodyweight' },
];

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