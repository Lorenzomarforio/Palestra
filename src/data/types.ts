import { Workout } from '@/domain/workout';

/** Everything a caller needs to persist/retrieve workouts, independent of what's behind it (SQLite via Tauri today). */
export interface WorkoutStore {
  list(): Promise<Workout[]>;
  get(id: string): Promise<Workout | undefined>;
  put(workout: Workout): Promise<void>;
  delete(id: string): Promise<void>;
}
