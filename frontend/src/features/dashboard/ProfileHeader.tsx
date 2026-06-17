import { Link } from 'react-router-dom'
import type { CombinedIdentity, SteamProfile } from '../../types/steam'
import type { IdentityRecord } from '../../types/identity'
import ProgressionCard from './ProgressionCard'

interface Props {
  identity: CombinedIdentity
  accounts: SteamProfile[]
  record: IdentityRecord
  onAddAccount: () => void
}

export default function ProfileHeader({ identity, accounts, record, onAddAccount }: Props) {
  const displayName = record.username
    || (accounts.length === 1 ? accounts[0].username : `${accounts.length} accounts merged`)

  const joinYear = accounts[0]?.time_created
    ? new Date(accounts[0].time_created * 1000).getFullYear()
    : null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-gold uppercase mb-2">Gaming Identity</p>
          <h1 className="font-sans text-3xl font-bold tracking-tight">{displayName}</h1>
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
          <Link
            to="/dashboard/settings"
            data-hover
            className="font-mono text-xs text-muted border border-border px-3 py-2 rounded-md hover:border-muted hover:text-white transition-all"
          >
            ⚙ Settings
          </Link>
        </div>
      </div>

      <ProgressionCard progression={identity.progression} />
    </div>
  )
}