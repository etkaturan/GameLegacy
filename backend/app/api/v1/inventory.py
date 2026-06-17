from fastapi import APIRouter, HTTPException

from app.schemas.inventory import InventoryAccountInput, InventoryResult
from app.services.inventory_service import (
    fetch_inventory,
    attach_market_prices,
    merge_inventories,
)

router = APIRouter(prefix="/inventory", tags=["Inventory"])

SUPPORTED_INVENTORY_GAMES = {
    730: "Counter-Strike 2",
    570: "Dota 2",
    440: "Team Fortress 2",
    252490: "Rust",
}


@router.get("/supported-games")
def supported_games():
    """List of games GameLegacy can fetch inventory/collection data for."""
    return [{"app_id": k, "name": v} for k, v in SUPPORTED_INVENTORY_GAMES.items()]


@router.post("", response_model=InventoryResult)
async def get_inventory(body: InventoryAccountInput):
    """
    Fetch and merge inventory across 1+ Steam accounts for a given game.
    Inventories must be set to public on Steam. Optionally fetches market
    prices (slower — rate-limited by Steam, capped at 40 unique items).
    """
    if not body.steam_ids:
        raise HTTPException(status_code=400, detail="No Steam IDs provided.")
    if len(body.steam_ids) > 6:
        raise HTTPException(status_code=400, detail="Maximum 6 accounts supported.")

    inventories = [await fetch_inventory(sid, body.app_id) for sid in body.steam_ids]
    merged = merge_inventories(inventories)

    total_value = None
    priced_count = 0

    if body.include_prices and merged:
        merged = await attach_market_prices(merged, body.app_id)
        priced_values = [i["price_usd"] for i in merged if i.get("price_usd") is not None]
        priced_count = len(priced_values)
        if priced_values:
            total_value = round(sum(priced_values), 2)

    return InventoryResult(
        app_id=body.app_id,
        total_items=len(merged),
        items=merged,
        total_value_usd=total_value,
        priced_item_count=priced_count,
    )


@router.get("/debug/{steam_id}/{app_id}")
async def debug_inventory(steam_id: str, app_id: int):
    """TEMPORARY — call the real fetch_inventory with debug logging to the terminal."""
    items = await fetch_inventory(steam_id, app_id, debug=True)
    return {"item_count": len(items), "first_3_items": items[:3]}