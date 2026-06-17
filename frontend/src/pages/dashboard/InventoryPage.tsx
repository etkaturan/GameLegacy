import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContextType } from '../DashboardPage'
import { useInventory } from '../../hooks/useInventory'
import { resolveTradeUrlOrId, isTradeUrl } from '../../utils/steamId'
import type { InventoryResult, SupportedGame } from '../../types/inventory'
import InventoryGrid from '../../features/dashboard/InventoryGrid'

export default function InventoryPage() {
  const { identity } = useOutletContext<DashboardContextType>()
  const { loading, error, fetchSupportedGames, fetchInventory } = useInventory()

  const [games, setGames] = useState<SupportedGame[]>([])
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [extraIds, setExtraIds] = useState<string[]>([])
  const [inputError, setInputError] = useState<string | null>(null)
  const [includePrices, setIncludePrices] = useState(false)
  const [result, setResult] = useState<InventoryResult | null>(null)
  const [filterRarity, setFilterRarity] = useState<string>('all')

  const accountSteamIds = identity.accounts.map(a => a.steam_id)

  useEffect(() => {
    fetchSupportedGames().then(setGames)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allSteamIds = [...accountSteamIds, ...extraIds]

  const handleAddId = () => {
    if (!input.trim()) return
    const resolved = resolveTradeUrlOrId(input.trim())
    if (!resolved) {
      setInputError(isTradeUrl(input)
        ? 'Could not read partner ID from this trade URL.'
        : 'Enter a valid Steam ID (17 digits) or trade URL.')
      return
    }
    if (allSteamIds.includes(resolved)) {
      setInputError('This account is already included.')
      return
    }
    setExtraIds(prev => [...prev, resolved])
    setInput('')
    setInputError(null)
  }

  const handleRemoveId = (id: string) => {
    setExtraIds(prev => prev.filter(i => i !== id))
  }

  const handleFetch = async (appId: number) => {
    setSelectedAppId(appId)
    setResult(null)
    const data = await fetchInventory(allSteamIds, appId, includePrices)
    setResult(data)
  }

  const rarities = result ? Array.from(new Set(result.items.map(i => i.rarity).filter(Boolean))) : []
  const filteredItems = result
    ? (filterRarity === 'all' ? result.items : result.items.filter(i => i.rarity === filterRarity))
    : []

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-muted uppercase mb-2">Digital Collections</p>
      <p className="font-mono text-xs text-muted mb-6">
        Inventories must be set to <span className="text-gold">public</span> in Steam privacy settings to be visible here.
      </p>

      {/* Extra accounts via trade URL / Steam ID */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <p className="font-mono text-xs tracking-widest text-muted uppercase mb-3">
          Add account by trade URL or Steam ID
        </p>
        <div className="flex gap-0 mb-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddId()}
            placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=... or Steam ID"
            className="flex-1 px-4 py-2.5 bg-surface2 border border-border border-r-0 rounded-l-md text-white text-sm font-body placeholder-muted outline-none focus:border-gold-dim transition-colors"
          />
          <button
            onClick={handleAddId}
            className="px-4 py-2.5 bg-gold text-canvas font-sans font-semibold text-sm rounded-r-md hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Add
          </button>
        </div>
        {inputError && <p className="font-mono text-xs text-red-400 mb-2">{inputError}</p>}

        {extraIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {extraIds.map(id => (
              <span key={id} className="font-mono text-xs px-3 py-1.5 rounded-md bg-surface2 text-body flex items-center gap-2">
                {id}
                <button onClick={() => handleRemoveId(id)} className="text-muted hover:text-white" data-hover>×</button>
              </span>
            ))}
          </div>
        )}

        <p className="font-mono text-xs text-muted mt-3">
          Your connected accounts ({accountSteamIds.length}) are included automatically.
        </p>
      </div>

      {/* Game selector */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {games.map(g => (
          <button
            key={g.app_id}
            onClick={() => handleFetch(g.app_id)}
            data-hover
            className={`font-mono text-xs px-4 py-2 rounded-md transition-all
              ${selectedAppId === g.app_id
                ? 'bg-gold text-canvas'
                : 'border border-border text-muted hover:border-muted hover:text-white'
              }`}
          >
            {g.name}
          </button>
        ))}

        <label className="flex items-center gap-2 ml-auto font-mono text-xs text-muted cursor-pointer" data-hover>
          <input
            type="checkbox"
            checked={includePrices}
            onChange={e => setIncludePrices(e.target.checked)}
            className="accent-gold"
          />
          Fetch market prices (slower)
        </label>
      </div>

      {loading && (
        <div className="text-center py-16">
          <p className="font-mono text-xs text-gold uppercase tracking-widest animate-pulse">
            {includePrices ? 'Fetching inventory and prices...' : 'Fetching inventory...'}
          </p>
          {includePrices && (
            <p className="font-mono text-xs text-muted mt-2">This can take a moment due to Steam's rate limits.</p>
          )}
        </div>
      )}

      {error && (
        <p className="font-mono text-xs text-red-400 mb-4">{error}</p>
      )}

      {result && !loading && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-xl px-5 py-4">
              <div className="font-mono text-2xl font-medium text-white">{result.total_items}</div>
              <div className="text-xs text-muted mt-1">Total items</div>
            </div>
            <div className="bg-surface border border-border rounded-xl px-5 py-4">
              <div className="font-mono text-2xl font-medium text-white">
                {result.total_value_usd !== null ? `$${result.total_value_usd.toFixed(2)}` : '—'}
              </div>
              <div className="text-xs text-muted mt-1">
                {includePrices ? `Est. value (${result.priced_item_count} priced)` : 'Enable prices to estimate'}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl px-5 py-4">
              <div className="font-mono text-2xl font-medium text-white">{allSteamIds.length}</div>
              <div className="text-xs text-muted mt-1">Accounts checked</div>
            </div>
          </div>

          {/* Rarity filter */}
          {rarities.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-5">
              <button
                onClick={() => setFilterRarity('all')}
                className={`font-mono text-xs px-3 py-1.5 rounded-md transition-all
                  ${filterRarity === 'all' ? 'bg-gold text-canvas' : 'border border-border text-muted hover:text-white'}`}
              >
                All
              </button>
              {rarities.map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRarity(r)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-md border transition-all
                    ${filterRarity === r ? 'text-canvas' : 'text-muted hover:text-white border-border'}`}
                  style={filterRarity === r ? { background: result.items.find(i => i.rarity === r)?.rarity_color } : {}}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <InventoryGrid items={filteredItems} />
        </>
      )}

      {!result && !loading && !error && (
        <div className="text-center py-16 text-muted font-mono text-sm">
          Select a game above to load inventory.
        </div>
      )}
    </div>
  )
}