'use client';

import { useState, useEffect, Suspense } from 'react';
import { workoutStore } from '@/data/workoutStore';
import { generateId } from '@/domain/ids';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { SupplementTracker } from '@/components/ui/SupplementTracker';
import { StatCard } from '@/components/charts/Charts';
import { useNotice } from '@/lib/notice';
import { Exercise, COMMON_EXERCISES } from '@/domain/exerciseCatalog';
import { Workout, WorkoutExercise, calculateOneRepMax, calculateVolume } from '@/domain/workout';
import type { Set } from '@/domain/workout';
import { Plus, Trash2, X, ChevronDown, ChevronUp, ArrowLeft, ArrowUp, ArrowDown, Search, Pencil } from 'lucide-react';

type DetailedExercise = WorkoutExercise;
type DetailedWorkout = Workout;

export default function WorkoutDetail() {
  return (
    <Suspense fallback={null}>
      <WorkoutDetailContent />
    </Suspense>
  );
}

function WorkoutDetailContent() {
  const router = useRouter();
  const { showError } = useNotice();
  const searchParams = useSearchParams();
  const workoutId = searchParams.get('id') ?? '';

  const [workout, setWorkout] = useState<DetailedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<DetailedExercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!workoutId) {
      router.push('/');
      return;
    }
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      const workoutData = await workoutStore.get(workoutId);
      if (workoutData) {
        setWorkout(workoutData);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Load workout error:', error);
      showError('Impossibile caricare l\'allenamento.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (updatedWorkout: DetailedWorkout) => {
    try {
      await workoutStore.put(updatedWorkout);
      setWorkout(updatedWorkout);
    } catch (error) {
      console.error('Save workout error:', error);
      showError('Impossibile salvare le modifiche.');
    }
  };

  const toggleSupplement = (supplementId: string) => {
    if (!workout) return;
    const current = workout.supplements ?? {};
    saveWorkout({
      ...workout,
      supplements: { ...current, [supplementId]: !current[supplementId] },
    });
  };

  const handleDeleteWorkout = async () => {
    if (!workout) return;
    try {
      await workoutStore.delete(workout.id);
      router.push('/');
    } catch (error) {
      console.error('Delete workout error:', error);
      showError('Impossibile eliminare l\'allenamento.');
    }
  };

  const addExercise = (exercise: Exercise) => {
    if (!workout) return;
    const newExercise: DetailedExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      exercise,
      sets: [{ id: generateId(), reps: 10, weight: 0, completed: false }],
      order: workout.exercises.length,
    };
    saveWorkout({ ...workout, exercises: [...workout.exercises, newExercise] });
    setShowExerciseModal(false);
  };

  const updateExercise = (updatedExercise: DetailedExercise) => {
    if (!workout) return;
    saveWorkout({
      ...workout,
      exercises: workout.exercises.map((ex) => (ex.id === updatedExercise.id ? updatedExercise : ex)),
    });
    setEditingExercise(null);
  };

  const deleteExercise = (exerciseId: string) => {
    if (!workout) return;
    saveWorkout({
      ...workout,
      exercises: workout.exercises.filter((ex) => ex.id !== exerciseId),
    });
  };

  const addSet = (exerciseId: string) => {
    if (!workout) return;
    saveWorkout({
      ...workout,
      exercises: workout.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { id: generateId(), reps: 10, weight: 0, completed: false }] }
          : ex
      ),
    });
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<Set>) => {
    if (!workout) return;
    saveWorkout({
      ...workout,
      exercises: workout.exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
            }
          : ex
      ),
    });
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    if (!workout) return;
    saveWorkout({
      ...workout,
      exercises: workout.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex
      ),
    });
  };

  const reorderExercises = (fromIndex: number, toIndex: number) => {
    if (!workout) return;
    const exercises = [...workout.exercises];
    const [removed] = exercises.splice(fromIndex, 1);
    exercises.splice(toIndex, 0, removed);
    saveWorkout({
      ...workout,
      exercises: exercises.map((ex, index) => ({ ...ex, order: index })),
    });
  };

  const filteredExercises = COMMON_EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(COMMON_EXERCISES.map((ex) => ex.category))];

  const totalVolume = workout
    ? workout.exercises.reduce((sum, ex) => sum + calculateVolume(ex.sets), 0)
    : 0;

  const completedSets = workout
    ? workout.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0)
    : 0;

  const totalSets = workout
    ? workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
    : 0;

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    );
  }

  if (!workout) return null;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-1)' }}>
            {workout.name}
          </h1>
          <p className="text-muted">
            {new Date(workout.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex-row gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} leftIcon={<ArrowLeft size={16} />}>
            Indietro
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} leftIcon={<Trash2 size={16} />}>
            Elimina
          </Button>
        </div>
      </div>

      {/* Supplement Tracker */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <SupplementTracker intake={workout.supplements ?? {}} onToggle={toggleSupplement} />
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <StatCard label="Volume Totale (kg)" value={totalVolume.toLocaleString()} color="brand" />
        <StatCard label="Serie Completate" value={`${completedSets}/${totalSets}`} color="brand" />
        <StatCard label="Esercizi" value={workout.exercises.length} color="brand" />
      </div>

      {/* Exercise List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>Esercizi</h2>
        <Button onClick={() => setShowExerciseModal(true)} leftIcon={<Plus size={16} />}>
          Aggiungi Esercizio
        </Button>
      </div>

      {workout.exercises.length === 0 ? (
        <Card variant="outlined" padding="lg" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>
            Nessun esercizio aggiunto. Inizia aggiungendo il primo esercizio!
          </p>
          <Button onClick={() => setShowExerciseModal(true)} leftIcon={<Plus size={16} />}>
            Aggiungi Esercizio
          </Button>
        </Card>
      ) : (
        <div className="flex-col gap-3">
          {workout.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              exerciseCount={workout.exercises.length}
              onUpdate={(updates) => updateExercise({ ...exercise, ...updates })}
              onDelete={() => deleteExercise(exercise.id)}
              onAddSet={() => addSet(exercise.id)}
              onUpdateSet={(setId, updates) => updateSet(exercise.id, setId, updates)}
              onDeleteSet={(setId) => deleteSet(exercise.id, setId)}
              onMoveUp={() => reorderExercises(index, index - 1)}
              onMoveDown={() => reorderExercises(index, index + 1)}
              onEdit={() => setEditingExercise(exercise)}
            />
          ))}
        </div>
      )}

      {/* Add Exercise Modal */}
      <Modal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        title="Aggiungi Esercizio"
        size="lg"
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Input
              placeholder="Cerca esercizio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={20} />}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {filteredExercises.map((ex) => (
              <Card
                key={ex.id}
                variant="outlined"
                padding="md"
                onClick={() => addExercise(ex)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>{ex.name}</h4>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <Badge variant="brand" size="sm">{ex.category}</Badge>
                      {ex.equipment && <Badge variant="default" size="sm">{ex.equipment.replace('_', ' ')}</Badge>}
                      {ex.muscleGroups.slice(0, 3).map((mg) => (
                        <Badge key={mg} variant="info" size="sm">{mg.replace('_', ' ')}</Badge>
                      ))}
                    </div>
                  </div>
                  <span className="text-muted">+</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Modal>

      {/* Edit Exercise Modal */}
      {editingExercise && (
        <Modal
          isOpen={!!editingExercise}
          onClose={() => setEditingExercise(null)}
          title={`Modifica: ${editingExercise.exercise.name}`}
          size="lg"
        >
          <ExerciseEditor
            exercise={editingExercise}
            onSave={(updates) => updateExercise({ ...editingExercise, ...updates })}
            onClose={() => setEditingExercise(null)}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => { setShowDeleteConfirm(false); handleDeleteWorkout(); }}
        title="Eliminare l'allenamento?"
        message="L'allenamento e tutti i suoi esercizi verranno eliminati definitivamente."
        confirmText="Elimina"
        variant="danger"
      />
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
  exerciseCount,
  onUpdate,
  onDelete,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onMoveUp,
  onMoveDown,
  onEdit,
}: {
  exercise: DetailedExercise;
  index: number;
  exerciseCount: number;
  onUpdate: (updates: Partial<DetailedExercise>) => void;
  onDelete: () => void;
  onAddSet: () => void;
  onUpdateSet: (setId: string, updates: Partial<Set>) => void;
  onDeleteSet: (setId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const exerciseVolume = calculateVolume(exercise.sets);
  const completedSets = exercise.sets.filter((s) => s.completed).length;

  return (
    <Card variant="default" padding="none">
      <CardHeader
        title={exercise.exercise.name}
        subtitle={`${completedSets}/${exercise.sets.length} serie • ${exerciseVolume.toLocaleString()} kg volume`}
        action={
          <div className="flex-row gap-1">
            <Button variant="ghost" size="sm" onClick={onMoveUp} disabled={index === 0} aria-label="Sposta esercizio su">
              <ArrowUp size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onMoveDown} disabled={index === exerciseCount - 1} aria-label="Sposta esercizio giù">
              <ArrowDown size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Comprimi esercizio' : 'Espandi esercizio'}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Modifica esercizio">
              <Pencil size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Elimina esercizio">
              <Trash2 size={16} />
            </Button>
          </div>
        }
      />
      {expanded && (
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {exercise.sets.map((set, setIndex) => (
              <SetRow
                key={set.id}
                set={set}
                setNumber={setIndex + 1}
                onUpdate={(updates) => onUpdateSet(set.id, updates)}
                onDelete={() => onDeleteSet(set.id)}
              />
            ))}
            <Button variant="secondary" size="sm" onClick={onAddSet} style={{ alignSelf: 'flex-start' }}>
              + Aggiungi Serie
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function SetRow({ set, setNumber, onUpdate, onDelete }: { set: Set; setNumber: number; onUpdate: (updates: Partial<Set>) => void; onDelete: () => void }) {
  const oneRepMax = calculateOneRepMax(set.weight, set.reps);
  const checkboxId = `set-${set.id}-completed`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', padding: 'var(--space-2)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
      <label htmlFor={checkboxId} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '44px', height: '44px' }}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={set.completed}
          onChange={(e) => onUpdate({ completed: e.target.checked })}
          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-brand-600)' }}
        />
        <span className="visually-hidden">Serie {setNumber} completata</span>
      </label>
      <span style={{ fontWeight: 'var(--font-medium)', minWidth: '40px' }}>Serie {setNumber}</span>
      <Input
        type="number"
        inputMode="numeric"
        placeholder="Rip"
        value={set.reps}
        onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0 })}
        style={{ width: '70px' }}
        min={1}
        max={100}
      />
      <span className="text-muted">×</span>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="Peso"
        value={set.weight}
        onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
        style={{ width: '80px' }}
        min={0}
        max={500}
        step={0.5}
      />
      <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>kg</span>
      {oneRepMax > 0 && (
        <Badge variant="info" size="sm">1RM: ~{oneRepMax}kg</Badge>
      )}
      <Button variant="ghost" size="sm" onClick={onDelete} aria-label={`Elimina serie ${setNumber}`} style={{ marginLeft: 'auto' }}>
        <X size={16} />
      </Button>
    </div>
  );
}

