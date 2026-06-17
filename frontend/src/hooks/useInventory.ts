    import { useState } from 'react'
import api from '../utils/api'
import type { InventoryResult, SupportedGame } from '../types/inventory'

export function useInventory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSupportedGames = async (): Promise<SupportedGame[]> => {
    const res = await api.get('/api/v1/inventory/supported-games')
    return res.data
  }

  const fetchInventory = async (
    steamIds: string[],
    appId: number,
    includePrices: boolean
  ): Promise<InventoryResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/v1/inventory', {
        steam_ids: steamIds,
        app_id: appId,
        include_prices: includePrices,
      })
      return res.data
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to fetch inventory.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, fetchSupportedGames, fetchInventory }
}