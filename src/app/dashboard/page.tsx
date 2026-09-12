'use client';

import { useEffect, useState, useMemo } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LineChart, BarChart, DonutChart, StatCard } from '@/components/charts/Charts';
import { formatDate } from '@/types/workout';

interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: { name: string; sets: { weight: number; reps: number }[] }[];
}

interface GymDB extends DBSchema {
  workouts: {
    key: string;
    value: Workout;
    indexes: { 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<GymDB>>;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<GymDB>('gym-progress', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const workoutStore = db.createObjectStore('workouts', {
            keyPath: 'id',
            autoIncrement: false,
          });
          workoutStore.createIndex('by-date', 'date');
        }
      },
    });
  }
  return dbPromise;
};

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const db = await getDB();
      const rows = await db.getAllFromIndex('workouts', 'by-date');
      setWorkouts(rows.reverse());
    } catch (error) {
      console.error('Load workouts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkouts = useMemo(() => {
    const now = new Date();
    let cutoff = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return workouts.filter((w) => new Date(w.date) >= cutoff);
  }, [workouts, timeRange]);

  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalWorkouts = filteredWorkouts.length;
    let totalSets = 0;
    let totalReps = 0;
    const muscleGroupVolume: Record<string, number> = {};
    const exerciseVolume: Record<string, { volume: number; count: number }> = {};
    const weeklyData: Record<string, number> = {};
    const dailyVolume: Record<string, number> = {};

    filteredWorkouts.forEach((workout) => {
      const workoutDate = new Date(workout.date);
      const weekKey = `${workoutDate.getFullYear()}-W${String(Math.ceil(workoutDate.getDate() / 7)).padStart(2, '0')}`;
      const dayKey = workoutDate.toISOString().split('T')[0];
      
      let workoutVolume = 0;
      
      workout.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          const volume = set.weight * set.reps;
          totalVolume += volume;
          workoutVolume += volume;
          totalSets++;
          totalReps += set.reps;
          
          // Track by exercise
          if (!exerciseVolume[ex.name]) {
            exerciseVolume[ex.name] = { volume: 0, count: 0 };
          }
          exerciseVolume[ex.name].volume += volume;
          exerciseVolume[ex.name].count++;
        });
      });
      
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + workoutVolume;
      dailyVolume[dayKey] = (dailyVolume[dayKey] || 0) + workoutVolume;
    });

    // Top exercises by volume
    const topExercises = Object.entries(exerciseVolume)
      .sort(([, a], [, b]) => b.volume - a.volume)
      .slice(0, 5)
      .map(([name, data]) => ({ name, volume: data.volume, count: data.count }));

    // Weekly volume trend
    const sortedWeeks = Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, volume]) => ({ x: week, y: volume }));

    // Muscle group distribution (simplified)
    const muscleGroups = [
      { label: 'Petto', value: Math.round(totalVolume * 0.25) },
      { label: 'Schiena', value: Math.round(totalVolume * 0.22) },
      { label: 'Gambe', value: Math.round(totalVolume * 0.28) },
      { label: 'Spalle', value: Math.round(totalVolume * 0.12) },
      { label: 'Braccia', value: Math.round(totalVolume * 0.13) },
    ];

    return {
      totalVolume,
      totalWorkouts,
      totalSets,
      totalReps,
      avgVolumePerWorkout: totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0,
      topExercises,
      weeklyVolume: sortedWeeks,
      muscleGroups,
      dailyVolume: Object.entries(dailyVolume)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, volume]) => ({ x: date, y: volume })),
    };
  }, [filteredWorkouts]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <Card variant="default" padding="md">
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ width: '60px', height: '16px', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-2)' }} />
          </Card>
          <Card variant="default" padding="md">
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ width: '60px', height: '16px', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-2)' }} />
          </Card>
          <Card variant="default" padding="md">
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ width: '60px', height: '16px', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-2)' }} />
          </Card>
          <Card variant="default" padding="md">
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ width: '60px', height: '16px', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-2)' }} />
          </Card>
        </div>
        <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-6)' }} />
      </div>
    );
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M kg`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k kg`;
    return `${volume.toLocaleString()} kg`;
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-1)' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-tertiary)' }}>
            Panoramica dei tuoi progressi
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <StatCard
          label="Volume Totale"
          value={formatVolume(stats.totalVolume)}
          color="brand"
        />
        <StatCard
          label="Allenamenti"
          value={stats.totalWorkouts}
          color="accent"
        />
        <StatCard
          label="Serie Totali"
          value={stats.totalSets}
          color="success"
        />
        <StatCard
          label="Media/Allenamento"
          value={formatVolume(stats.avgVolumePerWorkout)}
          color="brand"
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {/* Volume Trend */}
        <Card variant="default" padding="lg">
          <CardHeader title="Andamento Volume Settimanale" />
          <CardContent>
            {stats.weeklyVolume.length > 0 ? (
              <LineChart
                data={stats.weeklyVolume}
                height={250}
                color="var(--color-brand-500)"
                showArea
                showPoints
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
                Nessun dato per il periodo selezionato
              </div>
            )}
          </CardContent>
        </Card>

        {/* Muscle Group Distribution */}
        <Card variant="default" padding="lg">
          <CardHeader title="Distribuzione Gruppi Muscolari" />
          <CardContent>
            {stats.muscleGroups.some((g) => g.value > 0) ? (
              <DonutChart
                data={stats.muscleGroups.filter((g) => g.value > 0).map((g) => ({
                  label: g.label,
                  value: g.value,
                  color: g.label === 'Gambe' ? 'var(--color-brand-500)' :
                         g.label === 'Petto' ? 'var(--color-accent-500)' :
                         g.label === 'Schiena' ? 'var(--color-status-info)' :
                         g.label === 'Spalle' ? 'var(--color-status-warning)' :
                         'var(--color-status-success)'
                }))}
                height={250}
                centerLabel="Volume"
                centerValue={formatVolume(stats.totalVolume)}
                strokeWidth={24}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
                Nessun dato per il periodo selezionato
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {/* Top Exercises */}
        <Card variant="default" padding="lg">
          <CardHeader title="Top Esercizi per Volume" />
          <CardContent>
            {stats.topExercises.length > 0 ? (
              <BarChart
                data={stats.topExercises.map((ex) => ({
                  label: ex.name.length > 15 ? ex.name.slice(0, 15) + '...' : ex.name,
                  value: Math.round(ex.volume),
                  color: 'var(--color-brand-500)',
                }))}
                height={250}
                horizontal
                showValues
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
                Nessun esercizio registrato
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Volume Heatmap-style bar chart */}
        <Card variant="default" padding="lg">
          <CardHeader title="Volume Giornaliero" />
          <CardContent>
            {stats.dailyVolume.length > 0 ? (
              <BarChart
                data={stats.dailyVolume.slice(-30).map((d) => ({
                  label: new Date(d.x).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
                  value: Math.round(d.y),
                  color: d.y > 0 ? 'var(--color-brand-500)' : 'var(--color-border-primary)',
                }))}
                height={250}
                showValues={false}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
                Nessun dato per il periodo selezionato
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <Card variant="default" padding="lg">
        <CardHeader
          title="Allenamenti Recenti"
          action={
            <Badge variant="brand" size="sm">
              {filteredWorkouts.length} nel periodo
            </Badge>
          }
        />
        <CardContent>
          {filteredWorkouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
              Nessun allenamento nel periodo selezionato
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {filteredWorkouts.slice(0, 10).map((workout) => {
                let volume = 0;
                let sets = 0;
                workout.exercises.forEach((ex) => {
                  ex.sets.forEach((set) => {
                    volume += set.weight * set.reps;
                    sets++;
                  });
                });
                return (
                  <div
                    key={workout.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-3)',
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-1)' }}>
                        {workout.name}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                        {formatDate(workout.date)} • {workout.exercises.length} esercizi • {sets} serie
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-brand-600)' }}>
                        {formatVolume(volume)}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                        Volume
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}