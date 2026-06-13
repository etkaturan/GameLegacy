from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CreateIdentityInput(BaseModel):
    steam_ids: list[str]


class ConnectedAccountOut(BaseModel):
    platform: str
    platform_id: str

    model_config = ConfigDict(from_attributes=True)


class IdentityOut(BaseModel):
    id: str
    created_at: datetime
    accounts: list[ConnectedAccountOut]

    model_config = ConfigDict(from_attributes=True)