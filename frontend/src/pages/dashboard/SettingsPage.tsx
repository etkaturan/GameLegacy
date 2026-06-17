import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContextType } from '../DashboardPage'
import { updateUsername } from '../../hooks/useIdentity'

export default function SettingsPage() {
  const { record, setRecord, accounts } = useOutletContext<DashboardContextType>()
  const [username, setUsername] = useState(record.username || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    const trimmed = username.trim()
    if (trimmed.length < 1 || trimmed.length > 32) {
      setError('Username must be between 1 and 32 characters.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateUsername(record.id, trimmed)
      setRecord(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to update username.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <p className="font-mono text-xs tracking-widest text-muted uppercase mb-5">Profile Settings</p>

      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-3">
          GameLegacy username
        </label>
        <div className="flex gap-0">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your display name"
            maxLength={32}
            className="flex-1 px-4 py-3 bg-surface2 border border-border border-r-0 rounded-l-md text-white text-sm font-body placeholder-muted outline-none focus:border-gold-dim transition-colors"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-3 bg-gold text-canvas font-sans font-semibold text-sm rounded-r-md hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {error && <p className="font-mono text-xs text-red-400 mt-2">{error}</p>}
        {saved && <p className="font-mono text-xs text-gold mt-2">✓ Saved</p>}
        <p className="font-mono text-xs text-muted mt-3">
          This is how your identity will be displayed across GameLegacy. Defaults to your Steam name if not set.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Connected accounts</p>
        <div className="space-y-2">
          {accounts.map(a => (
            <div key={a.steam_id} className="flex items-center gap-3 bg-surface2 rounded-lg px-3 py-2">
              <img src={a.avatar} alt={a.username} className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-white">{a.username}</p>
                <p className="font-mono text-xs text-muted truncate">{a.steam_id}</p>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF' }}>
                Steam
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}