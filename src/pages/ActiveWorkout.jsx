import { useEffect, useState } from 'react'
import { getExercise, getWorkout, getNextWorkoutDay } from '../data/workouts.js'
import { getLastPerformance } from '../storage/database.js'
import ExerciseGuide from '../components/ExerciseGuide.jsx'
import SetLogger from '../components/SetLogger.jsx'
import WorkoutProgress from '../components/WorkoutProgress.jsx'
import PreviousPerformance from '../components/PreviousPerformance.jsx'

function ExerciseStage({ draft, workout, onUpdateDraft, onGoToCardio }) {
  const index = draft.currentIndex
  const log = draft.exercises[index]
  const exercise = getExercise(log.exerciseId)
  const total = workout.exercises.length

  const [previous, setPrevious] = useState(undefined) // undefined = loading

  useEffect(() => {
    let cancelled = false
    setPrevious(undefined)
    getLastPerformance(log.exerciseId)
      .then((p) => !cancelled && setPrevious(p))
      .catch(() => !cancelled && setPrevious(null))
    return () => {
      cancelled = true
    }
  }, [log.exerciseId])

  const updateSet = (setIndex, patch) => {
    const next = structuredClone(draft)
    Object.assign(next.exercises[index].sets[setIndex], patch)
    onUpdateDraft(next)
  }

  const logSet = (setIndex) => {
    const next = structuredClone(draft)
    const set = next.exercises[index].sets[setIndex]
    set.completed = true
    set.timestamp = new Date().toISOString()
    if (exercise.type === 'timed') {
      set.duration = Number(set.duration)
      set.weight = null
      set.reps = null
    } else {
      set.weight = Number(set.weight)
      set.reps = Number(set.reps)
      set.duration = null
      // Convenience only: prefill the next empty set's weight with what the
      // user just entered. Never changes anything the user already typed.
      const following = next.exercises[index].sets[setIndex + 1]
      if (following && !following.completed && (following.weight === '' || following.weight == null)) {
        following.weight = set.weight
      }
    }
    onUpdateDraft(next)
  }

  const editSet = (setIndex) => {
    const next = structuredClone(draft)
    next.exercises[index].sets[setIndex].completed = false
    onUpdateDraft(next)
  }

  const goTo = (newIndex) => {
    const next = structuredClone(draft)
    next.currentIndex = newIndex
    onUpdateDraft(next)
    window.scrollTo({ top: 0 })
  }

  const completedExercises = draft.exercises.filter((e) =>
    e.sets.some((s) => s.completed)
  ).length

  const target =
    exercise.type === 'timed'
      ? `${exercise.targetSets} sets × ${exercise.targetDuration}`
      : `${exercise.targetSets} sets × ${exercise.targetReps} reps`

  return (
    <div className="fade-in" key={log.exerciseId + index}>
      <WorkoutProgress
        current={completedExercises}
        total={total}
        label={`Exercise ${index + 1} of ${total}`}
      />

      <div className="card exercise-hero">
        <div className="eyebrow">{exercise.category}</div>
        <h1 className="exercise-hero__name">{exercise.name}</h1>
        <div className="exercise-hero__target">{target}</div>
        <ExerciseGuide illustration={exercise.illustration} label={exercise.name} />
        <ul className="instruction-list">
          {exercise.instructions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {exercise.notes && <div className="note-box">{exercise.notes}</div>}
      </div>

      <div className="card">
        {previous === undefined ? (
          <p className="empty-note">Loading previous session…</p>
        ) : (
          <PreviousPerformance performance={previous} />
        )}
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Log your sets
        </div>
        <SetLogger
          exercise={exercise}
          sets={log.sets}
          onUpdateSet={updateSet}
          onLogSet={logSet}
          onEditSet={editSet}
        />
      </div>

      <div className="btn-row" style={{ marginTop: 14 }}>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
        >
          ← Previous
        </button>
        {index < total - 1 ? (
          <button type="button" className="btn btn--primary" onClick={() => goTo(index + 1)}>
            Next →
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={onGoToCardio}>
            Cardio →
          </button>
        )}
      </div>
    </div>
  )
}

function CardioStage({ draft, workout, onUpdateDraft, onDone, onBack }) {
  const setStatus = (status) => {
    const next = structuredClone(draft)
    next.cardio.status = status
    next.stage = 'summary'
    onUpdateDraft(next)
    onDone()
  }
  return (
    <div className="fade-in">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="eyebrow">Finisher</div>
        <h1 className="exercise-hero__name">Cardio</h1>
        <div className="exercise-hero__target">
          {workout.cardio.duration} · {workout.cardio.name}
        </div>
        <ExerciseGuide illustration={workout.cardio.illustration} label={workout.cardio.name} />
        <p className="empty-note" style={{ marginBottom: 16 }}>
          Keep it low impact and comfortable. Stop if movement causes pain.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" className="btn btn--success" onClick={() => setStatus('completed')}>
            ✓ Cardio completed
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => setStatus('skipped')}>
            Skip cardio
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            ← Back to exercises
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryStage({ draft, workout, onSave, onBack, saving, error }) {
  const [showDetails, setShowDetails] = useState(false)
  const exercisesCompleted = draft.exercises.filter((e) => e.sets.some((s) => s.completed)).length
  const setsLogged = draft.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.completed).length,
    0
  )

  return (
    <div className="fade-in">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="big-check">✓</div>
        <div className="eyebrow">Workout complete</div>
        <h1 className="exercise-hero__name">{workout.name}</h1>
        <div className="summary-stats">
          <div className="stat-tile">
            <strong>{exercisesCompleted}</strong>
            <span>exercises</span>
          </div>
          <div className="stat-tile">
            <strong>{setsLogged}</strong>
            <span>sets logged</span>
          </div>
          <div className="stat-tile">
            <strong>{draft.cardio.status === 'completed' ? '✓' : '—'}</strong>
            <span>cardio {draft.cardio.status === 'completed' ? 'done' : 'skipped'}</span>
          </div>
        </div>
        {error && <div className="error-box">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" className="btn btn--primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save workout'}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? 'Hide summary' : 'View summary'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="card fade-in">
          {draft.exercises.map((log) => {
            const exercise = getExercise(log.exerciseId)
            const done = log.sets.filter((s) => s.completed)
            return (
              <div className="detail-exercise" key={log.exerciseId}>
                <h3>{exercise.name}</h3>
                {done.length === 0 ? (
                  <p className="empty-note">No sets logged.</p>
                ) : (
                  <div className="prev-table">
                    {done.map((s) => (
                      <div className="prev-row" key={s.setNumber}>
                        <span>Set {s.setNumber}</span>
                        <strong>
                          {s.duration != null && s.duration !== ''
                            ? `${s.duration} s`
                            : `${s.weight} kg × ${s.reps}`}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SavedStage({ workout, today, onDone }) {
  const next = getNextWorkoutDay(today.getDay())
  const nextWorkout = next ? getWorkout(next.workoutId) : null
  return (
    <div className="fade-in">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="big-check">✓</div>
        <h1 className="exercise-hero__name">Workout saved</h1>
        <p className="empty-note" style={{ marginBottom: 16 }}>
          Great work.
        </p>
        {nextWorkout && (
          <div className="card card--muted card--flat" style={{ marginBottom: 16, textAlign: 'left' }}>
            <div className="eyebrow">Next workout</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{nextWorkout.name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
              {next.dayName}
            </div>
          </div>
        )}
        <button type="button" className="btn btn--primary" onClick={onDone}>
          Back to home
        </button>
      </div>
    </div>
  )
}

export default function ActiveWorkout({ draft, today, onUpdateDraft, onSaveSession, onDiscard, onExit }) {
  const workout = getWorkout(draft.workoutId)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  const setStage = (stage) => {
    const next = structuredClone(draft)
    next.stage = stage
    onUpdateDraft(next)
    window.scrollTo({ top: 0 })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await onSaveSession(draft)
      setSaved(true)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setSaveError(
        'Could not save the workout. Your entries are still stored locally — please try again.'
      )
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return <SavedStage workout={workout} today={today} onDone={onExit} />
  }

  return (
    <div>
      <div className="workout-topbar">
        <span className="workout-topbar__title">{workout.name}</span>
        <button
          type="button"
          className="btn btn--danger-ghost btn--compact"
          style={{ width: 'auto', padding: '0 10px' }}
          onClick={() => {
            if (window.confirm('Discard this workout? Logged sets will be lost.')) {
              onDiscard()
            }
          }}
        >
          Discard
        </button>
      </div>

      {draft.stage === 'cardio' ? (
        <CardioStage
          draft={draft}
          workout={workout}
          onUpdateDraft={onUpdateDraft}
          onDone={() => window.scrollTo({ top: 0 })}
          onBack={() => setStage('exercises')}
        />
      ) : draft.stage === 'summary' ? (
        <SummaryStage
          draft={draft}
          workout={workout}
          onSave={handleSave}
          onBack={() => setStage('cardio')}
          saving={saving}
          error={saveError}
        />
      ) : (
        <ExerciseStage
          draft={draft}
          workout={workout}
          onUpdateDraft={onUpdateDraft}
          onGoToCardio={() => setStage('cardio')}
        />
      )}
    </div>
  )
}
