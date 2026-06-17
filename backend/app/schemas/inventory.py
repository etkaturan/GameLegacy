from pydantic import BaseModel


class InventoryAccountInput(BaseModel):
    steam_ids: list[str]
    app_id: int
    include_prices: bool = False


class InventoryItem(BaseModel):
    asset_id: str
    class_id: str
    instance_id: str
    app_id: int
    name: str
    icon_url: str
    marketable: bool
    tradable: bool
    type: str
    rarity: str
    rarity_color: str
    exterior: str
    account_index: int
    price_usd: float | None = None


class InventoryResult(BaseModel):
    app_id: int
    total_items: int
    items: list[InventoryItem]
    total_value_usd: float | None = None
    priced_item_count: int = 0