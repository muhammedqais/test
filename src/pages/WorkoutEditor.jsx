import { useState } from 'react'
import {
  getWorkout,
  getExercise,
  listExercises,
  isBuiltinExercise,
  makeExerciseId
} from '../data/workouts.js'
import ExerciseForm from '../components/ExerciseForm.jsx'

// Customize a workout day: add, edit, remove, and reorder its exercises.
// All changes are written to the catalog customization object owned by App.
export default function WorkoutEditor({ workoutId, catalog, onUpdateCatalog, onBack }) {
  const workout = getWorkout(workoutId)
  const [editingId, setEditingId] = useState(null) // exercise id being edited
  const [creating, setCreating] = useState(false)
  const [addId, setAddId] = useState('')

  if (!workout) {
    return (
      <div className="fade-in">
        <button type="button" className="back-button" onClick={onBack}>
          ← Back
        </button>
        <p className="center-note">This workout no longer exists.</p>
      </div>
    )
  }

  const list = workout.exercises
  const catalogBase = catalog || {}

  const setList = (nextList) => {
    onUpdateCatalog({
      ...catalogBase,
      workoutExercises: { ...(catalogBase.workoutExercises || {}), [workoutId]: nextList }
    })
  }

  const move = (index, delta) => {
    const next = [...list]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setList(next)
  }

  const removeAt = (index) => {
    const exercise = getExercise(list[index])
    if (!window.confirm(`Remove "${exercise.name}" from ${workout.name}? Logged history is kept.`)) {
      return
    }
    setList(list.filter((_, i) => i !== index))
  }

  const addExisting = () => {
    if (!addId) return
    setList([...list, addId])
    setAddId('')
  }

  const saveNew = (exercise) => {
    const id = makeExerciseId(exercise.name)
    onUpdateCatalog({
      ...catalogBase,
      customExercises: {
        ...(catalogBase.customExercises || {}),
        [id]: { ...exercise, id, custom: true }
      },
      workoutExercises: { ...(catalogBase.workoutExercises || {}), [workoutId]: [...list, id] }
    })
    setCreating(false)
  }

  const saveEdit = (exercise) => {
    if (isBuiltinExercise(editingId)) {
      onUpdateCatalog({
        ...catalogBase,
        overrides: { ...(catalogBase.overrides || {}), [editingId]: exercise }
      })
    } else {
      const current = (catalogBase.customExercises || {})[editingId] || {}
      onUpdateCatalog({
        ...catalogBase,
        customExercises: {
          ...(catalogBase.customExercises || {}),
          [editingId]: { ...current, ...exercise, id: editingId, custom: true }
        }
      })
    }
    setEditingId(null)
  }

  const resetOverride = () => {
    const overrides = { ...(catalogBase.overrides || {}) }
    delete overrides[editingId]
    onUpdateCatalog({ ...catalogBase, overrides })
    setEditingId(null)
  }

  if (editingId) {
    const exercise = getExercise(editingId)
    const hasOverride = !!(catalogBase.overrides || {})[editingId]
    return (
      <div className="fade-in">
        <button type="button" className="back-button" onClick={() => setEditingId(null)}>
          ← {workout.name}
        </button>
        <ExerciseForm
          title={`Edit · ${exercise.name}`}
          initial={exercise}
          onSave={saveEdit}
          onCancel={() => setEditingId(null)}
        />
        {isBuiltinExercise(editingId) && hasOverride && (
          <button type="button" className="btn btn--danger-ghost" onClick={resetOverride}>
            Reset to the built-in version
          </button>
        )}
      </div>
    )
  }

  if (creating) {
    return (
      <div className="fade-in">
        <button type="button" className="back-button" onClick={() => setCreating(false)}>
          ← {workout.name}
        </button>
        <ExerciseForm
          title="New exercise"
          onSave={saveNew}
          onCancel={() => setCreating(false)}
        />
      </div>
    )
  }

  const addable = listExercises().filter((e) => !list.includes(e.id))

  return (
    <div className="fade-in">
      <button type="button" className="back-button" onClick={onBack}>
        ← Back
      </button>
      <div className="eyebrow eyebrow--accent">Customize</div>
      <h1 className="page-title" style={{ margin: '4px 0 14px' }}>
        {workout.name}
      </h1>

      <div className="card">
        {list.length === 0 ? (
          <p className="empty-note">No exercises yet — add one below.</p>
        ) : (
          list.map((id, i) => {
            const exercise = getExercise(id)
            const target =
              exercise.type === 'timed'
                ? `${exercise.targetSets} × ${exercise.targetDuration}`
                : `${exercise.targetSets} × ${exercise.targetReps}`
            return (
              <div className="editor-row" key={`${id}-${i}`}>
                <div className="editor-row__name">
                  {exercise.name}
                  <small>
                    {target}
                    {exercise.custom ? ' · custom' : ''}
                  </small>
                </div>
                <button type="button" className="mini-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                  ↑
                </button>
                <button
                  type="button"
                  className="mini-btn"
                  disabled={i === list.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button type="button" className="mini-btn" onClick={() => setEditingId(id)} aria-label="Edit">
                  ✎
                </button>
                <button
                  type="button"
                  className="mini-btn mini-btn--danger"
                  onClick={() => removeAt(i)}
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Add exercise
        </div>
        {addable.length > 0 && (
          <>
            <div className="select-control" style={{ margin: '0 0 10px' }}>
              <select value={addId} onChange={(e) => setAddId(e.target.value)} aria-label="Pick an exercise to add">
                <option value="">Pick from your exercises…</option>
                {addable.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                    {e.custom ? ' (custom)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn--secondary" disabled={!addId} onClick={addExisting}>
              Add to workout
            </button>
          </>
        )}
        <button
          type="button"
          className="btn btn--primary"
          style={{ marginTop: 10 }}
          onClick={() => setCreating(true)}
        >
          ＋ Create new exercise
        </button>
      </div>

      <p className="center-note" style={{ padding: '14px 8px 0' }}>
        Changes apply to future sessions of this workout. Your logged history is never
        modified.
      </p>
    </div>
  )
}
