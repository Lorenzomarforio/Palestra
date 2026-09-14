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

/** Names below are Italian; established gym loanwords (Squat, Plank, Leg Press, Crunch, Arnold Press...) are kept as-is. */
export const COMMON_EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Panca Piana', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'barbell' },
  { id: 'incline-bench', name: 'Panca Inclinata', category: 'strength', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'dumbbell-press', name: 'Spinte Manubri', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'dumbbell' },
  { id: 'push-ups', name: 'Piegamenti', category: 'bodyweight', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'bodyweight' },
  { id: 'dips', name: 'Dip', category: 'bodyweight', muscleGroups: ['chest', 'triceps'], equipment: 'bodyweight' },
  { id: 'flyes', name: 'Croci con Manubri', category: 'strength', muscleGroups: ['chest'], equipment: 'dumbbell' },
  { id: 'cable-flyes', name: 'Croci ai Cavi', category: 'strength', muscleGroups: ['chest'], equipment: 'cable' },

  // Back
  { id: 'deadlift', name: 'Stacco da Terra', category: 'powerlifting', muscleGroups: ['back', 'glutes', 'hamstrings', 'lower_back'], equipment: 'barbell' },
  { id: 'pull-ups', name: 'Trazioni', category: 'bodyweight', muscleGroups: ['back', 'biceps'], equipment: 'pull_up_bar' },
  { id: 'bent-over-row', name: 'Rematore Bilanciere', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'barbell' },
  { id: 'lat-pulldown', name: 'Lat Machine', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'machine' },
  { id: 'seated-row', name: 'Rematore ai Cavi', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'cable' },
  { id: 'face-pulls', name: 'Face Pull', category: 'strength', muscleGroups: ['back', 'shoulders'], equipment: 'cable' },
  { id: 'shrugs', name: 'Scrollate', category: 'strength', muscleGroups: ['traps'], equipment: 'barbell' },

  // Shoulders
  { id: 'ohp', name: 'Spinte Military', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'dumbbell-ohp', name: 'Lento Avanti Manubri', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbell' },
  { id: 'lateral-raise', name: 'Alzate Laterali', category: 'strength', muscleGroups: ['shoulders'], equipment: 'dumbbell' },
  { id: 'rear-delt-fly', name: 'Alzate Posteriori', category: 'strength', muscleGroups: ['shoulders'], equipment: 'dumbbell' },
  { id: 'arnold-press', name: 'Arnold Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbell' },

  // Arms
  { id: 'bicep-curl', name: 'Curl con Manubri', category: 'strength', muscleGroups: ['biceps'], equipment: 'dumbbell' },
  { id: 'barbell-curl', name: 'Curl Bilanciere', category: 'strength', muscleGroups: ['biceps'], equipment: 'barbell' },
  { id: 'hammer-curl', name: 'Curl Martello', category: 'strength', muscleGroups: ['biceps', 'forearms'], equipment: 'dumbbell' },
  { id: 'tricep-pushdown', name: 'Pushdown Tricipiti', category: 'strength', muscleGroups: ['triceps'], equipment: 'cable' },
  { id: 'skull-crushers', name: 'Estensioni Tricipiti', category: 'strength', muscleGroups: ['triceps'], equipment: 'barbell' },
  { id: 'preacher-curl', name: 'Curl alla Panca Scott', category: 'strength', muscleGroups: ['biceps'], equipment: 'machine' },

  // Legs
  { id: 'squat', name: 'Squat', category: 'powerlifting', muscleGroups: ['quadriceps', 'glutes', 'hamstrings'], equipment: 'barbell' },
  { id: 'front-squat', name: 'Squat Frontale', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'barbell' },
  { id: 'leg-press', name: 'Leg Press', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'machine' },
  { id: 'romanian-deadlift', name: 'Stacco Rumeno', category: 'strength', muscleGroups: ['hamstrings', 'glutes', 'lower_back'], equipment: 'barbell' },
  { id: 'leg-curl', name: 'Leg Curl', category: 'strength', muscleGroups: ['hamstrings'], equipment: 'machine' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'strength', muscleGroups: ['quadriceps'], equipment: 'machine' },
  { id: 'calf-raise', name: 'Calf Raise', category: 'strength', muscleGroups: ['calves'], equipment: 'machine' },
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'strength', muscleGroups: ['glutes', 'hamstrings'], equipment: 'barbell' },
  { id: 'bulgarian-split-squat', name: 'Affondo Bulgaro', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'dumbbell' },
  { id: 'lunges', name: 'Affondi', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: 'dumbbell' },

  // Core
  { id: 'plank', name: 'Plank', category: 'bodyweight', muscleGroups: ['abs', 'lower_back'], equipment: 'bodyweight' },
  { id: 'crunch', name: 'Crunch', category: 'bodyweight', muscleGroups: ['abs'], equipment: 'bodyweight' },
  { id: 'hanging-leg-raise', name: 'Sollevamento Gambe alla Sbarra', category: 'bodyweight', muscleGroups: ['abs', 'obliques'], equipment: 'pull_up_bar' },
  { id: 'russian-twist', name: 'Twist Russo', category: 'bodyweight', muscleGroups: ['obliques', 'abs'], equipment: 'bodyweight' },
  { id: 'ab-wheel', name: 'Ruota per Addominali', category: 'bodyweight', muscleGroups: ['abs', 'lower_back'], equipment: 'bodyweight' },

  // Cardio
  { id: 'running', name: 'Corsa', category: 'cardio', muscleGroups: ['calves', 'quadriceps', 'hamstrings', 'glutes'], equipment: 'bodyweight' },
  { id: 'cycling', name: 'Ciclismo', category: 'cardio', muscleGroups: ['quadriceps', 'hamstrings', 'calves'], equipment: 'machine' },
  { id: 'rowing', name: 'Vogatore', category: 'cardio', muscleGroups: ['back', 'biceps', 'quadriceps', 'hamstrings'], equipment: 'machine' },
  { id: 'jump-rope', name: 'Corda per Saltare', category: 'cardio', muscleGroups: ['calves', 'shoulders'], equipment: 'bodyweight' },
];
