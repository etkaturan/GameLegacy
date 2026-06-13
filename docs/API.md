# GameLegacy — API Reference

Base URL: `http://localhost:8000`
All endpoints are prefixed with `/api/v1` (except `/` and `/health`).

Interactive docs (Swagger UI): `http://localhost:8000/docs`

---

## Health

### `GET /`
Returns API status.
```json
{ "status": "ok", "service": "GameLegacy API", "version": "0.1.0" }
```

### `GET /health`
```json
{ "status": "healthy" }
```

---

## Steam

### `GET /api/v1/steam/profile/{steam_id}`
Fetch a single Steam profile.

**Params:** `steam_id` — 64-bit Steam ID (17 digits)

**Response:**
```json
{
  "steam_id": "76561198809924470",
  "username": "Malamut",
  "avatar": "https://avatars.steamstatic.com/...jpg",
  "profile_url": "https://steamcommunity.com/profiles/76561198809924470/",
  "time_created": 1517216141
}
```

---

### `POST /api/v1/steam/resolve-vanity`
Resolve a Steam vanity URL name (e.g. `steamcommunity.com/id/malamut`) to a
64-bit Steam ID.

**Body:**
```json
{ "steam_id": "malamut" }
```

**Response:**
```json
{ "steam_id": "76561198809924470" }
```

---

### `POST /api/v1/steam/combine`
Combine 1–6 Steam accounts into a single merged identity. Duplicate games
(owned on multiple accounts) are merged — playtime is summed, ownership is
tracked per account.

**Body:**
```json
{ "steam_ids": ["76561198809924470", "76561198XXXXXXXXX"] }
```

**Response:** `CombinedIdentity`
```json
{
  "accounts": [ /* PlayerSummary[] */ ],
  "total_games": 85,
  "unique_games": 85,
  "total_playtime_hours": 2052.4,
  "library": [
    {
      "app_id": 730,
      "name": "Counter-Strike 2",
      "total_playtime_minutes": 62769,
      "total_playtime_hours": 1046.2,
      "owned_by_accounts": [
        { "account_index": 0, "playtime_minutes": 62769 }
      ],
      "img_icon_url": "8dbc71957312bbd3baea65848b545be9eae2a355"
    }
  ]
}
```

> `owned_by_accounts[].account_index` refers to the position in the
> `steam_ids` array passed in the request.

---

### `GET /api/v1/steam/achievements/{steam_id}/{app_id}`
Fetch achievement progress for **one** account + game.

**Response:** `GameAchievements`
```json
{
  "has_achievements": true,
  "achieved": 12,
  "total": 167,
  "achievements": [
    {
      "api_name": "WIN_BOMB_PLANT",
      "name": "Hostage Crisis",
      "description": "Win a round in...",
      "achieved": true,
      "unlock_time": 1700000000,
      "icon": "https://.../icon.jpg",
      "icon_gray": "https://.../icon_gray.jpg"
    }
  ],
  "message": ""
}
```

If the game has no achievements, `has_achievements: false` and `message`
explains why.

---

### `POST /api/v1/steam/achievements/combined/{app_id}`
Same as above, but merges achievement progress across multiple accounts —
an achievement is "achieved" if earned on ANY account (earliest unlock time
kept).

**Body:**
```json
{ "steam_ids": ["76561198809924470", "76561198XXXXXXXXX"] }
```

**Response:** same shape as `GameAchievements` above.

---

## Identity (Persistence)

The `Identity` is the permanent GameLegacy record. It stores which platform
accounts are connected — not game data (that's always fetched live).

### `POST /api/v1/identity`
Create a new identity with an initial set of Steam accounts.

**Body:**
```json
{ "steam_ids": ["76561198809924470"] }
```

**Response:** `IdentityOut`
```json
{
  "id": "f3a1c8e2-...",
  "created_at": "2026-06-14T12:00:00",
  "accounts": [
    { "platform": "steam", "platform_id": "76561198809924470" }
  ]
}
```

---

### `GET /api/v1/identity/{identity_id}`
Fetch an identity and its connected accounts.

**Response:** `IdentityOut` (same shape as above)

---

### `PUT /api/v1/identity/{identity_id}`
Replace the full set of connected accounts for an identity (used when adding
a new account).

**Body:**
```json
{ "steam_ids": ["76561198809924470", "76561198XXXXXXXXX"] }
```

**Response:** `IdentityOut`

---

## Error Responses

All errors follow FastAPI's default shape:
```json
{ "detail": "Human-readable error message." }
```

Common status codes:
- `400` — invalid input (e.g. empty `steam_ids`, too many accounts)
- `404` — Steam profile / identity not found
- `502` — Steam API error (key invalid, rate limited, Steam down)