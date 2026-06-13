# GameLegacy — Architecture

This document explains how GameLegacy is structured, how data flows through
the system, and the conventions used throughout the codebase. Read this
before adding new features.

---

## 1. High-Level Overview

GameLegacy is a two-part application:


┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐

│   React + TS     │  HTTP   │   FastAPI         │  HTTP   │   Steam Web API  │

│   (frontend)     │ ──────► │   (backend)       │ ──────► │   (external)     │

│   localhost:5173 │ ◄────── │   localhost:8000  │ ◄────── │                  │

└─────────────────┘         └────────┬──────────┘         └─────────────────┘

│

▼

┌──────────────────┐

│  SQLite           │

│  backend/data/     │

│  gamelegacy.db     │

└──────────────────┘


- The **frontend** never talks to the Steam API directly — everything goes
  through our backend. This keeps the API key server-side and lets us
  add caching, merging, and database logic without touching the frontend.
- The **backend** is the only thing that knows about external platform APIs
  (Steam now, Riot/PSN/Xbox in later phases).
- **SQLite** stores the permanent "Identity" record — which accounts belong
  to which GameLegacy identity. It does NOT cache game/achievement data;
  that's always fetched live from Steam (so it's always current).

---

## 2. Backend Structure


backend/

├── app/

│   ├── main.py              # FastAPI app, CORS, router registration

│   ├── core/

│   │   ├── config.py        # Settings (.env loading)

│   │   └── database.py      # SQLAlchemy engine, session, Base

│   ├── models/               # SQLAlchemy ORM models (database tables)

│   │   └── identity.py       # Identity, ConnectedAccount

│   ├── schemas/               # Pydantic models (request/response shapes)

│   │   ├── steam.py

│   │   └── identity.py

│   ├── services/               # Business logic, external API calls

│   │   └── steam_service.py    # All Steam Web API calls + merge logic

│   ├── api/v1/                  # Route handlers (thin — call services)

│   │   ├── steam.py

│   │   └── identity.py

│   └── utils/                    # Shared helpers (currently empty)

├── data/                          # SQLite DB (gitignored, personal data)

├── .env                           # Secrets (gitignored)

└── requirements.txt

### Layer responsibilities

| Layer | Responsibility | Example |
|---|---|---|
| `api/v1/*.py` | Route definitions, request validation, calling services | `POST /steam/combine` |
| `services/*.py` | Business logic, talking to external APIs, data merging | `merge_game_libraries()` |
| `models/*.py` | Database tables (SQLAlchemy `Base` subclasses) | `Identity`, `ConnectedAccount` |
| `schemas/*.py` | Pydantic models — define API request/response shapes | `CombinedIdentity` |
| `core/*.py` | App-wide config, DB connection | `settings`, `get_db()` |

**Rule of thumb:** routes should stay thin. If a route handler is doing
calculations or API calls directly, that logic probably belongs in
`services/`.

---

## 3. Frontend Structure


frontend/src/

├── App.tsx                  # Routes (React Router)

├── main.tsx                 # Entry point

├── index.css                # Tailwind + global styles (cursor, animations)

├── pages/                     # One file per route

│   ├── LandingPage.tsx

│   └── DashboardPage.tsx

├── features/                   # Feature-specific components, grouped by domain

│   ├── landing/                 # Landing page sections

│   │   ├── HeroSection.tsx

│   │   ├── PhilosophySection.tsx

│   │   ├── IdentitySection.tsx

│   │   ├── RoadmapSection.tsx

│   │   ├── WaitlistSection.tsx

│   │   └── FooterSection.tsx

│   └── dashboard/                # Dashboard feature components

│       ├── ConnectSteam.tsx

│       ├── IdentityDashboard.tsx

│       └── AchievementsPanel.tsx

├── components/ui/                 # Reusable, generic UI primitives

│   ├── Button.tsx

│   ├── Navbar.tsx

│   ├── Layout.tsx

│   ├── Cursor.tsx

│   └── LoadingScreen.tsx

├── hooks/                            # Custom React hooks (data fetching, state)

│   ├── useSteam.ts

│   ├── useIdentity.ts

│   └── useAchievements.ts

├── types/                              # TypeScript types

│   ├── index.ts                         # Global types (Player, Platform, etc.)

│   └── steam.ts                          # Steam-specific API types

└── utils/

└── api.ts                             # Axios instance (base URL config)


### Conventions

- **`pages/`** — top-level route components only. They orchestrate state and
  decide which feature components to render. Minimal styling here.
- **`features/<domain>/`** — components specific to one feature area. A new
  domain (e.g. `features/timeline/` for Phase 2) gets its own folder.
- **`components/ui/`** — generic, reusable across features. If you find
  yourself copy-pasting a styled element, promote it here.
- **`hooks/`** — all `axios` calls live inside hooks, never directly inside
  components. This keeps components focused on rendering.
- **`types/`** — one file per API domain (`steam.ts`, later `riot.ts`, etc.)
  plus `index.ts` for shared/global types.

---

## 4. Data Flow Example — "Combine Accounts"

This is the core flow of Phase 1, and a good template for understanding how
a request moves through the system:

1. User enters Steam ID(s) in `ConnectSteam.tsx`
2. `useSteam().combineAccounts(steamIds)` → `POST /api/v1/steam/combine`
3. Route handler `combine_accounts()` in `api/v1/steam.py`:
   - Calls `get_player_summary()` and `get_owned_games()` per account
     (in `services/steam_service.py`)
   - Calls `merge_game_libraries()` to combine duplicate games across accounts
   - Returns a `CombinedIdentity` (Pydantic schema)
4. Frontend receives `CombinedIdentity`, stores it in `DashboardPage` state
5. `saveIdentity()` persists the Steam IDs to SQLite via
   `POST /api/v1/identity` (or `PUT` if updating)
6. The returned `identity.id` is stored in `localStorage` so the page can
   restore the identity on reload (`fetchIdentity()` → `combineAccounts()`)

---

## 5. Design System

The visual identity is defined as Tailwind tokens in `frontend/tailwind.config.js`:

| Token | Value | Usage |
|---|---|---|
| `canvas` | `#0D0D12` | Page background |
| `surface` | `#13131A` | Cards, panels |
| `surface2` | `#1A1A26` | Nested/elevated panels |
| `border` | `#2A2A3E` | Borders, dividers |
| `gold` | `#C9A84C` | Primary accent — "legacy", CTAs, highlights |
| `gold-dim` | `#8A6F2E` | Subtle gold (focus states) |
| `indigo` | `#6366F1` | Secondary accent — competitive/tech elements |
| `muted` | `#6B7280` | Secondary text, labels |
| `body` | `#9CA3AF` | Body text |

Fonts:
- `font-sans` → Space Grotesk (headings, UI labels)
- `font-body` → Inter (paragraphs)
- `font-mono` → JetBrains Mono (stats, numbers, technical labels)

**New UI should reuse these tokens** rather than introducing new colors —
this is what keeps the "unique but cohesive" look across pages.

---

## 6. Adding a New Platform (Future Phases)

When adding Riot/PSN/Xbox/etc. (Phase 4), follow the Steam pattern:

1. `services/<platform>_service.py` — API calls + merge logic
2. `schemas/<platform>.py` — request/response models
3. `api/v1/<platform>.py` — routes, registered in `main.py`
4. `types/<platform>.ts` — frontend types
5. `hooks/use<Platform>.ts` — frontend data fetching
6. `features/dashboard/` — UI components to display the new data

The `Identity` / `ConnectedAccount` models already support a `platform`
field, so multi-platform accounts can attach to the same identity without
schema changes.
