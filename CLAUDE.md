# Flashcards — Claude Context

A flashcard learning app powered by Google Sheets. Users paste a public Google Sheet URL, pick a chapter, and flip through cards.

## Architecture

```
flashcards/
├── backend/          # Python 3.12, FastAPI, uv
│   └── main.py       # Single-file API: /api/health, /api/sheets
├── frontend/         # React 19, TypeScript, Vite
│   └── src/          # All UI components and logic
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
└── nginx.conf        # Reverse proxies /api → backend:8000 in prod
```

## Dev Commands

### Backend
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # Vite dev server on :5173, proxies /api → localhost:8000
```

### Docker (full stack)
```bash
docker compose up --build   # backend :8000, frontend :3000
```

## Google Sheet Format

The sheet must be **publicly shared** ("Anyone with the link → Viewer").

| Column 1 | Column 2 | Column 3 | Column 4 (optional) |
|----------|----------|----------|---------------------|
| chapter  | word     | answer   | difficulty (0–3 int) |

- Rows with blank chapter/word/answer are skipped.
- Difficulty `null` means unrated; `0`–`3` maps to easy → hard.

## API

| Endpoint | Description |
|---|---|
| `GET /api/health` | Liveness check → `{"status": "ok"}` |
| `GET /api/sheets?url=<url>` | Fetch & parse a Google Sheet into chapters/cards |

The `url` param accepts a full Google Sheets URL or just the sheet ID. The backend converts it to the CSV export URL internally.

## Key Frontend Features

- 3D card flip animation (front = word, back = answer)
- Column flip toggle (swap which side shows word vs. answer)
- Keyboard shortcuts: `→`/`←` navigate cards, `Space` reveals answer
- Chapter selector and difficulty filter
- Google Sheets URL persisted in `localStorage`

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.12, FastAPI, httpx, uv |
| Frontend | React 19, TypeScript, Vite |
| Containers | Docker, nginx |

## Conventions

- **Backend**: Keep all logic in `main.py` unless the file grows significantly. Use type hints throughout. Raise `HTTPException` for all API errors.
- **Frontend**: TypeScript strict mode. Components live under `src/`. Avoid external UI libraries — styles are custom CSS.
- **No `.env` files**: Configuration (e.g. sheet URL) is passed at runtime via the UI, not environment variables.
