import { useCallback, useEffect, useRef, useState } from 'react'
import { getWorkout, getExercise, applyCatalog } from './data/workouts.js'
import {
  isStorageSupported,
  getAllSessions,
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  saveSession,
  clearSampleSessions,
  getMeta,
  saveMeta,
  makeId
} from './storage/database.js'
import { toDateKey } from './utils/dates.js'
import BottomNavigation from './components/BottomNavigation.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WorkoutHome from './pages/WorkoutHome.jsx'
import ActiveWorkout from './pages/ActiveWorkout.jsx'
import History from './pages/History.jsx'
import Progress from './pages/Progress.jsx'
import DayPlanner from './pages/DayPlanner.jsx'
import Settings from './pages/Settings.jsx'
import WorkoutEditor from './pages/WorkoutEditor.jsx'

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
  const [overlay, setOverlay] = useState(null) // null | {type:'settings'} | {type:'editor', workoutId}
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState(null)
  const [sessions, setSessions] = useState([])
  const [draft, setDraft] = useState(null)
  const [catalog, setCatalog] = useState(null)
  const [settings, setSettings] = useState({})
  const [today, setToday] = useState(() => new Date())
  const persistTimer = useRef(null)

  // The date always comes from the device clock. Refresh it on a timer and
  // the moment the app regains focus or comes back from the background, so
  // the schedule flips at midnight without reopening the app.
  useEffect(() => {
    const refresh = () => setToday(new Date())
    const interval = setInterval(refresh, 30_000)
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const reloadSessions = useCallback(async () => {
    const all = await getAllSessions()
    setSessions(all)
  }, [])

  // Theme: dark by default, light when chosen in Settings. The choice is
  // stamped on <html> for CSS and mirrored into the theme-color meta so
  // the phone's status bar matches.
  useEffect(() => {
    const theme = settings.theme === 'light' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f2f4f7' : '#101318')
  }, [settings.theme])

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
        await clearSampleSessions()
        const [all, activeDraft, storedCatalog, storedSettings] = await Promise.all([
          getAllSessions(),
          getActiveSession(),
          getMeta('catalog'),
          getMeta('settings')
        ])
        if (cancelled) return
        applyCatalog(storedCatalog)
        setCatalog(storedCatalog)
        setSettings(storedSettings || {})
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

  const updateCatalog = useCallback((next) => {
    applyCatalog(next)
    setCatalog(next)
    saveMeta('catalog', next).catch((err) => console.error('Failed to save catalog', err))
  }, [])

  const updateSettings = useCallback((next) => {
    setSettings(next)
    saveMeta('settings', next).catch((err) => console.error('Failed to save settings', err))
  }, [])

  const startWorkout = useCallback(
    (workoutId) => {
      const fresh = buildDraft(workoutId, today)
      setDraft(fresh)
      saveActiveSession(fresh).catch((err) => console.error('Failed to persist draft', err))
      setOverlay(null)
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

  // After a restore, re-read everything the backup may have changed.
  const handleDataChanged = useCallback(async () => {
    const [storedCatalog, storedSettings] = await Promise.all([
      getMeta('catalog'),
      getMeta('settings')
    ])
    applyCatalog(storedCatalog)
    setCatalog(storedCatalog)
    setSettings(storedSettings || {})
    await reloadSessions()
  }, [reloadSessions])

  let content
  if (loading) {
    content = (
      <div className="loading-screen">
        <div className="spinner" />
        Loading your training data…
      </div>
    )
  } else if (overlay?.type === 'settings') {
    content = (
      <Settings
        settings={settings}
        onUpdateSettings={updateSettings}
        onDataChanged={handleDataChanged}
        onBack={() => setOverlay(null)}
      />
    )
  } else if (overlay?.type === 'editor') {
    content = (
      <WorkoutEditor
        workoutId={overlay.workoutId}
        catalog={catalog}
        onUpdateCatalog={updateCatalog}
        onBack={() => setOverlay(null)}
      />
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
          onOpenSettings={() => setOverlay({ type: 'settings' })}
          onEditWorkout={(workoutId) => setOverlay({ type: 'editor', workoutId })}
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
      <WorkoutHome
        today={today}
        onStartWorkout={startWorkout}
        onEditWorkout={(workoutId) => setOverlay({ type: 'editor', workoutId })}
      />
    )
  } else if (tab === 'day') {
    content = <DayPlanner today={today} sessions={sessions} />
  } else if (tab === 'history') {
    content = <History sessions={sessions} />
  } else {
    content = <Progress sessions={sessions} catalog={catalog} />
  }

  return (
    <div className="app-frame">
      <main className="app-content">{content}</main>
      <BottomNavigation
        activeTab={overlay ? null : tab}
        onNavigate={(next) => {
          setOverlay(null)
          setTab(next)
          window.scrollTo({ top: 0 })
        }}
      />
    </div>
  )
}
