import { useEffect, useMemo, useState } from 'react'
import { listExercises, getExercise } from '../data/workouts.js'
import { getExerciseHistory } from '../storage/database.js'
import ProgressChart from '../components/ProgressChart.jsx'
import ExerciseDetails from './ExerciseDetails.jsx'

export default function Progress({ sessions, catalog }) {
  // Recomputed on every render so newly created/edited exercises show up.
  const selectable = listExercises()
  const [exerciseId, setExerciseId] = useState(selectable[0].id)
  const [history, setHistory] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const exercise = getExercise(exerciseId)

  useEffect(() => {
    let cancelled = false
    setHistory(null)
    getExerciseHistory(exerciseId)
      .then((h) => !cancelled && setHistory(h))
      .catch(() => !cancelled && setHistory([]))
    return () => {
      cancelled = true
    }
  }, [exerciseId, sessions])

  const timed = exercise.type === 'timed'

  const weightPoints = useMemo(
    () =>
      (history || []).map((p) => ({
        date: p.date,
        sample: p.sample,
        value: timed ? p.bestDuration : p.topWeight
      })),
    [history, timed]
  )
  const repsPoints = useMemo(
    () =>
      (history || []).map((p) => ({
        date: p.date,
        sample: p.sample,
        value: p.bestReps
      })),
    [history]
  )

  if (showDetails) {
    return <ExerciseDetails exerciseId={exerciseId} onBack={() => setShowDetails(false)} />
  }

  return (
    <div className="fade-in">
      <h1 className="page-title" style={{ marginBottom: 4 }}>
        Progress
      </h1>
      <p style={{ fontSize: 13.5, color: '#9aa3af', marginBottom: 8 }}>
        Pick an exercise to see how your training develops over time.
      </p>

      <div className="select-control">
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          aria-label="Select exercise"
        >
          {selectable.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
              {ex.custom ? ' (custom)' : ''}
            </option>
          ))}
        </select>
      </div>

      {history === null ? (
        <div className="card">
          <p className="empty-note">Loading…</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="rest-icon">📈</div>
          <div className="eyebrow">No data yet</div>
          <p className="empty-note" style={{ marginTop: 10 }}>
            Log this exercise in a workout and your progress will show up here.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="eyebrow">{timed ? 'Duration progress (best set)' : 'Weight progress (top set)'}</div>
            <ProgressChart
              points={weightPoints}
              unit={timed ? 'seconds' : 'kg'}
              emptyLabel={timed ? 'No duration recorded yet.' : 'No weight recorded yet.'}
            />
          </div>
          {!timed && (
            <div className="card">
              <div className="eyebrow">Reps progress (best set)</div>
              <ProgressChart points={repsPoints} unit="reps" color="#16a34a" emptyLabel="No reps recorded yet." />
            </div>
          )}
          <div className="card">
            <div className="summary-stats" style={{ margin: 0 }}>
              <div className="stat-tile">
                <strong>{history.length}</strong>
                <span>sessions</span>
              </div>
              <div className="stat-tile">
                <strong>
                  {timed
                    ? `${Math.max(...weightPoints.map((p) => p.value ?? 0))}s`
                    : `${Math.max(...weightPoints.map((p) => p.value ?? 0))}`}
                </strong>
                <span>{timed ? 'best hold' : 'top weight (kg)'}</span>
              </div>
              <div className="stat-tile">
                <strong>
                  {history.reduce((n, p) => n + p.sets.filter((s) => s.completed).length, 0)}
                </strong>
                <span>total sets</span>
              </div>
            </div>
          </div>
          <button type="button" className="btn btn--ghost-dark" onClick={() => setShowDetails(true)}>
            View exercise details →
          </button>
        </>
      )}
    </div>
  )
}
