import { useState } from 'react'
import { getScheduleForDay, getWorkout, SAFETY_NOTE } from '../data/workouts.js'
import ExerciseCard from '../components/ExerciseCard.jsx'
import ExerciseDetails from './ExerciseDetails.jsx'

// The Workout tab when no session is running: today's plan on training
// days, a recovery card on rest days.
export default function WorkoutHome({ today, onStartWorkout, onEditWorkout }) {
  const [detailId, setDetailId] = useState(null)
  const entry = getScheduleForDay(today.getDay())

  if (detailId) {
    return <ExerciseDetails exerciseId={detailId} onBack={() => setDetailId(null)} />
  }

  if (entry.kind !== 'workout') {
    return (
      <div className="fade-in">
        <h1 className="page-title" style={{ marginBottom: 14 }}>
          {entry.kind === 'rest' ? 'Rest Day' : 'Recovery Day'}
        </h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="rest-icon">{entry.kind === 'rest' ? '🌙' : '🧘'}</div>
          <div className="eyebrow">No scheduled workout today</div>
          <ul className="rest-list" style={{ textAlign: 'left', marginTop: 14 }}>
            {entry.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="card card--muted" style={{ marginTop: 12 }}>
          <p className="empty-note">
            Recovery matters as much as training. Your next workout will appear here
            automatically on its scheduled day.
          </p>
        </div>
      </div>
    )
  }

  const workout = getWorkout(entry.workoutId)

  return (
    <div className="fade-in">
      <div className="eyebrow eyebrow--accent">Today · {entry.dayName}</div>
      <h1 className="page-title" style={{ margin: '4px 0 14px' }}>
        {workout.name}
      </h1>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 4 }}>
          {workout.exercises.length} exercises + cardio · ~ {workout.estimatedTime}
        </div>
        {workout.exercises.map((id, i) => (
          <ExerciseCard key={`${id}-${i}`} exerciseId={id} index={i} onSelect={setDetailId} />
        ))}
        <div className="exercise-row">
          <span className="exercise-row__num">＋</span>
          <span className="exercise-row__name">{workout.cardio.name}</span>
          <span className="exercise-row__target">{workout.cardio.duration}</span>
        </div>
      </div>

      <div className="note-box note-box--safety" style={{ margin: '12px 0 14px' }}>
        {SAFETY_NOTE}
      </div>

      <button
        type="button"
        className="btn btn--primary"
        onClick={() => onStartWorkout(entry.workoutId)}
      >
        Start workout
      </button>
      <button
        type="button"
        className="btn btn--ghost-dark"
        style={{ marginTop: 6 }}
        onClick={() => onEditWorkout(entry.workoutId)}
      >
        Customize this workout
      </button>
    </div>
  )
}
