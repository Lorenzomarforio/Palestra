CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  data TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
