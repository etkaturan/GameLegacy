import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContextType } from '../DashboardPage'
import AchievementsPanel from '../../features/dashboard/AchievementsPanel'
import { updatePins } from '../../hooks/useIdentity'

function getGameIcon(appId: number, iconHash: string) {
  if (!iconHash) return null
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`
}

const MAX_PINS = 6

export default function GamesPage() {
  const { identity, record, setRecord } = useOutletContext<DashboardContextType>()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'played' | 'unplayed'>('all')
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)

  const steamIds = identity.accounts.map(a => a.steam_id)

  const filtered = identity.library.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'played' ? g.total_playtime_hours > 0 :
      g.total_playtime_hours === 0
    return matchSearch && matchFilter
  })

  const toggleExpand = (appId: number) => {
    setExpandedAppId(prev => (prev === appId ? null : appId))
  }

  const togglePin = async (appId: number) => {
    const current = record.pinned_games
    let next: number[]
    if (current.includes(appId)) {
      next = current.filter(id => id !== appId)
    } else {
      if (current.length >= MAX_PINS) {
        setPinError(`You can feature up to ${MAX_PINS} games.`)
        setTimeout(() => setPinError(null), 2500)
        return
      }
      next = [...current, appId]
    }
    const updated = await updatePins(record.id, { pinned_games: next })
    setRecord(updated)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <p className="font-mono text-xs tracking-widest text-muted uppercase">Library</p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search games..."
          className="flex-1 max-w-xs px-3 py-1.5 bg-surface border border-border rounded-md text-white text-sm font-body placeholder-muted outline-none focus:border-gold-dim transition-colors"
        />
        <div className="flex gap-1 ml-auto">
          {(['all', 'played', 'unplayed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`font-mono text-xs px-3 py-1.5 rounded-md transition-all capitalize
                ${filter === f
                  ? 'bg-gold text-canvas'
                  : 'border border-border text-muted hover:border-muted hover:text-white'
                }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="font-mono text-xs text-muted mb-3">
        Click a game for achievements. Click the star to feature it on your overview ({record.pinned_games.length}/{MAX_PINS}).
      </p>
      {pinError && <p className="font-mono text-xs text-red-400 mb-3">{pinError}</p>}

      <div className="space-y-1">
        {filtered.map((game, i) => {
          const isExpanded = expandedAppId === game.app_id
          const isPinned = record.pinned_games.includes(game.app_id)
          return (
            <div key={game.app_id}>
              <div className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors group ${isExpanded ? 'bg-surface' : 'hover:bg-surface'}`}>
                <button
                  onClick={() => togglePin(game.app_id)}
                  data-hover
                  className={`shrink-0 text-base transition-colors ${isPinned ? 'text-gold' : 'text-border hover:text-muted'}`}
                  title={isPinned ? 'Remove from featured' : 'Add to featured'}
                >
                  {isPinned ? '★' : '☆'}
                </button>
                <span className="font-mono text-xs text-muted w-6 shrink-0 text-right">{i + 1}</span>
                {getGameIcon(game.app_id, game.img_icon_url) ? (
                  <img
                    src={getGameIcon(game.app_id, game.img_icon_url)!}
                    alt={game.name}
                    className="w-8 h-8 rounded shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-surface2 shrink-0" />
                )}
                <span
                  onClick={() => toggleExpand(game.app_id)}
                  data-hover
                  className="flex-1 text-sm text-body group-hover:text-white transition-colors truncate cursor-pointer"
                >
                  {game.name}
                </span>
                {game.owned_by_accounts.length > 1 && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded shrink-0"
                    style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                    {game.owned_by_accounts.length} accounts
                  </span>
                )}
                <span className={`font-mono text-xs w-16 text-right shrink-0 ${game.total_playtime_hours > 0 ? 'text-white' : 'text-muted'}`}>
                  {game.total_playtime_hours > 0 ? `${game.total_playtime_hours}h` : '—'}
                </span>
                <span
                  onClick={() => toggleExpand(game.app_id)}
                  data-hover
                  className="font-mono text-xs text-muted w-3 text-center shrink-0 transition-transform cursor-pointer"
                  style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  ›
                </span>
              </div>

              {isExpanded && (
                <AchievementsPanel steamIds={steamIds} appId={game.app_id} />
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted font-mono text-sm">
          No games found.
        </div>
      )}
    </div>
  )
}