import { useState } from 'react'
import api from '../utils/api'
import type { SteamProfile, CombinedIdentity } from '../types/steam'

export function useSteam() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (steamId: string): Promise<SteamProfile | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/v1/steam/profile/${steamId}`)
      return res.data
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to fetch profile.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const combineAccounts = async (steamIds: string[]): Promise<CombinedIdentity | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/v1/steam/combine', { steam_ids: steamIds })
      return res.data
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to combine accounts.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const resolveVanity = async (vanity: string): Promise<string | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/v1/steam/resolve-vanity', { steam_id: vanity })
      return res.data.steam_id
    } catch (e: any) {
      setError('Vanity URL not found.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, fetchProfile, combineAccounts, resolveVanity }
}