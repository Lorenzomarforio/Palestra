import Database from '@tauri-apps/plugin-sql';

let dbPromise: Promise<Database> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = Database.load('sqlite:workouts.db');
  }
  return dbPromise;
};

export async function listWorkouts<T extends { id: string; date: string }>(): Promise<T[]> {
  const db = await getDb();
  const rows = await db.select<{ data: string }[]>('SELECT data FROM workouts ORDER BY date ASC');
  return rows.map((row) => JSON.parse(row.data) as T);
}

export async function getWorkout<T extends { id: string; date: string }>(id: string): Promise<T | undefined> {
  const db = await getDb();
  const rows = await db.select<{ data: string }[]>('SELECT data FROM workouts WHERE id = $1', [id]);
  return rows[0] ? (JSON.parse(rows[0].data) as T) : undefined;
}

export async function putWorkout<T extends { id: string; date: string }>(workout: T): Promise<void> {
  const db = await getDb();
  await db.execute(
    'INSERT INTO workouts (id, date, data) VALUES ($1, $2, $3) ON CONFLICT(id) DO UPDATE SET date = $2, data = $3',
    [workout.id, workout.date, JSON.stringify(workout)]
  );
}

export async function deleteWorkout(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM workouts WHERE id = $1', [id]);
}
