'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { listWorkouts, putWorkout, deleteWorkout as deleteWorkoutFromDb } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { formatDate } from '@/types/workout';
import {
  Dumbbell,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  Clock,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  Calendar,
  BarChart2,
  Settings,
  X,
  Loader2,
} from 'lucide-react';

interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: { sets: { weight: number; reps: number }[] }[];
}

const generateId = () => Math.random().toString(36).slice(2, 11);

const WORKOUT_TEMPLATES = [
  {
    id: 'push',
    name: 'Push Day',
    exercises: ['Panca Piana', 'Spinte Manubri', 'Croci Cav', 'Spinte Military', 'Alzate Laterali', 'Pushdown Tricipiti', 'Estensioni Tricipiti'],
  },
  {
    id: 'pull',
    name: 'Pull Day',
    exercises: ['Trazioni', 'Rematore Bilanciere', 'Lat Machine', 'Face Pull', 'Curl Bilanciere', 'Curl Martello', 'Scrollate'],
  },
  {
    id: 'legs',
    name: 'Leg Day',
    exercises: ['Squat', 'Leg Press', 'Affondi', 'Leg Extension', 'Leg Curl', 'Calf Raise', 'Hip Thrust'],
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    exercises: ['Squat', 'Panca Piana', 'Rematore', 'Spinte Military', 'Stacco Rumeno', 'Face Pull', 'Plank'],
  },
];

const getWorkoutStats = (workout: Workout) => {
  let totalVolume = 0;
  let totalSets = 0;
  workout.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      totalVolume += set.weight * set.reps;
      totalSets++;
    });
  });
  return { totalVolume, totalSets, exerciseCount: workout.exercises.length };
};

const calculateStreak = (workouts: Workout[]): number => {
  if (workouts.length === 0) return 0;
  
  const sortedDates = [...workouts]
    .map(w => w.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const uniqueDates = [...new Set(sortedDates)];
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let checkDate = uniqueDates[0] === today || uniqueDates[0] === yesterday ? uniqueDates[0] : null;
  
  if (!checkDate) return 0;
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(checkDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = expectedDate.toISOString().split('T')[0];
    
    if (uniqueDates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const groupWorkoutsByWeek = (workouts: Workout[]) => {
  const groups: Record<string, Workout[]> = {};
  
  workouts.forEach(workout => {
    const date = new Date(workout.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!groups[weekKey]) groups[weekKey] = [];
    groups[weekKey].push(workout);
  });
  
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([weekStart, workouts]) => ({
      weekStart,
      weekLabel: new Date(weekStart).toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short' 
      }) + ' - ' + new Date(new Date(weekStart).getTime() + 6 * 86400000).toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'short' 
      }),
      workouts: workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }));
};

