export interface ConnectedAccountRef {
  platform: string
  platform_id: string
}

export interface IdentityRecord {
  id: string
  created_at: string
  username: string | null
  pinned_games: number[]
  pinned_achievements: string[]
  accounts: ConnectedAccountRef[]
}