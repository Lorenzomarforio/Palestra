import { isoDay, today, yesterday } from './dates';

/** Minimal shape these functions need — callers may pass a more specific Workout type. */
interface WorkoutLike {
  id: string;
  date: string;
  exercises: { sets: { weight: number; reps: number }[] }[];
}

export function getWorkoutStats(workout: WorkoutLike) {
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

export function calculateStreak<T extends WorkoutLike>(workouts: T[]): number {
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

export function groupWorkoutsByWeek<T extends WorkoutLike>(workouts: T[]) {
  const groups: Record<string, T[]> = {};

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
