import { useCallback, useEffect, useRef, useState } from 'react'
import { getWorkout, getExercise } from './data/workouts.js'
import {
  isStorageSupported,
  getAllSessions,
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  saveSession,
  clearSampleSessions,
  makeId
} from './storage/database.js'
import { buildSampleSessions } from './data/sampleData.js'
import { toDateKey } from './utils/dates.js'
import BottomNavigation from './components/BottomNavigation.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WorkoutHome from './pages/WorkoutHome.jsx'
import ActiveWorkout from './pages/ActiveWorkout.jsx'
import History from './pages/History.jsx'
import Progress from './pages/Progress.jsx'

function buildDraft(workoutId, today) {
  const workout = getWorkout(workoutId)
  return {
    id: makeId(),
    date: toDateKey(today),
    workoutId,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    stage: 'exercises',
    exercises: workout.exercises.map((exerciseId) => {
      const exercise = getExercise(exerciseId)
      return {
        exerciseId,
        sets: Array.from({ length: exercise.targetSets }, (_, i) => ({
          setNumber: i + 1,
          weight: '',
          reps: '',
          duration: '',
          completed: false,
          timestamp: null
        }))
      }
    }),
    cardio: { ...workout.cardio, status: null }
  }
}

// Strip a draft down to the permanent WorkoutSession record.
function draftToSession(draft) {
  return {
    id: draft.id,
    date: draft.date,
    workoutId: draft.workoutId,
    completed: true,
    startedAt: draft.startedAt,
    savedAt: new Date().toISOString(),
    exercises: draft.exercises
      .map((log) => ({
        exerciseId: log.exerciseId,
        sets: log.sets.filter((s) => s.completed)
      }))
      .filter((log) => log.sets.length > 0),
    cardio: draft.cardio
  }
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState(null)
  const [sessions, setSessions] = useState([])
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [today, setToday] = useState(() => new Date())
  const persistTimer = useRef(null)

  // Keep "today" fresh if the app stays open across midnight or is
  // brought back from the background.
  useEffect(() => {
    const refresh = () => setToday(new Date())
    const interval = setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const reloadSessions = useCallback(async () => {
    const all = await getAllSessions()
    setSessions(all)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!isStorageSupported()) {
        setStorageError(
          'This browser does not support offline storage (IndexedDB), so workouts cannot be saved. The schedule is still available below.'
        )
        setLoading(false)
        return
      }
      try {
        const [all, activeDraft] = await Promise.all([getAllSessions(), getActiveSession()])
        if (cancelled) return
        setSessions(all)
        if (activeDraft) setDraft(activeDraft)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setStorageError(
            'Could not open the local database. Workout logging is unavailable, but the schedule is still shown. Try reloading, and make sure private-browsing storage limits are not blocking the app.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  // Persist the draft (debounced) on every change so entered values
  // survive refreshes, navigation, and closed tabs.
  const updateDraft = useCallback((next) => {
    setDraft(next)
    clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      saveActiveSession(next).catch((err) => console.error('Failed to persist draft', err))
    }, 250)
  }, [])

  const startWorkout = useCallback(
    (workoutId) => {
      const fresh = buildDraft(workoutId, today)
      setDraft(fresh)
      saveActiveSession(fresh).catch((err) => console.error('Failed to persist draft', err))
      setTab('workout')
      window.scrollTo({ top: 0 })
    },
    [today]
  )

  const discardWorkout = useCallback(() => {
    setDraft(null)
    clearActiveSession().catch((err) => console.error(err))
    setTab('home')
  }, [])

  const saveWorkoutSession = useCallback(
    async (finishedDraft) => {
      clearTimeout(persistTimer.current)
      const session = draftToSession(finishedDraft)
      await saveSession(session)
      await clearActiveSession()
      setDraft(null)
      await reloadSessions()
    },
    [reloadSessions]
  )

  const loadSamples = useCallback(async () => {
    setBusy(true)
    try {
      for (const session of buildSampleSessions(today)) {
        await saveSession(session)
      }
      await reloadSessions()
    } catch (err) {
      console.error(err)
    } finally {
      setBusy(false)
    }
  }, [reloadSessions, today])

  const clearSamples = useCallback(async () => {
    setBusy(true)
    try {
      await clearSampleSessions()
      await reloadSessions()
    } catch (err) {
      console.error(err)
    } finally {
      setBusy(false)
    }
  }, [reloadSessions])

  let content
  if (loading) {
    content = (
      <div className="loading-screen">
        <div className="spinner" />
        Loading your training data…
      </div>
    )
  } else if (tab === 'home') {
    content = (
      <>
        {storageError && <div className="error-box">{storageError}</div>}
        <Dashboard
          today={today}
          sessions={sessions}
          draft={draft}
          onStartWorkout={startWorkout}
          onResume={() => setTab('workout')}
        />
      </>
    )
  } else if (tab === 'workout') {
    content = draft ? (
      <ActiveWorkout
        draft={draft}
        today={today}
        onUpdateDraft={updateDraft}
        onSaveSession={saveWorkoutSession}
        onDiscard={discardWorkout}
        onExit={() => setTab('home')}
      />
    ) : (
      <WorkoutHome today={today} onStartWorkout={startWorkout} />
    )
  } else if (tab === 'history') {
    content = (
      <History
        sessions={sessions}
        onLoadSamples={loadSamples}
        onClearSamples={clearSamples}
        busy={busy}
      />
    )
  } else {
    content = <Progress sessions={sessions} />
  }

  return (
    <div className="app-frame">
      <main className="app-content">{content}</main>
      <BottomNavigation
        activeTab={tab}
        onNavigate={(next) => {
          setTab(next)
          window.scrollTo({ top: 0 })
        }}
      />
    </div>
  )
}
