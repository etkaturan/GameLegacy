import { useState } from 'react'
import api from '../utils/api'
import type { GameAchievements } from '../types/steam'

export function useAchievements() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = async (steamIds: string[], appId: number): Promise<GameAchievements | null> => {
    setLoading(true)
    setError(null)
    try {
      if (steamIds.length === 1) {
        const res = await api.get(`/api/v1/steam/achievements/${steamIds[0]}/${appId}`)
        return res.data
      }
      const res = await api.post(`/api/v1/steam/achievements/combined/${appId}`, { steam_ids: steamIds })
      return res.data
    } catch {
      setError('Failed to load achievements.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, fetchAchievements }
}