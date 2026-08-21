// Demo sessions for previewing the History and Progress screens before
// any real training has been logged. Every generated session is flagged
// `sample: true` and shown with a "Sample" badge, so demo records are
// always clearly distinguished from the user's own data.

import { WORKOUTS, EXERCISES } from './workouts.js'
import { toDateKey, getWeekStart } from '../utils/dates.js'
import { makeId } from '../storage/database.js'

const BASE_WEIGHTS = {
  'lat-pulldown': 30,
  'db-incline-press': 8,
  'seated-cable-row': 30,
  'db-lateral-raise': 4,
  'tricep-pushdown': 15,
  'seated-leg-press': 40,
  'hamstring-curl': 20,
  'leg-extension': 15,
  'calf-raise': 20,
  'chest-supported-row': 8,
  'machine-chest-press': 20,
  'db-overhead-press': 6,
  'face-pull': 10,
  'db-bicep-curl': 6,
  'db-rdl': 10,
  'ab-crunch': 20
}

const WORKOUT_DAY_OFFSET = { upperA: 0, lowerA: 1, upperB: 4, lowerB: 5 } // from Monday

export function buildSampleSessions(now = new Date()) {
  const sessions = []
  const thisWeekStart = getWeekStart(now)

  // Three completed past weeks with gentle, believable variation.
  for (let weekAgo = 3; weekAgo >= 1; weekAgo--) {
    for (const workout of Object.values(WORKOUTS)) {
      const date = new Date(thisWeekStart)
      date.setDate(date.getDate() - weekAgo * 7 + WORKOUT_DAY_OFFSET[workout.id])
      const progression = (3 - weekAgo) * 2.5

      const exercises = workout.exercises.map((exerciseId, exIdx) => {
        const exercise = EXERCISES[exerciseId]
        const sets = []
        for (let s = 1; s <= exercise.targetSets; s++) {
          if (exercise.type === 'timed') {
            sets.push({
              setNumber: s,
              weight: null,
              reps: null,
              duration: 30 + (3 - weekAgo) * 5 - (s - 1) * 3,
              completed: true,
              timestamp: date.toISOString()
            })
          } else {
            const base = BASE_WEIGHTS[exerciseId] ?? 10
            sets.push({
              setNumber: s,
              weight: base + progression,
              reps: 12 - (s - 1) - (exIdx % 2),
              duration: null,
              completed: true,
              timestamp: date.toISOString()
            })
          }
        }
        return { exerciseId, sets }
      })

      sessions.push({
        id: `sample-${makeId()}`,
        date: toDateKey(date),
        workoutId: workout.id,
        completed: true,
        sample: true,
        exercises,
        cardio: { ...workout.cardio, status: weekAgo === 2 ? 'skipped' : 'completed' },
        savedAt: date.toISOString()
      })
    }
  }
  return sessions
}
