from fastapi import APIRouter, HTTPException
import httpx

from app.schemas.steam import (
    SteamAccountInput,
    MultiAccountInput,
    PlayerSummary,
    CombinedIdentity,
    GameEntry,
    GameAchievements,
)
from app.services.steam_service import (
    get_player_summary,
    get_owned_games,
    merge_game_libraries,
    get_game_achievements,
    merge_achievements,
)

from app.core.config import settings

router = APIRouter(prefix="/steam", tags=["Steam"])


@router.get("/profile/{steam_id}", response_model=PlayerSummary)
async def fetch_profile(steam_id: str):
    """Fetch a single Steam profile by Steam ID."""
    try:
        data = await get_player_summary(steam_id)
        if not data:
            raise HTTPException(status_code=404, detail="Steam profile not found.")
        return PlayerSummary(
            steam_id=data.get("steamid", ""),
            username=data.get("personaname", "Unknown"),
            avatar=data.get("avatarfull", ""),
            profile_url=data.get("profileurl", ""),
            time_created=data.get("timecreated"),
        )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Steam API error: {str(e)}")


@router.post("/resolve-vanity")
async def resolve_vanity(body: SteamAccountInput):
    """Resolve a Steam vanity URL name to a 64-bit Steam ID."""
    url = "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={
            "key": settings.steam_api_key,
            "vanityurl": body.steam_id,
        })
        data = response.json()
        result = data.get("response", {})
        if result.get("success") != 1:
            raise HTTPException(status_code=404, detail="Vanity URL not found.")
        return {"steam_id": result.get("steamid")}


@router.post("/combine", response_model=CombinedIdentity)
async def combine_accounts(body: MultiAccountInput):
    """
    Combine multiple Steam accounts into one unified gaming identity.
    Accepts a list of Steam IDs and returns merged library + stats.
    """
    if not body.steam_ids:
        raise HTTPException(status_code=400, detail="No Steam IDs provided.")
    if len(body.steam_ids) > 6:
        raise HTTPException(status_code=400, detail="Maximum 6 accounts supported.")

    # Fetch all profiles and libraries in parallel
    profiles = []
    libraries = []

    for steam_id in body.steam_ids:
        try:
            summary = await get_player_summary(steam_id)
            games = await get_owned_games(steam_id)

            if not summary:
                raise HTTPException(status_code=404, detail=f"Profile not found: {steam_id}")

            profiles.append(PlayerSummary(
                steam_id=summary.get("steamid", ""),
                username=summary.get("personaname", "Unknown"),
                avatar=summary.get("avatarfull", ""),
                profile_url=summary.get("profileurl", ""),
                time_created=summary.get("timecreated"),
            ))
            libraries.append(games)

        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Steam API error for {steam_id}: {str(e)}")

    # Merge libraries
    merged = merge_game_libraries(libraries)

    # Build response
    total_minutes = sum(g["total_playtime_minutes"] for g in merged)
    total_hours = round(total_minutes / 60, 1)
    total_games = sum(len(lib) for lib in libraries)

    library = [
        GameEntry(
            app_id=g["app_id"],
            name=g["name"],
            total_playtime_minutes=g["total_playtime_minutes"],
            total_playtime_hours=round(g["total_playtime_minutes"] / 60, 1),
            owned_by_accounts=g["owned_by_accounts"],
            img_icon_url=g["img_icon_url"],
        )
        for g in merged
    ]

    return CombinedIdentity(
        accounts=profiles,
        total_games=total_games,
        unique_games=len(merged),
        total_playtime_hours=total_hours,
        library=library,
    )

@router.get("/achievements/{steam_id}/{app_id}", response_model=GameAchievements)
async def fetch_achievements(steam_id: str, app_id: int):
    """Fetch achievement progress for a single account + game."""
    data = await get_game_achievements(steam_id, app_id)
    return data


@router.post("/achievements/combined/{app_id}", response_model=GameAchievements)
async def fetch_combined_achievements(app_id: int, body: MultiAccountInput):
    """Fetch merged achievement progress across multiple accounts for one game."""
    if not body.steam_ids:
        raise HTTPException(status_code=400, detail="No Steam IDs provided.")

    results = [await get_game_achievements(sid, app_id) for sid in body.steam_ids]
    return merge_achievements(results)