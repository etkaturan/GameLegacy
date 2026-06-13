import { useState } from 'react'
import { useSteam } from '../../hooks/useSteam'
import type { SteamProfile } from '../../types/steam'

interface ConnectSteamProps {
  onConfirm: (accounts: SteamProfile[]) => void
  initialAccounts?: SteamProfile[]
  onCancel?: () => void
}

export default function ConnectSteam({ onConfirm, initialAccounts = [], onCancel }: ConnectSteamProps) {
  const [input, setInput] = useState('')
  const [previews, setPreviews] = useState<SteamProfile[]>(initialAccounts)
  const { loading, error, fetchProfile, resolveVanity } = useSteam()

  const handleAdd = async () => {
    if (!input.trim()) return
    let steamId = input.trim()

    if (!/^\d{17}$/.test(steamId)) {
      const resolved = await resolveVanity(steamId)
      if (!resolved) return
      steamId = resolved
    }

    if (previews.find(p => p.steam_id === steamId)) {
      setInput('')
      return
    }

    const profile = await fetchProfile(steamId)
    if (profile) {
      setPreviews(prev => [...prev, profile])
      setInput('')
    }
  }

  const handleRemove = (steamId: string) => {
    setPreviews(prev => prev.filter(p => p.steam_id !== steamId))
  }

  const isAdding = initialAccounts.length > 0

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      {onCancel && (
        <button onClick={onCancel}
          className="font-mono text-xs text-muted hover:text-white transition-colors mb-6">
          ← Back to dashboard
        </button>
      )}

      <p className="font-mono text-xs tracking-widest text-gold uppercase mb-4">Phase 1</p>
      <h1 className="font-sans text-4xl font-bold tracking-tight mb-3">
        {isAdding ? <>Add another<br />account</> : <>Connect your<br />Steam accounts</>}
      </h1>
      <p className="text-body text-sm leading-relaxed mb-10">
        {isAdding
          ? 'Add another Steam account to merge into your existing identity.'
          : 'Enter your Steam ID or vanity URL name. Add multiple accounts to merge them into one identity.'}
      </p>

      {/* Input */}
      <div className="flex gap-0 mb-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Steam ID or vanity name..."
          className="flex-1 px-4 py-3 bg-surface border border-border border-r-0 rounded-l-md text-white text-sm font-body placeholder-muted outline-none focus:border-gold-dim transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="px-5 py-3 bg-gold text-canvas font-sans font-semibold text-sm rounded-r-md hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Add account'}
        </button>
      </div>

      {error && (
        <p className="font-mono text-xs text-red-400 mb-4">{error}</p>
      )}

      <p className="font-mono text-xs text-muted mb-8">
        Find your Steam ID at <span className="text-gold">steamid.io</span> — or enter your vanity name directly.
      </p>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-3 mb-8">
          <p className="font-mono text-xs tracking-widest text-muted uppercase mb-4">
            Accounts to merge ({previews.length})
          </p>
          {previews.map((p, i) => (
            <div key={p.steam_id}
              className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-4">
              <img src={p.avatar} alt={p.username}
                className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-white text-sm">{p.username}</p>
                <p className="font-mono text-xs text-muted mt-0.5 truncate">{p.steam_id}</p>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
                Account {i + 1}
              </span>
              <button onClick={() => handleRemove(p.steam_id)}
                className="text-muted hover:text-white transition-colors text-lg leading-none ml-1">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirm */}
      {previews.length > 0 && (
        <button
          onClick={() => onConfirm(previews)}
          className="w-full py-3 bg-gold text-canvas font-sans font-semibold text-sm rounded-md hover:opacity-90 transition-opacity"
        >
          {isAdding ? 'Update my identity →' : 'Build my identity →'}
        </button>
      )}
    </div>
  )
}