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

export interface Progression {
  level: number
  title: string
  current_hours: number
  hours_for_current_level: number
  hours_for_next_level: number
  progress_percent: number
}

export interface GameLegacyAchievement {
  id: string
  name: string
  description: string
  achieved: boolean
  progress_current: number
  progress_target: number
  progress_percent: number
}

export interface CombinedIdentity {
  accounts: SteamProfile[]
  total_games: number
  unique_games: number
  total_playtime_hours: number
  library: GameEntry[]
  progression: Progression
  gamelegacy_achievements: GameLegacyAchievement[]
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