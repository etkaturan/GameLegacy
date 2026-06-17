import { Link, useOutletContext } from 'react-router-dom'
import type { DashboardContextType } from '../DashboardPage'
import GameLegacyAchievements from '../../features/dashboard/GameLegacyAchievements'

function getGameIcon(appId: number, iconHash: string) {
  if (!iconHash) return null
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`
}

export default function OverviewPage() {
  const { identity, record } = useOutletContext<DashboardContextType>()

  const pinnedGames = record.pinned_games.length > 0
    ? identity.library.filter(g => record.pinned_games.includes(g.app_id))
    : identity.library.slice(0, 4)

  const pinnedAchievements = record.pinned_achievements.length > 0
    ? identity.gamelegacy_achievements.filter(a => record.pinned_achievements.includes(a.id))
    : identity.gamelegacy_achievements

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { val: identity.total_playtime_hours.toLocaleString(), label: 'Total hours' },
          { val: identity.unique_games, label: 'Unique games' },
          { val: identity.total_games, label: 'Total owned' },
          { val: identity.accounts.length, label: 'Accounts merged' },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-border rounded-xl px-5 py-4">
            <div className="font-mono text-2xl font-medium text-white">{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs tracking-widest text-muted uppercase">
          {record.pinned_achievements.length > 0 ? 'Featured Achievements' : 'GameLegacy Achievements'}
        </p>
        <Link to="/dashboard/achievements" data-hover className="font-mono text-xs text-gold hover:opacity-80 transition-opacity">
          View all →
        </Link>
      </div>
      <div className="mb-10">
        <GameLegacyAchievements achievements={pinnedAchievements} />
      </div>

      {/* Games */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs tracking-widest text-muted uppercase">
          {record.pinned_games.length > 0 ? 'Featured Games' : 'Top Games'}
        </p>
        <Link to="/dashboard/games" data-hover className="font-mono text-xs text-gold hover:opacity-80 transition-opacity">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pinnedGames.map(game => (
          <div key={game.app_id} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              {getGameIcon(game.app_id, game.img_icon_url) ? (
                <img src={getGameIcon(game.app_id, game.img_icon_url)!} alt={game.name} className="w-10 h-10 rounded object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded bg-surface2 shrink-0" />
              )}
              <p className="font-sans text-sm font-semibold text-white leading-snug line-clamp-2">{game.name}</p>
            </div>
            <p className="font-mono text-xs text-muted">{game.total_playtime_hours}h played</p>
          </div>
        ))}
      </div>
    </div>
  )
}