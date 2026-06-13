import httpx
from app.core.config import settings

STEAM_API_BASE = "https://api.steampowered.com"


async def get_player_summary(steam_id: str) -> dict:
    """Fetch basic profile info for a Steam account."""
    url = f"{STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={
            "key": settings.steam_api_key,
            "steamids": steam_id,
        })
        response.raise_for_status()
        data = response.json()
        players = data.get("response", {}).get("players", [])
        if not players:
            return {}
        return players[0]


async def get_owned_games(steam_id: str) -> list:
    """Fetch all games owned by a Steam account with playtime."""
    url = f"{STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={
            "key": settings.steam_api_key,
            "steamid": steam_id,
            "include_appinfo": True,
            "include_played_free_games": True,
        })
        response.raise_for_status()
        data = response.json()
        return data.get("response", {}).get("games", [])


async def get_achievements(steam_id: str, app_id: int) -> dict:
    """Fetch achievements for a specific game."""
    url = f"{STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={
            "key": settings.steam_api_key,
            "steamid": steam_id,
            "appid": app_id,
        })
        if response.status_code != 200:
            return {"achieved": 0, "total": 0}
        data = response.json()
        achievements = data.get("playerstats", {}).get("achievements", [])
        achieved = sum(1 for a in achievements if a.get("achieved") == 1)
        return {"achieved": achieved, "total": len(achievements)}


def merge_game_libraries(libraries: list[list[dict]]) -> list[dict]:
    """
    Merge multiple Steam game libraries into one combined identity.
    Duplicate games (same app_id) are merged — hours are combined,
    ownership is tracked per account.
    """
    merged: dict[int, dict] = {}

    for account_idx, games in enumerate(libraries):
        for game in games:
            app_id = game.get("appid")
            if not app_id:
                continue

            playtime = game.get("playtime_forever", 0)  # in minutes

            if app_id not in merged:
                merged[app_id] = {
                    "app_id": app_id,
                    "name": game.get("name", f"App {app_id}"),
                    "total_playtime_minutes": 0,
                    "owned_by_accounts": [],
                    "img_icon_url": game.get("img_icon_url", ""),
                }

            merged[app_id]["total_playtime_minutes"] += playtime
            merged[app_id]["owned_by_accounts"].append({
                "account_index": account_idx,
                "playtime_minutes": playtime,
            })

    # Sort by total playtime descending
    result = sorted(merged.values(), key=lambda g: g["total_playtime_minutes"], reverse=True)
    return result


def resolve_steam_id(id_input: str) -> str:
    """
    Accept either a 64-bit SteamID or a vanity component.
    For now returns as-is if it looks like a 64-bit ID.
    Vanity resolution handled in the route.
    """
    if id_input.isdigit() and len(id_input) == 17:
        return id_input
    return id_input