import { useEffect, useState } from 'react'
import { useAchievements } from '../../hooks/useAchievements'
import type { GameAchievements } from '../../types/steam'

interface Props {
  steamIds: string[]
  appId: number
}

export default function AchievementsPanel({ steamIds, appId }: Props) {
  const [data, setData] = useState<GameAchievements | null>(null)
  const { loading, error, fetchAchievements } = useAchievements()

  useEffect(() => {
    let active = true
    fetchAchievements(steamIds, appId).then(result => {
      if (active) setData(result)
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId])

  if (loading) {
    return (
      <div className="px-4 py-6 text-center bg-surface2 rounded-lg mb-1">
        <p className="font-mono text-xs text-muted animate-pulse">Loading achievements...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6 text-center bg-surface2 rounded-lg mb-1">
        <p className="font-mono text-xs text-red-400">{error}</p>
      </div>
    )
  }

  if (!data || !data.has_achievements) {
    return (
      <div className="px-4 py-6 text-center bg-surface2 rounded-lg mb-1">
        <p className="font-mono text-xs text-muted">{data?.message || 'This game has no achievements.'}</p>
      </div>
    )
  }

  const percent = data.total > 0 ? Math.round((data.achieved / data.total) * 100) : 0

  return (
    <div className="px-4 py-5 bg-surface2 rounded-lg mb-1">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-xs text-muted uppercase tracking-widest">Achievements</p>
        <p className="font-mono text-xs text-white">
          {data.achieved} / {data.total} <span className="text-gold">({percent}%)</span>
        </p>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-5">
        <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>

      {/* Icon grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
        {data.achievements.map(a => (
          <div key={a.api_name} className="group relative" data-hover>
            <img
              src={a.achieved ? a.icon : (a.icon_gray || a.icon)}
              alt={a.name}
              className={`w-10 h-10 rounded-md border ${a.achieved ? 'border-[rgba(201,168,76,0.4)]' : 'border-border opacity-40'}`}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-canvas border border-border rounded-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
              <p className="font-sans text-xs font-semibold text-white mb-1">{a.name}</p>
              {a.description && (
                <p className="text-xs text-muted leading-snug">{a.description}</p>
              )}
              {a.achieved && a.unlock_time > 0 && (
                <p className="font-mono text-xs text-gold mt-1.5">
                  Unlocked {new Date(a.unlock_time * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}