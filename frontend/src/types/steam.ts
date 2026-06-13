export interface SteamProfile {
  steam_id: string
  username: string
  avatar: string
  profile_url: string
  time_created: number | null
}

export interface GameEntry {
  app_id: number
  name: string
  total_playtime_minutes: number
  total_playtime_hours: number
  owned_by_accounts: { account_index: number; playtime_minutes: number }[]
  img_icon_url: string
}

export interface CombinedIdentity {
  accounts: SteamProfile[]
  total_games: number
  unique_games: number
  total_playtime_hours: number
  library: GameEntry[]
}

export interface AchievementEntry {
  api_name: string
  name: string
  description: string
  achieved: boolean
  unlock_time: number
  icon: string
  icon_gray: string
}

export interface GameAchievements {
  has_achievements: boolean
  achieved: number
  total: number
  achievements: AchievementEntry[]
  message: string
}