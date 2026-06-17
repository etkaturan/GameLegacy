import api from '../utils/api'
import type { IdentityRecord } from '../types/identity'

const STORAGE_KEY = 'gamelegacy_identity_id'

export function getStoredIdentityId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function storeIdentityId(id: string) {
  localStorage.setItem(STORAGE_KEY, id)
}

export function clearIdentityId() {
  localStorage.removeItem(STORAGE_KEY)
}

export async function fetchIdentity(identityId: string): Promise<IdentityRecord> {
  const res = await api.get(`/api/v1/identity/${identityId}`)
  return res.data
}

/**
 * Create a new identity, or update an existing one if identityId is provided.
 */
export async function saveIdentity(steamIds: string[], identityId: string | null): Promise<IdentityRecord> {
  if (identityId) {
    const res = await api.put(`/api/v1/identity/${identityId}`, { steam_ids: steamIds })
    return res.data
  }
  const res = await api.post('/api/v1/identity', { steam_ids: steamIds })
  return res.data
}

export async function updateUsername(identityId: string, username: string): Promise<IdentityRecord> {
  const res = await api.patch(`/api/v1/identity/${identityId}/username`, { username })
  return res.data
}

export async function updatePins(
  identityId: string,
  pins: { pinned_games?: number[]; pinned_achievements?: string[] }
): Promise<IdentityRecord> {
  const res = await api.patch(`/api/v1/identity/${identityId}/pins`, pins)
  return res.data
}