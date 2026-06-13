import { useState } from 'react'
import { useSteam } from '../hooks/useSteam'
import ConnectSteam from '../features/dashboard/ConnectSteam'
import IdentityDashboard from '../features/dashboard/IdentityDashboard'
import type { SteamProfile, CombinedIdentity } from '../types/steam'

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<SteamProfile[]>([])
  const [identity, setIdentity] = useState<CombinedIdentity | null>(null)
  const { loading, error, combineAccounts } = useSteam()

  const handleConfirm = async (profiles: SteamProfile[]) => {
    const ids = profiles.map(p => p.steam_id)
    const result = await combineAccounts(ids)
    if (result) {
      setAccounts(profiles)
      setIdentity(result)
    }
  }

  const handleReset = () => {
    setIdentity(null)
    setAccounts([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-xs tracking-widest text-gold uppercase mb-4 animate-pulse">
            Building your identity...
          </p>
          <p className="text-muted text-sm">Fetching your gaming history</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-xs text-red-400 mb-4">{error}</p>
          <button onClick={handleReset}
            className="font-mono text-xs text-muted border border-border px-4 py-2 rounded-md hover:text-white transition-colors">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (identity) {
    return <IdentityDashboard identity={identity} accounts={accounts} onReset={handleReset} />
  }

  return <ConnectSteam onConfirm={handleConfirm} />
}