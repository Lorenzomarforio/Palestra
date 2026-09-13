export interface WorkoutRecord {
  id: string;
  date: string;
}

/** Everything a caller needs to persist/retrieve workouts, independent of what's behind it (SQLite via Tauri today). */
export interface WorkoutStore {
  list<T extends WorkoutRecord>(): Promise<T[]>;
  get<T extends WorkoutRecord>(id: string): Promise<T | undefined>;
  put<T extends WorkoutRecord>(workout: T): Promise<void>;
  delete(id: string): Promise<void>;
}
