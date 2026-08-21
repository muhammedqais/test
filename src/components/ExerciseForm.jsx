import { useState } from 'react'
import { EXERCISE_CATEGORIES } from '../data/workouts.js'

// Create/edit form for an exercise. Returns a plain exercise object
// (without id — the caller decides whether it's new or an override).
export default function ExerciseForm({ initial, title, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [category, setCategory] = useState(initial?.category || 'Other')
  const [type, setType] = useState(initial?.type || 'strength')
  const [targetSets, setTargetSets] = useState(initial?.targetSets ?? 3)
  const [targetReps, setTargetReps] = useState(initial?.targetReps || '10–12')
  const [targetDuration, setTargetDuration] = useState(initial?.targetDuration || '30–45 s')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [instructions, setInstructions] = useState((initial?.instructions || []).join('\n'))

  const valid = name.trim().length > 0 && Number(targetSets) > 0

  const handleSave = () => {
    const exercise = {
      name: name.trim(),
      category,
      type,
      targetSets: Math.max(1, Math.min(10, Number(targetSets) || 3)),
      notes: notes.trim(),
      instructions: instructions
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      illustration: initial?.illustration ?? null
    }
    if (type === 'timed') {
      exercise.targetDuration = targetDuration.trim() || '30 s'
    } else {
      exercise.targetReps = targetReps.trim() || '10'
    }
    onSave(exercise)
  }

  return (
    <div className="card fade-in">
      <div className="eyebrow" style={{ marginBottom: 12 }}>
        {title}
      </div>
      <div className="form-field">
        <label htmlFor="ex-name">Name</label>
        <input
          id="ex-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Goblet Squat"
        />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="ex-cat">Category</label>
          <select id="ex-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXERCISE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="ex-type">Measured in</label>
          <select id="ex-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="strength">Weight × reps</option>
            <option value="timed">Time (seconds)</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="ex-sets">Sets</label>
          <input
            id="ex-sets"
            type="number"
            inputMode="numeric"
            min="1"
            max="10"
            value={targetSets}
            onChange={(e) => setTargetSets(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="ex-target">{type === 'timed' ? 'Target time' : 'Target reps'}</label>
          {type === 'timed' ? (
            <input
              id="ex-target"
              type="text"
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              placeholder="30–45 s"
            />
          ) : (
            <input
              id="ex-target"
              type="text"
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="10–12"
            />
          )}
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="ex-instructions">Instructions (one step per line)</label>
        <textarea
          id="ex-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder={'Set up comfortably.\nMove with control.\nStop if it causes pain.'}
        />
      </div>
      <div className="form-field">
        <label htmlFor="ex-notes">Technique note (optional)</label>
        <input
          id="ex-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Choose a manageable resistance."
        />
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn--primary" disabled={!valid} onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  )
}
