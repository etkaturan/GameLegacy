# GameLegacy — Development Guide

How to run the project locally, common workflows, and how to add new
features as the product grows through its phases.

---

## 1. Running the Project

### Backend
```bash
cd backend
venv\Scripts\activate          # Windows
uvicorn app.main:app --reload
```
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Database: `backend/data/gamelegacy.db` (auto-created on first run)

### Frontend
```bash
cd frontend
npm run dev
```
- App: http://localhost:5173

Run both at the same time in separate terminals.

---

## 2. Environment Variables

Backend secrets live in `backend/.env` (gitignored). Template: `backend/.env.example`.

| Variable | Description |
|---|---|
| `DEBUG` | `true`/`false` — currently unused but reserved |
| `STEAM_API_KEY` | From https://steamcommunity.com/dev/apikey |

---

## 3. Common Workflows

### Adding a new backend route
1. Add business logic to `services/<name>_service.py`
2. Add request/response shapes to `schemas/<name>.py`
3. Add the route to `api/v1/<name>.py`
4. Register the router in `main.py` (if it's a new file)
5. Test via `http://localhost:8000/docs`

### Adding a new frontend page
1. Create `pages/<Name>Page.tsx`
2. Add the route in `App.tsx`
3. Build feature components in `features/<domain>/`
4. Add a data hook in `hooks/use<Domain>.ts` if it needs backend data

### Adding a new database table
1. Add the model to `models/<name>.py` (subclass `Base`)
2. Import it in `main.py` so `Base.metadata.create_all()` picks it up
3. Add Pydantic schemas to `schemas/<name>.py`
4. Add routes in `api/v1/<name>.py`

> We don't use migrations yet (Alembic) — `create_all()` only creates tables
> that don't exist. If you change an existing model's columns, delete
> `backend/data/gamelegacy.db` during development to recreate it
> (you'll lose locally stored identities — fine for dev, NOT for production).

---

## 4. Git Workflow

We commit at each working milestone with `feat:`, `fix:`, or `chore:`
prefixes. Example history:

```
chore: project foundation — FastAPI backend + React/TS frontend
feat: landing page complete — hero, philosophy, identity, roadmap sections
feat: Steam API integration — profile, vanity resolve, multi-account combine
feat: dashboard - Steam connect flow and combined library view
feat: persistence layer - SQLite identity storage, auto-restore on load
feat: per-game achievements with merged progress across accounts
```

```bash
git add .
git commit -m "feat: short description"
git push origin main
```

---

## 5. Roadmap & Phase Status

This maps directly to `GameLegacy_PRD_v2.pdf`. Update this table as phases
progress.

| Phase | Feature | Status |
|---|---|---|
| 1 | Steam multi-account identity | ✅ Complete |
| 2 | Gaming timeline, levels/titles, profile customization | 🔜 Next |
| 3 | Inventory & digital collections | Planned |
| 4 | Multi-platform expansion (Riot, PSN, Xbox, etc.) | Planned |
| 5 | Universal hub, AI insights | Planned |
| 6 | Social gaming network | Vision |

### Phase 2 — what it likely needs
- New `models/timeline_event.py` — stores milestone events per identity
- New `features/timeline/` — timeline UI (reuses the hero's animated style)
- New `features/profile/` — player profile page with levels/titles
- Level/title calculation logic in `services/progression_service.py`

---

## 6. Design Principles (carry forward)

- **Backend never trusts the frontend** — all merging/calculation logic
  lives server-side so it's consistent regardless of client.
- **No game data is cached in SQLite** — only identity/account links.
  This keeps stats always current but means every dashboard load re-fetches
  from Steam. If this becomes slow, add a caching layer in
  `services/` (e.g. short-lived in-memory or Redis cache) rather than
  storing stale data in the main DB.
- **Reuse design tokens** — see `docs/ARCHITECTURE.md` § 5. New pages should
  feel like part of the same product, not a new theme.
- **One platform = one service file** — keeps Phase 4 (multi-platform)
  additive rather than a rewrite.