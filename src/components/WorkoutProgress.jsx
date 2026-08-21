export default function WorkoutProgress({ current, total, label }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div>
      <div className="progress-track" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div className="progress-track__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-label">
        <span>{label}</span>
        <span>
          {current}/{total}
        </span>
      </div>
    </div>
  )
}
