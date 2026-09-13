import Database from '@tauri-apps/plugin-sql';
import { WorkoutStore, WorkoutRecord } from './types';

let dbPromise: Promise<Database> | null = null;

const waitForTauri = async (timeoutMs = 5000): Promise<void> => {
  const start = Date.now();
  while (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Tauri runtime not available (timed out waiting for __TAURI_INTERNALS__)');
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
};

const getDb = () => {
  if (!dbPromise) {
    dbPromise = waitForTauri().then(() => Database.load('sqlite:workouts.db'));
  }
  return dbPromise;
};

export const sqliteWorkoutStore: WorkoutStore = {
  async list<T extends WorkoutRecord>(): Promise<T[]> {
    const db = await getDb();
    const rows = await db.select<{ data: string }[]>('SELECT data FROM workouts ORDER BY date ASC');
    return rows.map((row) => JSON.parse(row.data) as T);
  },

  async get<T extends WorkoutRecord>(id: string): Promise<T | undefined> {
    const db = await getDb();
    const rows = await db.select<{ data: string }[]>('SELECT data FROM workouts WHERE id = $1', [id]);
    return rows[0] ? (JSON.parse(rows[0].data) as T) : undefined;
  },

  async put<T extends WorkoutRecord>(workout: T): Promise<void> {
    const db = await getDb();
    await db.execute(
      'INSERT INTO workouts (id, date, data) VALUES ($1, $2, $3) ON CONFLICT(id) DO UPDATE SET date = $2, data = $3',
      [workout.id, workout.date, JSON.stringify(workout)]
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.execute('DELETE FROM workouts WHERE id = $1', [id]);
  },
};
