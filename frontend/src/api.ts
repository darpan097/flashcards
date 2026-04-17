export interface FlashCard {
  word: string;
  answer: string;
  difficult: number | null;
}

export interface Chapter {
  name: string;
  cardCount: number;
  cards: FlashCard[];
}

export interface SheetData {
  chapters: Record<string, Chapter>;
}

const API_BASE = '/api';

export async function fetchSheet(url: string): Promise<SheetData> {
  const response = await fetch(`${API_BASE}/sheets?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(body.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}
