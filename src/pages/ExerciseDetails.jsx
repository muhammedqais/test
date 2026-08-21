import { useEffect, useState } from 'react'
import { getExercise } from '../data/workouts.js'
import { getExerciseHistory } from '../storage/database.js'
import ExerciseGuide from '../components/ExerciseGuide.jsx'
import { formatShortDate } from '../utils/dates.js'

export default function ExerciseDetails({ exerciseId, onBack }) {
  const exercise = getExercise(exerciseId)
  const [history, setHistory] = useState(null)

  useEffect(() => {
    let cancelled = false
    getExerciseHistory(exerciseId)
      .then((h) => !cancelled && setHistory(h))
      .catch(() => !cancelled && setHistory([]))
    return () => {
      cancelled = true
    }
  }, [exerciseId])

  if (!exercise) return null

  const target =
    exercise.type === 'timed'
      ? `${exercise.targetSets} sets × ${exercise.targetDuration}`
      : `${exercise.targetSets} sets × ${exercise.targetReps} reps`

  return (
    <div className="fade-in">
      <button type="button" className="back-button" onClick={onBack}>
        ← Back
      </button>
      <div className="card">
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
        <div className="eyebrow">Recent sessions</div>
        {history === null ? (
          <p className="empty-note">Loading…</p>
        ) : history.length === 0 ? (
          <p className="empty-note">
            No previous data. This is your first recorded session.
          </p>
        ) : (
          [...history]
            .reverse()
            .slice(0, 5)
            .map((point) => (
              <div className="detail-exercise" key={point.date}>
                <h3>
                  {formatShortDate(point.date)}
                  {point.sample && (
                    <>
                      {' '}
                      <span className="chip chip--sample">Sample</span>
                    </>
                  )}
                </h3>
                <div className="prev-table">
                  {point.sets.map((s) => (
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
              </div>
            ))
        )}
      </div>
    </div>
  )
}
