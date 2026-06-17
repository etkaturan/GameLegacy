import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useSteam } from '../hooks/useSteam'
import {
  getStoredIdentityId,
  storeIdentityId,
  clearIdentityId,
  fetchIdentity,
  saveIdentity,
} from '../hooks/useIdentity'
import ConnectSteam from '../features/dashboard/ConnectSteam'
import LoadingScreen from '../components/ui/LoadingScreen'
import DashboardNav from '../components/ui/DashboardNav'
import ProfileHeader from '../features/dashboard/ProfileHeader'
import type { SteamProfile, CombinedIdentity } from '../types/steam'
import type { IdentityRecord } from '../types/identity'

export interface DashboardContextType {
  identity: CombinedIdentity
  accounts: SteamProfile[]
  record: IdentityRecord
  setRecord: (r: IdentityRecord) => void
}

type Mode = 'loading' | 'connect' | 'dashboard'

export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>('loading')
  const [accounts, setAccounts] = useState<SteamProfile[]>([])
  const [identity, setIdentity] = useState<CombinedIdentity | null>(null)
  const [record, setRecord] = useState<IdentityRecord | null>(null)
  const { loading, error, combineAccounts } = useSteam()

  useEffect(() => {
    const init = async () => {
      const storedId = getStoredIdentityId()
      if (!storedId) {
        setMode('connect')
        return
      }

      try {
        const rec = await fetchIdentity(storedId)
        const steamIds = rec.accounts.map(a => a.platform_id)

        if (steamIds.length === 0) {
          clearIdentityId()
          setMode('connect')
          return
        }

        const result = await combineAccounts(steamIds)
        if (result) {
          setAccounts(result.accounts)
          setIdentity(result)
          setRecord(rec)
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

      const saved = await saveIdentity(ids, record?.id ?? null)
      storeIdentityId(saved.id)
      setRecord(saved)

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

  if (mode === 'dashboard' && identity && record) {
    const context: DashboardContextType = { identity, accounts, record, setRecord }
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <ProfileHeader identity={identity} accounts={accounts} record={record} onAddAccount={handleAddAccount} />
        <DashboardNav />
        <Outlet context={context} />
      </div>
    )
  }

  return (
    <ConnectSteam
      onConfirm={handleConfirm}
      initialAccounts={mode === 'connect' && identity ? accounts : []}
      onCancel={identity ? handleCancel : undefined}
    />
  )
}