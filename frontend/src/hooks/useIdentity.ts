import api from '../utils/api'

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

export async function fetchIdentity(identityId: string) {
  const res = await api.get(`/api/v1/identity/${identityId}`)
  return res.data
}

/**
 * Create a new identity, or update an existing one if identityId is provided.
 */
export async function saveIdentity(steamIds: string[], identityId: string | null) {
  if (identityId) {
    const res = await api.put(`/api/v1/identity/${identityId}`, { steam_ids: steamIds })
    return res.data
  }
  const res = await api.post('/api/v1/identity', { steam_ids: steamIds })
  return res.data
}