export default function Home() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartRef = useRef<number | null>(null);

  const loadWorkouts = useCallback(async () => {
    try {
      const rows = await listWorkouts<Workout>();
      setWorkouts(rows.reverse());
    } catch (error) {
      console.error('Load workouts error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handlePullRefresh = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      pullStartRef.current = e.touches[0].clientY;
    }
  };

  const handlePullMove = (e: React.TouchEvent) => {
    if (pullStartRef.current !== null && window.scrollY === 0) {
      const pullDistance = e.touches[0].clientY - pullStartRef.current;
      if (pullDistance > 80) {
        setRefreshing(true);
        loadWorkouts();
        pullStartRef.current = null;
      }
    }
  };

  const handlePullEnd = () => {
    pullStartRef.current = null;
  };

  const createWorkout = async (name?: string, templateExercises?: string[]) => {
    const workoutName = name || newWorkoutName.trim();
    if (!workoutName) return;
    
    try {
      const workout: Workout = {
        id: generateId(),
        name: workoutName,
        date: new Date().toISOString().split('T')[0],
        exercises: templateExercises
          ? templateExercises.map((exName, index) => ({
              name: exName,
              sets: [{ weight: 0, reps: 10 }],
              order: index,
            }))
          : [],
      };
      await putWorkout(workout);
      setWorkouts([workout, ...workouts]);
      setShowModal(false);
      setShowTemplateModal(false);
      setNewWorkoutName('');
      router.push(`/workout?id=${workout.id}`);
    } catch (error) {
      console.error('Create workout error:', error);
    }
  };

  const createFromTemplate = (template: typeof WORKOUT_TEMPLATES[0]) => {
    createWorkout(template.name, template.exercises);
  };

  const duplicateWorkout = async (id: string) => {
    setDuplicatingId(id);
    try {
      const workout = workouts.find(w => w.id === id);
      if (!workout) return;

      const newWorkout: Workout = {
        ...workout,
        id: generateId(),
        date: new Date().toISOString().split('T')[0],
      };
      await putWorkout(newWorkout);
      setWorkouts([newWorkout, ...workouts]);
      router.push(`/workout?id=${newWorkout.id}`);
    } catch (error) {
      console.error('Duplicate workout error:', error);
    } finally {
      setDuplicatingId(null);
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      await deleteWorkoutFromDb(id);
      setWorkouts(workouts.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Delete workout error:', error);
    }
  };

  const streak = calculateStreak(workouts);
  const lastWorkout = workouts[0];
  const groupedWorkouts = groupWorkoutsByWeek(workouts);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-10)' }}>
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ width: '400px', height: '200px', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-6)' }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="container" 
      style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-10)', minHeight: '100vh' }}
      onTouchStart={handlePullRefresh}
      onTouchMove={handlePullMove}
      onTouchEnd={handlePullEnd}
    >
      {/* Header with Streak */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 'var(--space-8)', 
        flexWrap: 'wrap', 
        gap: 'var(--space-4)' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', margin: 0 }}>
              Palestra Progressi
            </h1>
            {streak > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-1)', 
                padding: 'var(--space-1) var(--space-3)', 
                background: 'var(--color-accent-100)', 
                color: 'var(--color-accent-700)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
              }}>
                <Flame size={14} aria-hidden="true" />
                <span>{streak} giorni di fila</span>
              </div>
            )}
          </div>
          <p style={{ color: 'var(--color-text-tertiary)', margin: 0 }}>
            Traccia i tuoi allenamenti, monitora i progressi
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <ThemeToggle />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowTemplateModal(true)}
              leftIcon={<Zap size={16} />}
            >
              Da Template
            </Button>
            <Button 
              onClick={() => setShowModal(true)} 
              leftIcon={<Plus size={16} />}
            >
              Nuovo Allenamento
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Continue Card */}
      {lastWorkout && (
        <Card 
          variant="elevated" 
          padding="md" 
          onClick={() => router.push(`/workout?id=${lastWorkout.id}`)}
          style={{ 
            cursor: 'pointer', 
            marginBottom: 'var(--space-6)',
            borderLeft: '4px solid var(--color-brand-500)',
            transition: 'all var(--duration-fast) var(--ease-out)',
          }}
        >
          <CardHeader
            title="Continua l'ultimo allenamento"
            subtitle={formatDate(lastWorkout.date)}
            action={
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/workout?id=${lastWorkout.id}`); }}>
                <ArrowRight size={16} aria-hidden="true" />
                Apri
              </Button>
            }
          />
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-brand-600)', fontWeight: 'var(--font-medium)' }}>
                <BarChart2 size={16} aria-hidden="true" />
                <span>{getWorkoutStats(lastWorkout).totalVolume.toLocaleString()} kg volume</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-text-tertiary)' }}>
                <Dumbbell size={16} aria-hidden="true" />
                <span>{lastWorkout.exercises.length} esercizi</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-text-tertiary)' }}>
                <Clock size={16} aria-hidden="true" />
                <span>{getWorkoutStats(lastWorkout).totalSets} serie</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {workouts.length === 0 ? (
        <Card variant="outlined" padding="xl" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: 'var(--color-brand-100)', 
            color: 'var(--color-brand-600)',
            marginBottom: 'var(--space-6)' 
          }}>
            <Dumbbell size={48} aria-hidden="true" />
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
            Nessun allenamento registrato
          </h2>
          <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-6)' }}>
            Inizia il tuo percorso di fitness creando il primo allenamento.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="lg" onClick={() => setShowModal(true)} leftIcon={<Plus size={18} />}>
              Crea Allenamento Personalizzato
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setShowTemplateModal(true)} leftIcon={<Zap size={18} />}>
              Usa un Template
            </Button>
          </div>
        </Card>
      ) : (
        /* Workout List Grouped by Week */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {groupedWorkouts.map(({ weekStart, weekLabel, workouts: weekWorkouts }) => (
            <div key={weekStart} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-3)',
                padding: '0 var(--space-2)',
              }}>
                <div style={{ 
                  flex: 1, 
                  height: '1px', 
                  background: 'var(--color-border-primary)' 
                }} />
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-medium)', 
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Settimana {weekLabel}
                </span>
                <div style={{ 
                  flex: 1, 
                  height: '1px', 
                  background: 'var(--color-border-primary)' 
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
{weekWorkouts.map((workout) => {
                  const stats = getWorkoutStats(workout);
                  const volumeProgress = Math.min(stats.totalVolume / 50000, 1);
                  const isLast = workout.id === lastWorkout?.id;
                  
                  return (
                    <SwipeableWorkoutCard
                      key={workout.id}
                      workout={workout}
                      stats={stats}
                      volumeProgress={volumeProgress}
                      isLast={isLast}
                      onOpen={() => router.push(`/workout?id=${workout.id}`)}
                      onDuplicate={() => duplicateWorkout(workout.id)}
                      onDelete={() => setDeleteConfirmId(workout.id)}
                      isDuplicating={duplicatingId === workout.id}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Workout Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuovo Allenamento"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Nome allenamento"
            placeholder="es. Push Day, Leg Day, Full Body..."
            value={newWorkoutName}
            onChange={(e) => setNewWorkoutName(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annulla</Button>
            <Button onClick={() => createWorkout()} disabled={!newWorkoutName.trim()}>
              Crea
            </Button>
          </div>
        </div>
      </Modal>

      {/* Template Selection Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Scegli un Template"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {WORKOUT_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              variant="outlined"
              padding="md"
              onClick={() => createFromTemplate(template)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '48px', 
                height: '48px', 
                borderRadius: 'var(--radius-lg)', 
                background: 'var(--color-brand-100)', 
                color: 'var(--color-brand-600)',
                flexShrink: 0,
              }}>
                <Dumbbell size={24} aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>{template.name}</h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                  {template.exercises.length} esercizi • {template.exercises.slice(0, 3).join(', ')}{template.exercises.length > 3 ? '...' : ''}
                </p>
              </div>
              <ArrowRight size={20} color="var(--color-text-tertiary)" aria-hidden="true" />
            </Card>
          ))}
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)} style={{ marginTop: 'var(--space-2)' }}>
            Annulla
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => { deleteWorkout(deleteConfirmId!); setDeleteConfirmId(null); }}
        title="Eliminare allenamento?"
        message="Questa azione non può essere annullata. Tutti i dati dell'allenamento verranno persi definitivamente."
        confirmText="Elimina"
        cancelText="Annulla"
        variant="danger"
      />
    </div>
  );
}

function SwipeableWorkoutCard({
  workout,
  stats,
  volumeProgress,
  isLast,
  onOpen,
  onDuplicate,
  onDelete,
  isDuplicating,
}: {
  workout: Workout;
  stats: ReturnType<typeof getWorkoutStats>;
  volumeProgress: number;
  isLast: boolean;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isDuplicating: boolean;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const absDeltaX = Math.abs(deltaX);
    
    if (absDeltaX > 10) {
      e.preventDefault();
      const clampedX = Math.max(-100, Math.min(100, deltaX));
      setSwipeX(clampedX);
      setSwipeDirection(deltaX < 0 ? 'left' : 'right');
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeX) > 60) {
      if (swipeDirection === 'left') {
        onDelete();
      } else if (swipeDirection === 'right') {
        onDuplicate();
      }
    }
    setSwipeX(0);
    setSwipeDirection(null);
    startXRef.current = null;
  };

  const handleClick = () => {
    if (Math.abs(swipeX) < 10) {
      onOpen();
    }
  };

  const renderSwipeAction = (direction: 'left' | 'right') => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [direction === 'left' ? 'right' : 'left']: 0,
        width: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: direction === 'left' ? 'flex-end' : 'flex-start',
        padding: '0 var(--space-4)',
        background: direction === 'left' ? 'var(--color-status-error)' : 'var(--color-brand-500)',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        opacity: Math.min(Math.abs(swipeX) / 60, 1),
      }}
    >
      {direction === 'left' ? (
        <>
          <Trash2 size={24} aria-hidden="true" />
          <span style={{ marginLeft: 'var(--space-2)', fontWeight: 'var(--font-medium)' }}>Elimina</span>
        </>
      ) : (
        <>
          <span style={{ marginRight: 'var(--space-2)', fontWeight: 'var(--font-medium)' }}>{isDuplicating ? 'Creando...' : 'Duplica'}</span>
          <Copy size={24} aria-hidden="true" />
        </>
      )}
    </div>
  );

  return (
    <div ref={cardRef} style={{ position: 'relative', overflow: 'hidden' }}>
      {swipeX !== 0 && (
        <>
          {swipeX < 0 && renderSwipeAction('left')}
          {swipeX > 0 && renderSwipeAction('right')}
        </>
      )}
      <Card
        variant="default"
        padding="md"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: 'pointer',
          transition: 'transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
          transform: `translateX(${swipeX}px)`,
          borderLeft: `4px solid ${volumeProgress > 0.7 ? 'var(--color-brand-500)' : volumeProgress > 0.4 ? 'var(--color-accent-500)' : 'var(--color-border-primary)'}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', margin: 0 }}>
                {workout.name}
              </h3>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                {formatDate(workout.date)}
              </span>
              {isLast && (
                <span style={{ 
                  fontSize: 'var(--text-xs)', 
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-brand-600)',
                  background: 'var(--color-brand-100)',
                  padding: '2px var(--space-2)',
                  borderRadius: 'var(--radius-pill)',
                }}>
                  <CheckCircle size={10} aria-hidden="true" style={{ marginRight: '2px', verticalAlign: 'middle' }} />
                  Ultimo
                </span>
              )}
            </div>
            
            {/* Volume Progress Bar */}
            <div style={{ 
              height: '6px', 
              background: 'var(--color-bg-tertiary)', 
              borderRadius: 'var(--radius-full)', 
              overflow: 'hidden',
              marginBottom: 'var(--space-2)',
            }}>
              <div style={{
                width: `${volumeProgress * 100}%`,
                height: '100%',
                background: volumeProgress > 0.7 ? 'var(--color-brand-500)' : volumeProgress > 0.4 ? 'var(--color-accent-500)' : 'var(--color-border-primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width var(--duration-slow) var(--ease-out)',
              }} />
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Dumbbell size={14} aria-hidden="true" />
                {stats.exerciseCount} esercizi
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <RotateCcw size={14} aria-hidden="true" />
                {stats.totalSets} serie
              </span>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-1)',
                color: 'var(--color-brand-600)', 
                fontWeight: 'var(--font-medium)' 
              }}>
                <BarChart2 size={14} aria-hidden="true" />
                {stats.totalVolume.toLocaleString()} kg
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flexShrink: 0 }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              style={{ minWidth: '80px' }}
            >
              Apri
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}