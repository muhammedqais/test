// IndexedDB persistence layer. Two stores:
//  - sessions: completed WorkoutSession records
//  - active:   the single in-progress session draft (survives refresh/close)

const DB_NAME = 'femurfit-db'
const DB_VERSION = 1
const SESSIONS = 'sessions'
const ACTIVE = 'active'
const ACTIVE_KEY = 'current'

let dbPromise = null

export function isStorageSupported() {
  return typeof indexedDB !== 'undefined'
}

function openDatabase() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (!isStorageSupported()) {
      reject(new Error('IndexedDB is not available in this browser'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(SESSIONS)) {
        const store = db.createObjectStore(SESSIONS, { keyPath: 'id' })
        store.createIndex('date', 'date')
      }
      if (!db.objectStoreNames.contains(ACTIVE)) {
        db.createObjectStore(ACTIVE, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Failed to open database'))
    request.onblocked = () => reject(new Error('Database is blocked by another tab'))
  })
  return dbPromise
}

function tx(db, store, mode, operation) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, mode)
    const request = operation(transaction.objectStore(store))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Database operation failed'))
  })
}

export async function saveSession(session) {
  const db = await openDatabase()
  return tx(db, SESSIONS, 'readwrite', (store) => store.put(session))
}

export async function deleteSession(id) {
  const db = await openDatabase()
  return tx(db, SESSIONS, 'readwrite', (store) => store.delete(id))
}

// All sessions, newest first.
export async function getAllSessions() {
  const db = await openDatabase()
  const sessions = await tx(db, SESSIONS, 'readonly', (store) => store.getAll())
  return sessions.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getSessionById(id) {
  const db = await openDatabase()
  return tx(db, SESSIONS, 'readonly', (store) => store.get(id))
}

export async function saveActiveSession(draft) {
  const db = await openDatabase()
  return tx(db, ACTIVE, 'readwrite', (store) => store.put({ key: ACTIVE_KEY, draft }))
}

export async function getActiveSession() {
  const db = await openDatabase()
  const record = await tx(db, ACTIVE, 'readonly', (store) => store.get(ACTIVE_KEY))
  return record ? record.draft : null
}

export async function clearActiveSession() {
  const db = await openDatabase()
  return tx(db, ACTIVE, 'readwrite', (store) => store.delete(ACTIVE_KEY))
}

// Most recent completed session that logged sets for the given exercise.
// Returns { date, sets, sample } or null.
export async function getLastPerformance(exerciseId, excludeSessionId = null) {
  const sessions = await getAllSessions()
  for (const session of sessions) {
    if (excludeSessionId && session.id === excludeSessionId) continue
    const log = (session.exercises || []).find(
      (e) => e.exerciseId === exerciseId && e.sets && e.sets.length > 0
    )
    if (log) {
      return { date: session.date, sets: log.sets, sample: !!session.sample }
    }
  }
  return null
}

// Chronological (oldest → newest) per-session summary for one exercise,
// used by the progress charts.
export async function getExerciseHistory(exerciseId) {
  const sessions = await getAllSessions()
  const points = []
  for (const session of sessions) {
    const log = (session.exercises || []).find(
      (e) => e.exerciseId === exerciseId && e.sets && e.sets.length > 0
    )
    if (!log) continue
    const weights = log.sets.map((s) => Number(s.weight)).filter((w) => !Number.isNaN(w))
    const reps = log.sets.map((s) => Number(s.reps)).filter((r) => !Number.isNaN(r))
    const durations = log.sets
      .map((s) => Number(s.duration))
      .filter((d) => !Number.isNaN(d) && d > 0)
    points.push({
      date: session.date,
      sample: !!session.sample,
      topWeight: weights.length ? Math.max(...weights) : null,
      bestReps: reps.length ? Math.max(...reps) : null,
      bestDuration: durations.length ? Math.max(...durations) : null,
      sets: log.sets
    })
  }
  return points.reverse()
}

export async function clearSampleSessions() {
  const sessions = await getAllSessions()
  const samples = sessions.filter((s) => s.sample)
  for (const s of samples) {
    await deleteSession(s.id)
  }
  return samples.length
}

export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
