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


class CombinedIdentity(BaseModel):
    accounts: list[PlayerSummary]
    total_games: int
    unique_games: int
    total_playtime_hours: float
    library: list[GameEntry]

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