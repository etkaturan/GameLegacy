import { useEffect, useState } from 'react'
import { useSteam } from '../hooks/useSteam'
import {
  getStoredIdentityId,
  storeIdentityId,
  clearIdentityId,
  fetchIdentity,
  saveIdentity,
} from '../hooks/useIdentity'
import ConnectSteam from '../features/dashboard/ConnectSteam'
import IdentityDashboard from '../features/dashboard/IdentityDashboard'
import LoadingScreen from '../components/ui/LoadingScreen'
import type { SteamProfile, CombinedIdentity } from '../types/steam'

type Mode = 'loading' | 'connect' | 'dashboard'

export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>('loading')
  const [accounts, setAccounts] = useState<SteamProfile[]>([])
  const [identity, setIdentity] = useState<CombinedIdentity | null>(null)
  const [identityId, setIdentityId] = useState<string | null>(null)
  const { loading, error, combineAccounts } = useSteam()

  // On first load, try to restore a saved identity
  useEffect(() => {
    const init = async () => {
      const storedId = getStoredIdentityId()
      if (!storedId) {
        setMode('connect')
        return
      }

      try {
        const saved = await fetchIdentity(storedId)
        const steamIds: string[] = saved.accounts.map((a: any) => a.platform_id)

        if (steamIds.length === 0) {
          clearIdentityId()
          setMode('connect')
          return
        }

        const result = await combineAccounts(steamIds)
        if (result) {
          setAccounts(result.accounts)
          setIdentity(result)
          setIdentityId(storedId)
          setMode('dashboard')
        } else {
          setMode('connect')
        }
      } catch {
        clearIdentityId()
        setMode('connect')
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConfirm = async (profiles: SteamProfile[]) => {
    const ids = profiles.map(p => p.steam_id)
    const result = await combineAccounts(ids)
    if (result) {
      setAccounts(result.accounts)
      setIdentity(result)

      const saved = await saveIdentity(ids, identityId)
      setIdentityId(saved.id)
      storeIdentityId(saved.id)

      setMode('dashboard')
    }
  }

  const handleAddAccount = () => setMode('connect')
  const handleCancel = () => setMode('dashboard')

  if (mode === 'loading') {
    return <LoadingScreen text="Restoring your identity..." />
  }

  if (loading) {
    return <LoadingScreen text="Building your identity..." subtext="Fetching your gaming history" />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-xs text-red-400 mb-4">{error}</p>
          <button onClick={() => setMode('connect')}
            className="font-mono text-xs text-muted border border-border px-4 py-2 rounded-md hover:text-white transition-colors">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'dashboard' && identity) {
    return <IdentityDashboard identity={identity} accounts={accounts} onAddAccount={handleAddAccount} />
  }

  return (
    <ConnectSteam
      onConfirm={handleConfirm}
      initialAccounts={mode === 'connect' && identity ? accounts : []}
      onCancel={identity ? handleCancel : undefined}
    />
  )
}