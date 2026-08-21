import { getExercise } from '../data/workouts.js'

// Compact row used in workout previews and summaries.
export default function ExerciseCard({ exerciseId, index, onSelect }) {
  const exercise = getExercise(exerciseId)
  if (!exercise) return null
  const target =
    exercise.type === 'timed'
      ? `${exercise.targetSets} × ${exercise.targetDuration}`
      : `${exercise.targetSets} × ${exercise.targetReps}`
  const content = (
    <>
      <span className="exercise-row__num">{index + 1}</span>
      <span className="exercise-row__name">{exercise.name}</span>
      <span className="exercise-row__target">{target}</span>
    </>
  )
  if (onSelect) {
    return (
      <button
        type="button"
        className="exercise-row"
        style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
        onClick={() => onSelect(exerciseId)}
      >
        {content}
      </button>
    )
  }
  return <div className="exercise-row">{content}</div>
}
