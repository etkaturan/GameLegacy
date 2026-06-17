import type { GameLegacyAchievement } from '../../types/steam'

interface Props {
  achievements: GameLegacyAchievement[]
  pinnedIds?: string[]
  onTogglePin?: (id: string) => void
}

const ICONS: Record<string, string> = {
  the_beginning: '🌱',
  the_archivist: '📜',
  the_collector: '📦',
  the_eternal_gamer: '♾️',
}

function formatProgress(ach: GameLegacyAchievement): string {
  if (ach.id === 'the_eternal_gamer') {
    return `${Math.floor(ach.progress_current).toLocaleString()} / ${ach.progress_target.toLocaleString()}h`
  }
  if (ach.id === 'the_archivist') {
    return `${Math.floor(ach.progress_current)} / ${ach.progress_target} years`
  }
  return `${Math.floor(ach.progress_current).toLocaleString()} / ${ach.progress_target.toLocaleString()}`
}

export default function GameLegacyAchievements({ achievements, pinnedIds, onTogglePin }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {achievements.map(ach => {
        const isPinned = pinnedIds?.includes(ach.id)
        return (
          <div key={ach.id}
            className={`rounded-xl p-4 border transition-all
              ${ach.achieved
                ? 'bg-surface2 border-[rgba(201,168,76,0.35)]'
                : 'bg-surface border-border'
              }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{ICONS[ach.id] || '🏅'}</span>
              <div className="flex items-center gap-2">
                {ach.achieved && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
                    Unlocked
                  </span>
                )}
                {onTogglePin && (
                  <button
                    onClick={() => onTogglePin(ach.id)}
                    data-hover
                    className={`text-base transition-colors ${isPinned ? 'text-gold' : 'text-border hover:text-muted'}`}
                    title={isPinned ? 'Remove from featured' : 'Add to featured'}
                  >
                    {isPinned ? '★' : '☆'}
                  </button>
                )}
              </div>
            </div>
            <p className="font-sans text-sm font-semibold text-white mb-1">{ach.name}</p>
            <p className="text-xs text-muted leading-relaxed mb-3">{ach.description}</p>
            <div className="h-1 bg-surface rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${ach.progress_percent}%`,
                  background: ach.achieved ? '#C9A84C' : '#6366F1',
                }} />
            </div>
            <p className="font-mono text-xs text-muted">{formatProgress(ach)}</p>
          </div>
        )
      })}
    </div>
  )
}