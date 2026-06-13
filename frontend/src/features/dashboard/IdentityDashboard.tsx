import { useState } from 'react'
import type { CombinedIdentity, SteamProfile } from '../../types/steam'
import AchievementsPanel from './AchievementsPanel'

interface Props {
  identity: CombinedIdentity
  accounts: SteamProfile[]
  onAddAccount: () => void
}

function getGameIcon(appId: number, iconHash: string) {
  if (!iconHash) return null
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`
}

export default function IdentityDashboard({ identity, accounts, onAddAccount }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'played' | 'unplayed'>('all')
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null)

  const steamIds = accounts.map(a => a.steam_id)

  const filtered = identity.library.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'played' ? g.total_playtime_hours > 0 :
      g.total_playtime_hours === 0
    return matchSearch && matchFilter
  })

  const joinYear = accounts[0]?.time_created
    ? new Date(accounts[0].time_created * 1000).getFullYear()
    : null

  const toggleExpand = (appId: number) => {
    setExpandedAppId(prev => (prev === appId ? null : appId))
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs tracking-widest text-gold uppercase mb-2">Gaming Identity</p>
          <h1 className="font-sans text-3xl font-bold tracking-tight">
            {accounts.length === 1 ? accounts[0].username : `${accounts.length} accounts merged`}
          </h1>
          {joinYear && (
            <p className="font-mono text-xs text-muted mt-1">
              Steam since {joinYear} · {new Date().getFullYear() - joinYear} years
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {accounts.map(a => (
            <div key={a.steam_id} className="flex items-center gap-2">
              <img src={a.avatar} alt={a.username} className="w-8 h-8 rounded-full" />
              <span className="text-xs text-muted font-mono hidden sm:block">{a.username}</span>
            </div>
          ))}
          <button onClick={onAddAccount}
            className="font-mono text-xs text-muted border border-border px-3 py-2 rounded-md hover:border-muted hover:text-white transition-all">
            + Add account
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { val: identity.total_playtime_hours.toLocaleString(), label: 'Total hours' },
          { val: identity.unique_games, label: 'Unique games' },
          { val: identity.total_games, label: 'Total owned' },
          { val: accounts.length, label: 'Accounts merged' },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-border rounded-xl px-5 py-4">
            <div className="font-mono text-2xl font-medium text-white">{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Accounts breakdown */}
      {accounts.length > 1 && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <p className="font-mono text-xs tracking-widest text-muted uppercase mb-4">Account breakdown</p>
          <div className="grid grid-cols-2 gap-3">
            {accounts.map((a, i) => {
              const accountGames = identity.library.filter(g =>
                g.owned_by_accounts.some(o => o.account_index === i)
              )
              const accountHours = accountGames.reduce((sum, g) => {
                const entry = g.owned_by_accounts.find(o => o.account_index === i)
                return sum + (entry?.playtime_minutes || 0)
              }, 0)
              return (
                <div key={a.steam_id} className="flex items-center gap-3 bg-surface2 rounded-lg px-4 py-3">
                  <img src={a.avatar} alt={a.username} className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-white text-sm">{a.username}</p>
                    <p className="font-mono text-xs text-muted mt-0.5">
                      {accountGames.length} games · {Math.round(accountHours / 60)}h
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Library */}
      <div>
        <div className="flex items-center gap-4 mb-5">
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
          Click a game to view its achievements.
        </p>

        <div className="space-y-1">
          {filtered.map((game, i) => {
            const isExpanded = expandedAppId === game.app_id
            return (
              <div key={game.app_id}>
                <div
                  onClick={() => toggleExpand(game.app_id)}
                  data-hover
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors group ${isExpanded ? 'bg-surface' : 'hover:bg-surface'}`}
                >
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
                  <span className="flex-1 text-sm text-body group-hover:text-white transition-colors truncate">
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
                    className="font-mono text-xs text-muted w-3 text-center shrink-0 transition-transform"
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
    </div>
  )
}