from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CreateIdentityInput(BaseModel):
    steam_ids: list[str]


class UpdateUsernameInput(BaseModel):
    username: str = Field(min_length=1, max_length=32)


class UpdatePinsInput(BaseModel):
    pinned_games: list[int] | None = None
    pinned_achievements: list[str] | None = None


class ConnectedAccountOut(BaseModel):
    platform: str
    platform_id: str

    model_config = ConfigDict(from_attributes=True)


class IdentityOut(BaseModel):
    id: str
    created_at: datetime
    username: str | None = None
    pinned_games: list[int] = []
    pinned_achievements: list[str] = []
    accounts: list[ConnectedAccountOut]

    model_config = ConfigDict(from_attributes=True)