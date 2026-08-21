// Large touch-friendly set logger. Draft input values live in the
// persisted session draft, so nothing is lost on refresh or navigation.

export default function SetLogger({ exercise, sets, onUpdateSet, onLogSet, onEditSet }) {
  const timed = exercise.type === 'timed'
  const firstOpen = sets.findIndex((s) => !s.completed)

  return (
    <div className="set-logger">
      {sets.map((set, i) => {
        const isActive = i === firstOpen
        if (set.completed) {
          return (
            <div className="set-block set-block--done fade-in" key={set.setNumber}>
              <div className="set-block__header">
                <span className="set-block__title">✓ SET {set.setNumber} COMPLETED</span>
                <button type="button" className="edit-link" onClick={() => onEditSet(i)}>
                  Edit
                </button>
              </div>
              <div className="set-block__done-line">
                <span className="tick">✓</span>
                {timed
                  ? `${set.duration} seconds`
                  : `${set.weight} kg × ${set.reps} reps`}
              </div>
            </div>
          )
        }
        return (
          <div
            className={`set-block ${isActive ? 'set-block--active' : ''}`}
            key={set.setNumber}
          >
            <div className="set-block__header">
              <span className="set-block__title">SET {set.setNumber}</span>
            </div>
            <div className="set-inputs">
              {timed ? (
                <div className="field">
                  <label htmlFor={`dur-${set.setNumber}`}>Duration</label>
                  <div className="field__control">
                    <input
                      id={`dur-${set.setNumber}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      placeholder="30"
                      value={set.duration ?? ''}
                      onChange={(e) => onUpdateSet(i, { duration: e.target.value })}
                    />
                    <span className="field__unit">sec</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label htmlFor={`w-${set.setNumber}`}>Weight</label>
                    <div className="field__control">
                      <input
                        id={`w-${set.setNumber}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.5"
                        placeholder="0.0"
                        value={set.weight ?? ''}
                        onChange={(e) => onUpdateSet(i, { weight: e.target.value })}
                      />
                      <span className="field__unit">kg</span>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor={`r-${set.setNumber}`}>Reps</label>
                    <div className="field__control">
                      <input
                        id={`r-${set.setNumber}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={set.reps ?? ''}
                        onChange={(e) => onUpdateSet(i, { reps: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              className="btn btn--primary"
              disabled={
                timed
                  ? !(Number(set.duration) > 0)
                  : set.weight === '' || set.weight == null || !(Number(set.reps) > 0)
              }
              onClick={() => onLogSet(i)}
            >
              Log set
            </button>
          </div>
        )
      })}
    </div>
  )
}
