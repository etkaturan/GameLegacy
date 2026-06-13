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


async def get_game_achievements(steam_id: str, app_id: int) -> dict:
    """
    Fetch achievement progress + details for a specific game.
    Returns achievement list with names, descriptions, icons, and unlock status.
    """
    async with httpx.AsyncClient() as client:
        # Player's achievement status (with English names/descriptions)
        player_resp = await client.get(
            f"{STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/",
            params={
                "key": settings.steam_api_key,
                "steamid": steam_id,
                "appid": app_id,
                "l": "english",
            },
        )

        if player_resp.status_code != 200:
            return {
                "has_achievements": False, "achieved": 0, "total": 0,
                "achievements": [], "message": "No achievement data available."
            }

        player_data = player_resp.json().get("playerstats", {})
        if not player_data.get("success"):
            return {
                "has_achievements": False, "achieved": 0, "total": 0,
                "achievements": [],
                "message": player_data.get("error", "No achievement data available."),
            }

        player_achievements = player_data.get("achievements", [])
        if not player_achievements:
            return {
                "has_achievements": False, "achieved": 0, "total": 0,
                "achievements": [], "message": "This game has no achievements."
            }

        # Schema for icons
        schema_resp = await client.get(
            f"{STEAM_API_BASE}/ISteamUserStats/GetSchemaForGame/v2/",
            params={
                "key": settings.steam_api_key,
                "appid": app_id,
                "l": "english",
            },
        )

        icon_map: dict[str, dict] = {}
        if schema_resp.status_code == 200:
            schema_achievements = (
                schema_resp.json()
                .get("game", {})
                .get("availableGameStats", {})
                .get("achievements", [])
            )
            for a in schema_achievements:
                icon_map[a["name"]] = {
                    "icon": a.get("icon", ""),
                    "icon_gray": a.get("icongray", ""),
                }

        achievements = []
        for a in player_achievements:
            api_name = a.get("apiname", "")
            icons = icon_map.get(api_name, {})
            achievements.append({
                "api_name": api_name,
                "name": a.get("name", api_name),
                "description": a.get("description", ""),
                "achieved": a.get("achieved", 0) == 1,
                "unlock_time": a.get("unlocktime", 0),
                "icon": icons.get("icon", ""),
                "icon_gray": icons.get("icon_gray", ""),
            })

        # Achieved first (most recent unlock first), then locked
        achievements.sort(key=lambda x: (not x["achieved"], -x["unlock_time"]))
        achieved_count = sum(1 for a in achievements if a["achieved"])

        return {
            "has_achievements": True,
            "achieved": achieved_count,
            "total": len(achievements),
            "achievements": achievements,
            "message": "",
        }


def merge_achievements(results: list[dict]) -> dict:
    """
    Merge achievement progress across multiple accounts for one game.
    An achievement counts as earned if earned on ANY account,
    keeping the earliest unlock time.
    """
    valid = [r for r in results if r["has_achievements"]]
    if not valid:
        message = results[0]["message"] if results else "This game has no achievements."
        return {"has_achievements": False, "achieved": 0, "total": 0, "achievements": [], "message": message}

    merged: dict[str, dict] = {}
    for r in valid:
        for a in r["achievements"]:
            key = a["api_name"]
            if key not in merged:
                merged[key] = a.copy()
            elif a["achieved"]:
                if not merged[key]["achieved"]:
                    merged[key] = a.copy()
                elif a["unlock_time"] and a["unlock_time"] < merged[key]["unlock_time"]:
                    merged[key]["unlock_time"] = a["unlock_time"]

    achievements = list(merged.values())
    achievements.sort(key=lambda x: (not x["achieved"], -x["unlock_time"]))
    achieved_count = sum(1 for a in achievements if a["achieved"])

    return {
        "has_achievements": True,
        "achieved": achieved_count,
        "total": len(achievements),
        "achievements": achievements,
        "message": "",
    }

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