import asyncio
import json
import subprocess

import httpx

PRICE_URL = "https://steamcommunity.com/market/priceoverview/"

RARITY_COLORS = {
    "Consumer Grade": "#B0C3D9",
    "Industrial Grade": "#5E98D9",
    "Mil-Spec Grade": "#4B69FF",
    "Restricted": "#8847FF",
    "Classified": "#D32CE6",
    "Covert": "#EB4B4B",
    "Contraband": "#E4AE39",
    "Base Grade": "#B0C3D9",
    "Common": "#B0C3D9",
    "Uncommon": "#5E98D9",
    "Rare": "#4B69FF",
    "Mythical": "#8847FF",
    "Legendary": "#D32CE6",
    "Ancient": "#EB4B4B",
    "Immortal": "#E4AE39",
}


def _curl_get_json(url: str, params: dict, debug: bool = False) -> dict | None:
    query = "&".join(f"{k}={v}" for k, v in params.items())
    full_url = f"{url}?{query}"

    try:
        result = subprocess.run(
            ["curl.exe", "-s", "-w", "\nHTTP_STATUS:%{http_code}", "--compressed", full_url],
            capture_output=True,
            timeout=15,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return None

    raw = result.stdout.decode("utf-8", errors="replace")

    if "\nHTTP_STATUS:" not in raw:
        return None

    body, status_part = raw.rsplit("\nHTTP_STATUS:", 1)
    status_code = status_part.strip()

    if status_code != "200":
        return None

    try:
        return json.loads(body)
    except ValueError:
        return None


async def fetch_inventory(steam_id: str, app_id: int, debug: bool = False) -> list[dict]:
    url = f"https://steamcommunity.com/inventory/{steam_id}/{app_id}/2"

    data = await asyncio.to_thread(
        _curl_get_json,
        url,
        {"l": "english", "count": 2000},
        debug,
    )

    if not data or data.get("success") != 1:
        return []

    assets = data.get("assets", [])
    descriptions = data.get("descriptions", [])

    # =========================================================
    # FIXED MATCHING SYSTEM (Steam-safe hybrid approach)
    # =========================================================

    desc_map = {}

    for d in descriptions:
        classid = d.get("classid")
        instanceid = d.get("instanceid", "0")

        # primary key
        desc_map[(classid, instanceid)] = d

        # fallback key (important for Steam inconsistencies)
        desc_map[(classid, "0")] = d

        # extra fallback (some Steam responses behave weirdly)
        desc_map[classid] = d

    items = []

    for asset in assets:
        classid = asset.get("classid")
        instanceid = asset.get("instanceid", "0")

        # try strict match first
        desc = desc_map.get((classid, instanceid))

        # fallback 1
        if not desc:
            desc = desc_map.get((classid, "0"))

        # fallback 2 (last resort)
        if not desc:
            desc = desc_map.get(classid)

        if not desc:
            if debug:
                print("No description match:", asset)
            continue

        tags = desc.get("tags", [])
        rarity_tag = next((t for t in tags if t.get("category") == "Rarity"), None)
        type_tag = next((t for t in tags if t.get("category") == "Type"), None)
        exterior_tag = next((t for t in tags if t.get("category") == "Exterior"), None)

        rarity_name = rarity_tag.get("localized_tag_name", "") if rarity_tag else ""

        icon_hash = desc.get("icon_url")

        items.append({
            "asset_id": asset.get("assetid"),
            "class_id": classid,
            "instance_id": instanceid,
            "app_id": app_id,
            "name": desc.get("market_hash_name") or desc.get("name", "Unknown Item"),

            "icon_url": (
                f"https://community.akamai.steamstatic.com/economy/image/{icon_hash}"
                if icon_hash else None
            ),

            "marketable": bool(desc.get("marketable", 0)),
            "tradable": bool(desc.get("tradable", 0)),

            "type": type_tag.get("localized_tag_name", "") if type_tag else desc.get("type", ""),
            "rarity": rarity_name,
            "rarity_color": RARITY_COLORS.get(rarity_name, "#6B7280"),
            "exterior": exterior_tag.get("localized_tag_name", "") if exterior_tag else "",
        })

    return items


async def fetch_market_price(market_hash_name: str, app_id: int) -> float | None:
    data = await asyncio.to_thread(
        _curl_get_json,
        PRICE_URL,
        {
            "appid": app_id,
            "market_hash_name": market_hash_name.replace(" ", "%20"),
            "currency": 1,
        },
    )

    if not data or not data.get("success"):
        return None

    price_str = data.get("lowest_price") or data.get("median_price")
    if not price_str:
        return None

    try:
        cleaned = price_str.replace("$", "").replace(",", "").strip()
        return float(cleaned)
    except ValueError:
        return None


async def attach_market_prices(items: list[dict], app_id: int, max_items: int = 40) -> list[dict]:
    marketable = [i for i in items if i["marketable"]]
    unique_names = list(dict.fromkeys(i["name"] for i in marketable))[:max_items]

    price_map = {}

    for name in unique_names:
        price_map[name] = await fetch_market_price(name, app_id)
        await asyncio.sleep(1.5)

    for item in items:
        item["price_usd"] = price_map.get(item["name"])

    return items


def merge_inventories(inventories: list[list[dict]]) -> list[dict]:
    merged = []

    for account_idx, items in enumerate(inventories):
        for item in items:
            merged.append({
                **item,
                "account_index": account_idx
            })

    return merged