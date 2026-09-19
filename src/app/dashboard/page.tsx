'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { workoutStore } from '@/data/workoutStore';
import { getWorkoutStats, formatDate, Workout } from '@/domain/workout';
import { aggregateWorkoutStats } from '@/domain/stats';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LineChart, BarChart, DonutChart, StatCard } from '@/components/charts/Charts';
import { ArrowLeft } from 'lucide-react';
import { useNotice } from '@/lib/notice';

export default function Dashboard() {
  const router = useRouter();
  const { showError } = useNotice();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const rows = await workoutStore.list();
      setWorkouts(rows.reverse());
    } catch (error) {
      console.error('Load workouts error:', error);
      showError('Impossibile caricare gli allenamenti.');
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

  const stats = useMemo(() => aggregateWorkoutStats(filteredWorkouts), [filteredWorkouts]);

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
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} leftIcon={<ArrowLeft size={16} />} style={{ marginBottom: 'var(--space-2)' }}>
            Indietro
          </Button>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-1)' }}>
            Dashboard
          </h1>
          <p className="text-muted">
            Panoramica dei tuoi progressi
          </p>
        </div>
        <div className="flex-row gap-2">
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
              <div className="empty-state">
                Nessun dato per il periodo selezionato
              </div>
            )}
          </CardContent>
        </Card>

        {/* Muscle Group Distribution */}
        <Card variant="default" padding="lg">
          <CardHeader title="Distribuzione Gruppi Muscolari" />
          <CardContent>
            {stats.muscleGroupVolume.some((g) => g.value > 0) ? (
              <DonutChart
                data={stats.muscleGroupVolume.filter((g) => g.value > 0).map((g) => ({
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
                formatValue={formatVolume}
              />
            ) : (
              <div className="empty-state">
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
              <div className="empty-state">
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
              <div className="empty-state">
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
            <div className="empty-state">
              Nessun allenamento nel periodo selezionato
            </div>
          ) : (
            <div className="flex-col gap-3">
              {filteredWorkouts.slice(0, 10).map((workout) => {
                const { totalVolume: volume, totalSets: sets } = getWorkoutStats(workout);
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