import { formatDayMonth } from '../utils/dates.js'

// Minimal, mobile-readable SVG line chart: one metric over sessions.
export default function ProgressChart({ points, unit, color = '#2563eb', emptyLabel }) {
  const valid = points.filter((p) => p.value != null && !Number.isNaN(p.value))
  if (valid.length === 0) {
    return <p className="empty-note">{emptyLabel || 'No data recorded yet.'}</p>
  }

  const W = 320
  const H = 170
  const pad = { top: 18, right: 18, bottom: 34, left: 40 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const values = valid.map((p) => p.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const yMax = max + span * 0.15
  const yMin = Math.max(0, min - span * 0.15)

  const x = (i) =>
    pad.left + (valid.length === 1 ? innerW / 2 : (i / (valid.length - 1)) * innerW)
  const y = (v) => pad.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH

  const path = valid
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(' ')

  const gridLines = [0, 0.5, 1].map((t) => yMin + t * (yMax - yMin))
  const labelEvery = Math.max(1, Math.ceil(valid.length / 4))

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Chart, ${unit} over sessions`}>
        {gridLines.map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              x2={W - pad.right}
              y1={y(v)}
              y2={y(v)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text x={pad.left - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {Math.round(v * 10) / 10}
            </text>
          </g>
        ))}
        {valid.length > 1 && (
          <path
            d={`${path} L ${x(valid.length - 1)} ${y(yMin)} L ${x(0)} ${y(yMin)} Z`}
            fill={color}
            opacity="0.08"
          />
        )}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {valid.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r="4.5" fill="#fff" stroke={color} strokeWidth="2.5" />
        ))}
        {valid.map((p, i) =>
          i % labelEvery === 0 || i === valid.length - 1 ? (
            <text
              key={`l${i}`}
              x={x(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
            >
              {formatDayMonth(p.date)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  )
}
