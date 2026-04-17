# Flashcards

Learn any language with flashcards powered by Google Sheets.

## Quick Start (Docker)

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Local Development

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
npm run dev
```

The frontend dev server proxies `/api` requests to `http://localhost:8000`.

## Google Sheet Format

Your Google Sheet must be **shared publicly** ("Anyone with the link → Viewer") and have these columns:

| Column 1 | Column 2 | Column 3 |
|-----------|----------|----------|
| Chapter   | Word     | Answer   |

Example: `2.02`, `de schoonmaakster`, `the cleaning lady`

## Tech Stack

- **Backend**: Python 3.12, FastAPI, httpx, uv
- **Frontend**: React 19, TypeScript, Vite
- **Containerization**: Docker, nginx
