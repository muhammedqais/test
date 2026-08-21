import { formatDayMonth } from '../utils/dates.js'

function formatSet(set) {
  if (set.duration != null && set.duration !== '') {
    return `${set.duration} s`
  }
  const weight = set.weight != null && set.weight !== '' ? `${set.weight} kg` : '—'
  return `${weight} × ${set.reps ?? '—'}`
}

export default function PreviousPerformance({ performance }) {
  if (!performance) {
    return (
      <div>
        <div className="eyebrow">Previous session</div>
        <p className="empty-note">
          No previous data.
          <br />
          This is your first recorded session.
        </p>
      </div>
    )
  }
  return (
    <div>
      <div className="eyebrow">
        Previous session · {formatDayMonth(performance.date)}
        {performance.sample && (
          <>
            {' '}
            <span className="chip chip--sample">Sample</span>
          </>
        )}
      </div>
      <div className="prev-table">
        {performance.sets.map((set) => (
          <div className="prev-row" key={set.setNumber}>
            <span>Set {set.setNumber}</span>
            <strong>{formatSet(set)}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
