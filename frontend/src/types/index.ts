// ── Player ───────────────────────────────────────────────
export interface Player {
  id: string
  username: string
  gamingSince: number
  level: number
  totalHours: number
  gamesOwned: number
  accounts: ConnectedAccount[]
}

// ── Connected account ─────────────────────────────────────
export interface ConnectedAccount {
  id: string
  platform: Platform
  username: string
  createdYear: number
  hours: number
}

export type Platform =
  | 'steam'
  | 'valorant'
  | 'league'
  | 'cs2'
  | 'dota2'
  | 'psn'
  | 'xbox'