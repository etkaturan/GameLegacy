import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { DashboardContextType } from '../DashboardPage'
import { updatePins } from '../../hooks/useIdentity'
import GameLegacyAchievements from '../../features/dashboard/GameLegacyAchievements'

const MAX_PINS = 6

export default function AchievementsPage() {
  const { identity, record, setRecord } = useOutletContext<DashboardContextType>()
  const [pinError, setPinError] = useState<string | null>(null)

  const togglePin = async (id: string) => {
    const current = record.pinned_achievements
    let next: string[]
    if (current.includes(id)) {
      next = current.filter(a => a !== id)
    } else {
      if (current.length >= MAX_PINS) {
        setPinError(`You can feature up to ${MAX_PINS} achievements.`)
        setTimeout(() => setPinError(null), 2500)
        return
      }
      next = [...current, id]
    }
    const updated = await updatePins(record.id, { pinned_achievements: next })
    setRecord(updated)
  }

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-muted uppercase mb-2">GameLegacy Achievements</p>
      <p className="font-mono text-xs text-muted mb-5">
        Click the star to feature an achievement on your overview ({record.pinned_achievements.length}/{MAX_PINS}).
      </p>

      <GameLegacyAchievements
        achievements={identity.gamelegacy_achievements}
        pinnedIds={record.pinned_achievements}
        onTogglePin={togglePin}
      />

      {pinError && <p className="font-mono text-xs text-red-400 mt-4">{pinError}</p>}

      <div className="mt-10 p-5 bg-surface border border-border rounded-xl">
        <p className="font-mono text-xs text-muted leading-relaxed">
          Per-game Steam achievements are available on each game's entry in the{' '}
          <span className="text-gold">Games</span> tab. More GameLegacy achievement tiers,
          milestones, and cosmetic rewards are planned for future updates.
        </p>
      </div>
    </div>
  )
}