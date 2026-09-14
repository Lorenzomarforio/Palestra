import { Workout } from './workout';
import { MuscleGroup } from './exerciseCatalog';

export interface TimeSeriesPoint {
  x: string;
  y: number;
}

export interface ExerciseVolume {
  name: string;
  volume: number;
  count: number;
}

export interface MuscleGroupVolume {
  label: string;
  value: number;
}

export interface WorkoutStatsSummary {
  totalVolume: number;
  totalWorkouts: number;
  totalSets: number;
  totalReps: number;
  avgVolumePerWorkout: number;
  topExercises: ExerciseVolume[];
  weeklyVolume: TimeSeriesPoint[];
  dailyVolume: TimeSeriesPoint[];
  muscleGroupVolume: MuscleGroupVolume[];
}

/**
 * Which of the 5 dashboard buckets a muscle group's volume counts toward.
 * abs/obliques have no bucket here by design — core-focused exercises (Plank, Crunch...)
 * don't appear in this chart, so muscleGroupVolume can sum to less than totalVolume.
 */
const MUSCLE_GROUP_BUCKET: Partial<Record<MuscleGroup, string>> = {
  chest: 'Petto',
  back: 'Schiena',
  lower_back: 'Schiena',
  traps: 'Schiena',
  shoulders: 'Spalle',
  neck: 'Spalle',
  biceps: 'Braccia',
  triceps: 'Braccia',
  forearms: 'Braccia',
  glutes: 'Gambe',
  quadriceps: 'Gambe',
  hamstrings: 'Gambe',
  calves: 'Gambe',
};

/** A workout's exercise attributes its full volume to its primary (first-listed) muscle group. */
function primaryBucket(muscleGroups: MuscleGroup[]): string | undefined {
  const primary = muscleGroups[0];
  return primary ? MUSCLE_GROUP_BUCKET[primary] : undefined;
}

export function aggregateWorkoutStats(workouts: Workout[]): WorkoutStatsSummary {
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  const exerciseVolume: Record<string, ExerciseVolume> = {};
  const weeklyData: Record<string, number> = {};
  const dailyVolume: Record<string, number> = {};
  const muscleGroupVolume: Record<string, number> = {};

  workouts.forEach((workout) => {
    const workoutDate = new Date(workout.date);
    const weekKey = `${workoutDate.getFullYear()}-W${String(Math.ceil(workoutDate.getDate() / 7)).padStart(2, '0')}`;
    const dayKey = workoutDate.toISOString().split('T')[0];

    let workoutVolume = 0;

    workout.exercises.forEach((ex) => {
      const bucket = primaryBucket(ex.exercise.muscleGroups);
      const exerciseName = ex.exercise.name;

      ex.sets.forEach((set) => {
        const volume = set.weight * set.reps;
        totalVolume += volume;
        workoutVolume += volume;
        totalSets++;
        totalReps += set.reps;

        if (!exerciseVolume[exerciseName]) {
          exerciseVolume[exerciseName] = { name: exerciseName, volume: 0, count: 0 };
        }
        exerciseVolume[exerciseName].volume += volume;
        exerciseVolume[exerciseName].count++;

        if (bucket) {
          muscleGroupVolume[bucket] = (muscleGroupVolume[bucket] || 0) + volume;
        }
      });
    });

    weeklyData[weekKey] = (weeklyData[weekKey] || 0) + workoutVolume;
    dailyVolume[dayKey] = (dailyVolume[dayKey] || 0) + workoutVolume;
  });

  const topExercises = Object.values(exerciseVolume)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  const weeklyVolume = Object.entries(weeklyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, volume]) => ({ x: week, y: volume }));

  return {
    totalVolume,
    totalWorkouts: workouts.length,
    totalSets,
    totalReps,
    avgVolumePerWorkout: workouts.length > 0 ? Math.round(totalVolume / workouts.length) : 0,
    topExercises,
    weeklyVolume,
    dailyVolume: Object.entries(dailyVolume)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, volume]) => ({ x: date, y: volume })),
    muscleGroupVolume: Object.entries(muscleGroupVolume).map(([label, value]) => ({
      label,
      value: Math.round(value),
    })),
  };
}
