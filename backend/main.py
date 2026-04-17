"""Flashcards API — Fetches and parses Google Sheets data for flashcard learning."""

import csv
import io
import re
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Flashcards API", version="1.0.0")

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_sheet_id(url: str) -> str:
    """Extract the Google Sheet ID from various URL formats."""
    patterns = [
        r"/spreadsheets/d/([a-zA-Z0-9-_]+)",
        r"^([a-zA-Z0-9-_]+)$",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract sheet ID from URL: {url}")


def parse_csv_data(csv_text: str) -> dict[str, Any]:
    """Parse CSV data from Google Sheets into structured chapters.

    Expected format (first 3 columns): chapter_number, word, answer
    Extra columns and empty rows are ignored.
    """
    reader = csv.reader(io.StringIO(csv_text))
    rows = list(reader)

    if not rows:
        raise ValueError("Sheet is empty")

    # Skip header row (first row)
    data_rows = rows[1:]

    chapters: dict[str, list[dict[str, str]]] = {}

    for row in data_rows:
        # Need at least 3 columns
        if len(row) < 3:
            continue

        chapter = row[0].strip()
        word = row[1].strip()
        answer = row[2].strip()

        # Skip rows with empty chapter, word, or answer
        if not chapter or not word or not answer:
            continue

        if chapter not in chapters:
            chapters[chapter] = []

        chapters[chapter].append({"word": word, "answer": answer})

    if not chapters:
        raise ValueError("No valid flashcard data found in the sheet")

    # Build structured response
    result: dict[str, Any] = {"chapters": {}}
    for chapter_key in sorted(chapters.keys()):
        cards = chapters[chapter_key]
        result["chapters"][chapter_key] = {
            "name": f"Chapter {chapter_key}",
            "cardCount": len(cards),
            "cards": cards,
        }

    return result


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/sheets")
async def fetch_sheet(url: str = Query(..., description="Google Sheets URL or sheet ID")) -> dict[str, Any]:
    """Fetch and parse a Google Sheet into flashcard data."""
    try:
        sheet_id = extract_sheet_id(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv"

    async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
        try:
            response = await client.get(csv_url)
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Failed to reach Google Sheets: {e}")

        if response.status_code == 401:
            raise HTTPException(
                status_code=403,
                detail="Sheet is not publicly accessible. Please share it as 'Anyone with the link'.",
            )
        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Google Sheets returned status {response.status_code}",
            )

    try:
        data = parse_csv_data(response.text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return data
