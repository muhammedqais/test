import { useRef } from 'react'
import {
  WEEK_SCHEDULE,
  getScheduleForDay,
  getWorkout
} from '../data/workouts.js'
import { formatLongDate, getWeekNumber, getWeekStart, isDateKeyInWeek } from '../utils/dates.js'

function TodayCard({ today, draft, onStartWorkout, onResume, onViewWeek }) {
  const entry = getScheduleForDay(today.getDay())

  if (entry.kind !== 'workout') {
    return (
      <div className="today-card fade-in">
        <div className="eyebrow eyebrow--accent">Today</div>
        <div className="today-card__title">
          {entry.kind === 'rest' ? 'Rest Day' : 'Recovery Day'}
        </div>
        <div className="today-card__meta">
          <span className="chip">No scheduled workout today</span>
        </div>
        <button type="button" className="btn btn--secondary" onClick={onViewWeek}>
          View week
        </button>
      </div>
    )
  }

  const workout = getWorkout(entry.workoutId)
  const resumable = draft && draft.workoutId === entry.workoutId

  return (
    <div className="today-card fade-in">
      <div className="eyebrow eyebrow--accent">Today</div>
      <div className="today-card__title">{workout.name}</div>
      <div className="today-card__meta">
        <span className="chip">{workout.exercises.length} exercises</span>
        <span className="chip">+ Cardio</span>
        <span className="chip">~ {workout.estimatedTime}</span>
      </div>
      {resumable ? (
        <button type="button" className="btn btn--primary" onClick={onResume}>
          Resume workout
        </button>
      ) : (
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onStartWorkout(entry.workoutId)}
        >
          Start workout
        </button>
      )}
      {draft && !resumable && (
        <p style={{ marginTop: 10, fontSize: 13, color: '#9aa3af', textAlign: 'center' }}>
          A {getWorkout(draft.workoutId)?.name} session is still in progress — open the
          Workout tab to finish or discard it.
        </p>
      )}
    </div>
  )
}

function WeekSchedule({ today, sessions, weekListRef }) {
  const weekStart = getWeekStart(today)
  const todayIdx = today.getDay()

  const completedThisWeek = new Set(
    sessions
      .filter((s) => s.completed && !s.sample && isDateKeyInWeek(s.date, weekStart))
      .map((s) => s.workoutId)
  )

  // Render Monday-first
  const ordered = [...WEEK_SCHEDULE.filter((d) => d.day !== 0), getScheduleForDay(0)]

  return (
    <div className="week-list" ref={weekListRef}>
      {ordered.map((entry) => {
        const isToday = entry.day === todayIdx
        const isWorkout = entry.kind === 'workout'
        const workout = isWorkout ? getWorkout(entry.workoutId) : null
        const done = isWorkout && completedThisWeek.has(entry.workoutId)

        let status
        if (!isWorkout) {
          status = <span className="week-row__status week-row__status--rest">—</span>
        } else if (done) {
          status = <span className="week-row__status week-row__status--done">✓</span>
        } else if (isToday) {
          status = <span className="week-row__status week-row__status--today">→</span>
        } else {
          status = <span className="week-row__status week-row__status--upcoming">○</span>
        }

        return (
          <div
            key={entry.day}
            className={`week-row ${isToday ? 'week-row--today' : ''} ${!isWorkout ? 'week-row--rest' : ''}`}
          >
            <span className="week-row__day">{entry.label}</span>
            <span className="week-row__name">
              {isWorkout ? workout.shortName : entry.title}
            </span>
            {status}
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard({ today, sessions, draft, onStartWorkout, onResume }) {
  const weekListRef = useRef(null)
  const entry = getScheduleForDay(today.getDay())

  return (
    <div className="fade-in">
      <header className="app-header">
        <div>
          <div className="app-header__brand">
            MY<span>FITNESS</span>
          </div>
          <div style={{ fontSize: 12, color: '#9aa3af', fontWeight: 600 }}>Tracker</div>
        </div>
        <div className="app-header__meta">
          <strong>{formatLongDate(today)}</strong>
          Week {getWeekNumber(today)}
        </div>
      </header>

      <TodayCard
        today={today}
        draft={draft}
        onStartWorkout={onStartWorkout}
        onResume={onResume}
        onViewWeek={() =>
          weekListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      />

      {entry.kind !== 'workout' && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="eyebrow">{entry.kind === 'rest' ? 'Rest' : 'Active recovery'}</div>
          <ul className="rest-list">
            {entry.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="section-title">This week</h2>
      <WeekSchedule today={today} sessions={sessions} weekListRef={weekListRef} />
    </div>
  )
}