function ExerciseEditor({ exercise, onSave, onClose }: { exercise: DetailedExercise; onSave: (updates: Partial<DetailedExercise>) => void; onClose: () => void }) {
  const [sets, setSets] = useState<Set[]>(exercise.sets);

  const handleSetChange = (setId: string, field: keyof Set, value: string | number | boolean) => {
    setSets((prev) => prev.map((s) => (s.id === setId ? { ...s, [field]: value } : s)));
  };

  const addSet = () => {
    setSets((prev) => [...prev, { id: generateId(), reps: 10, weight: 0, completed: false }]);
  };

  const deleteSet = (setId: string) => {
    setSets((prev) => prev.filter((s) => s.id !== setId));
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h4 style={{ marginBottom: 'var(--space-2)' }}>Serie</h4>
        {sets.map((set, index) => (
          <div key={set.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'var(--font-medium)', minWidth: '50px' }}>Serie {index + 1}</span>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Rip"
              value={set.reps}
              onChange={(e) => handleSetChange(set.id, 'reps', parseInt(e.target.value) || 0)}
              style={{ width: '70px' }}
              min={1}
            />
            <span>×</span>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="Peso (kg)"
              value={set.weight}
              onChange={(e) => handleSetChange(set.id, 'weight', parseFloat(e.target.value) || 0)}
              style={{ width: '100px' }}
              min={0}
              step={0.5}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', cursor: 'pointer', minHeight: '44px' }}>
              <input
                type="checkbox"
                checked={set.completed}
                onChange={(e) => handleSetChange(set.id, 'completed', e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-brand-600)' }}
              />
              Completata
            </label>
            <Button variant="ghost" size="sm" onClick={() => deleteSet(set.id)} aria-label={`Elimina serie ${index + 1}`}>
              <X size={16} />
            </Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addSet}>
          + Aggiungi Serie
        </Button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
        <Button variant="secondary" onClick={onClose}>Annulla</Button>
        <Button onClick={() => { onSave({ sets }); onClose(); }}>Salva</Button>
      </div>
    </div>
  );
}