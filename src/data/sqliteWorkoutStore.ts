import Database from '@tauri-apps/plugin-sql';
import { WorkoutStore } from './types';
import { Workout } from '@/domain/workout';

let dbPromise: Promise<Database> | null = null;
let writeQueue = Promise.resolve();

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
    dbPromise = (async () => {
      await waitForTauri();
      const db = await Database.load('sqlite:workouts.db');
      try {
        await db.execute('PRAGMA journal_mode = WAL;');
        await db.execute('PRAGMA busy_timeout = 5000;');
        await db.execute('PRAGMA synchronous = NORMAL;');
      } catch (err) {
        console.warn('Could not set SQLite pragmas:', err);
      }
      return db;
    })();
  }
  return dbPromise;
};

const queueWrite = async <T>(operation: () => Promise<T>): Promise<T> => {
  const runWithRetry = async (): Promise<T> => {
    let attempts = 0;
    while (true) {
      try {
        return await operation();
      } catch (err: unknown) {
        attempts++;
        const errMsg = err instanceof Error ? err.message : String(err);
        if ((errMsg.includes('locked') || errMsg.includes('busy') || errMsg.includes('code: 5')) && attempts < 5) {
          await new Promise((r) => setTimeout(r, 50 * attempts));
          continue;
        }
        throw err;
      }
    }
  };

  const next = writeQueue.then(runWithRetry, runWithRetry);
  writeQueue = next.then(() => {}, () => {});
  return next;
};

export const sqliteWorkoutStore: WorkoutStore = {
  async list(): Promise<Workout[]> {
    const db = await getDb();
    const rows = await db.select<{ data: string }[]>('SELECT data FROM workouts ORDER BY date ASC');
    return rows.map((row) => JSON.parse(row.data) as Workout);
  },

  async get(id: string): Promise<Workout | undefined> {
    const db = await getDb();
    const rows = await db.select<{ data: string }[]>('SELECT data FROM workouts WHERE id = $1', [id]);
    return rows[0] ? (JSON.parse(rows[0].data) as Workout) : undefined;
  },

  async put(workout: Workout): Promise<void> {
    return queueWrite(async () => {
      const db = await getDb();
      await db.execute(
        'INSERT INTO workouts (id, date, data) VALUES ($1, $2, $3) ON CONFLICT(id) DO UPDATE SET date = $2, data = $3',
        [workout.id, workout.date, JSON.stringify(workout)]
      );
    });
  },

  async delete(id: string): Promise<void> {
    return queueWrite(async () => {
      const db = await getDb();
      await db.execute('DELETE FROM workouts WHERE id = $1', [id]);
    });
  },
};
