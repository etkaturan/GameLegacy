from pydantic import BaseModel


class SteamAccountInput(BaseModel):
    steam_id: str


class MultiAccountInput(BaseModel):
    steam_ids: list[str]


class GameEntry(BaseModel):
    app_id: int
    name: str
    total_playtime_minutes: int
    total_playtime_hours: float
    owned_by_accounts: list[dict]
    img_icon_url: str


class PlayerSummary(BaseModel):
    steam_id: str
    username: str
    avatar: str
    profile_url: str
    time_created: int | None = None


class ProgressionOut(BaseModel):
    level: int
    title: str
    current_hours: float
    hours_for_current_level: float
    hours_for_next_level: float
    progress_percent: float


class GameLegacyAchievementOut(BaseModel):
    id: str
    name: str
    description: str
    achieved: bool
    progress_current: float
    progress_target: float
    progress_percent: float


class CombinedIdentity(BaseModel):
    accounts: list[PlayerSummary]
    total_games: int
    unique_games: int
    total_playtime_hours: float
    library: list[GameEntry]
    progression: ProgressionOut
    gamelegacy_achievements: list[GameLegacyAchievementOut]


class AchievementEntry(BaseModel):
    api_name: str
    name: str
    description: str
    achieved: bool
    unlock_time: int
    icon: str
    icon_gray: str


class GameAchievements(BaseModel):
    has_achievements: bool
    achieved: int
    total: int
    achievements: list[AchievementEntry]
    message: str = ""