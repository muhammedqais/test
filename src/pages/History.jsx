import { useState } from 'react'
import { getExercise, getWorkout } from '../data/workouts.js'
import { formatShortDate } from '../utils/dates.js'

function SessionDetail({ session, onBack }) {
  const workout = getWorkout(session.workoutId)
  return (
    <div className="fade-in">
      <button type="button" className="back-button" onClick={onBack}>
        ← History
      </button>
      <div className="eyebrow">{formatShortDate(session.date)}</div>
      <h1 className="page-title" style={{ margin: '4px 0 14px' }}>
        {workout ? workout.name : session.workoutId}
        {session.sample && (
          <>
            {' '}
            <span className="chip chip--sample">Sample</span>
          </>
        )}
      </h1>
      <div className="card">
        {session.exercises.map((log) => {
          const exercise = getExercise(log.exerciseId)
          const done = log.sets.filter((s) => s.completed)
          if (done.length === 0) return null
          return (
            <div className="detail-exercise" key={log.exerciseId}>
              <h3>{exercise ? exercise.name : log.exerciseId}</h3>
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
            </div>
          )
        })}
        {session.cardio && (
          <div className="detail-exercise">
            <h3>Cardio</h3>
            <div className="prev-table">
              <div className="prev-row">
                <span>{session.cardio.name}</span>
                <strong>{session.cardio.status === 'completed' ? '✓ Done' : 'Skipped'}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function History({ sessions, onLoadSamples, onClearSamples, busy }) {
  const [selectedId, setSelectedId] = useState(null)
  const selected = sessions.find((s) => s.id === selectedId)
  const hasSamples = sessions.some((s) => s.sample)

  if (selected) {
    return <SessionDetail session={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="fade-in">
      <h1 className="page-title" style={{ marginBottom: 14 }}>
        History
      </h1>

      {sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="rest-icon">📓</div>
          <div className="eyebrow">No workouts yet</div>
          <p className="empty-note" style={{ margin: '10px 0 16px' }}>
            Completed workouts will appear here. Finish your first session, or load
            clearly-marked sample data to preview this screen.
          </p>
          <button type="button" className="btn btn--secondary" onClick={onLoadSamples} disabled={busy}>
            {busy ? 'Loading…' : 'Load sample data'}
          </button>
        </div>
      ) : (
        <>
          {sessions.map((session) => {
            const workout = getWorkout(session.workoutId)
            const setCount = session.exercises.reduce(
              (n, e) => n + e.sets.filter((s) => s.completed).length,
              0
            )
            return (
              <button
                type="button"
                key={session.id}
                className="card history-item"
                onClick={() => setSelectedId(session.id)}
              >
                <div className="history-item__row">
                  <div>
                    <div className="eyebrow">
                      {formatShortDate(session.date)}
                      {session.sample && (
                        <>
                          {' '}
                          <span className="chip chip--sample">Sample</span>
                        </>
                      )}
                    </div>
                    <div className="history-item__title">
                      {workout ? workout.name : session.workoutId}
                    </div>
                    <div className="history-item__meta">
                      {session.exercises.filter((e) => e.sets.some((s) => s.completed)).length}{' '}
                      exercises · {setCount} sets
                      {session.cardio?.status === 'completed' ? ' · cardio ✓' : ''}
                    </div>
                  </div>
                  <span style={{ color: 'var(--neutral)', fontSize: 20 }}>›</span>
                </div>
              </button>
            )
          })}
          {hasSamples && (
            <button
              type="button"
              className="btn btn--danger-ghost"
              onClick={onClearSamples}
              disabled={busy}
            >
              Remove sample data
            </button>
          )}
        </>
      )}
    </div>
  )
}
