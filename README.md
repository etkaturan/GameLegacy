# GameLegacy

> Your gaming accounts are temporary. Your gaming identity is forever.

GameLegacy is a universal gaming identity platform that unifies a player's
entire gaming history across multiple accounts, platforms, and generations
into one permanent digital profile.

---

## Status

**Phase 1 — Complete ✅**

Multiple Steam accounts can be connected, merged into a single identity,
and persisted across sessions. Combined library, playtime, and per-game
achievements (merged across accounts) are all working with live Steam data.

See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for the full roadmap.

---

## Documentation

| Doc | Purpose |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the system fits together, folder structure, design tokens |
| [`docs/API.md`](docs/API.md) | Backend API reference |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Running locally, workflows, roadmap status |

---

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # then add your Steam API key
uvicorn app.main:app --reload
```
→ http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:5173

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, SQLite, httpx
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **APIs:** Steam Web API (Phase 1) · Riot, PSN, Xbox (Phase 4+)

---

## Project Structure

```
GameLegacy/
├── backend/
│   ├── app/
│   │   ├── api/v1/        # Route handlers
│   │   ├── core/          # Config, database
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic, Steam API calls
│   ├── data/               # SQLite DB (gitignored)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/           # Route-level pages
│       ├── features/        # Feature components, grouped by domain
│       ├── components/ui/   # Reusable UI primitives
│       ├── hooks/            # Data-fetching hooks
│       └── types/             # TypeScript types
└── docs/                       # Architecture, API, development docs
```