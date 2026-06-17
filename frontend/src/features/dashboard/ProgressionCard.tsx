import type { Progression } from '../../types/steam'

interface Props {
  progression: Progression
}

export default function ProgressionCard({ progression }: Props) {
  const { level, title, current_hours, hours_for_next_level, progress_percent } = progression
  // hours_for_current_level (later implementation)
  const hoursToGo = Math.max(hours_for_next_level - current_hours, 0)

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-5 mb-8">
      {/* Level badge */}
      <div className="shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(99,102,241,0.12))', border: '1px solid rgba(201,168,76,0.3)' }}>
        <span className="font-mono text-xs text-muted leading-none">LVL</span>
        <span className="font-sans text-2xl font-bold text-gold leading-tight">{level}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-2">
          <p className="font-sans text-base font-semibold text-white">{title}</p>
          <p className="font-mono text-xs text-muted">
            {current_hours.toLocaleString()}h
            <span className="text-muted/60"> / {hours_for_next_level.toLocaleString()}h for LVL {level + 1}</span>
          </p>
        </div>
        <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${progress_percent}%`, background: 'linear-gradient(to right, #8A6F2E, #C9A84C)' }} />
        </div>
        <p className="font-mono text-xs text-muted mt-2">
          {hoursToGo > 0
            ? `${hoursToGo.toLocaleString()}h to next level`
            : 'Max tracked level reached'}
        </p>
      </div>
    </div>
  )
}