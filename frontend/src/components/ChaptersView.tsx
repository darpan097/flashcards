import { useMemo } from 'react';
import type { SheetData } from '../api';

interface ChaptersViewProps {
  data: SheetData;
  onSelect: (chapterKey: string) => void;
  onBack: () => void;
  answerAsFlashcard: boolean;
  onToggleFlip: () => void;
  difficultyFilter: number | null;
  onDifficultyChange: (v: number | null) => void;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  0: '0 – Easy',
  1: '1 – Medium',
  2: '2 – Hard',
  3: '3 – Expert',
};

export function ChaptersView({
  data,
  onSelect,
  onBack,
  answerAsFlashcard,
  onToggleFlip,
  difficultyFilter,
  onDifficultyChange,
}: ChaptersViewProps) {
  const chapterKeys = Object.keys(data.chapters);

  // Collect all unique difficulty values present in the entire sheet
  const availableDifficulties = useMemo(() => {
    const seen = new Set<number>();
    for (const chapter of Object.values(data.chapters)) {
      for (const card of chapter.cards) {
        if (card.difficult !== null && card.difficult !== undefined) {
          seen.add(card.difficult);
        }
      }
    }
    return Array.from(seen).sort((a, b) => a - b);
  }, [data]);

  // For each chapter, count how many cards match the current filter
  const filteredCardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of chapterKeys) {
      const cards = data.chapters[key].cards;
      counts[key] = difficultyFilter === null
        ? cards.length
        : cards.filter((c) => c.difficult === difficultyFilter).length;
    }
    return counts;
  }, [chapterKeys, data, difficultyFilter]);

  const hasDifficultyData = availableDifficulties.length > 0;

  return (
    <section className="view view-chapters">
      <header className="top-bar">
        <button className="back-btn" id="btn-back-home" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2>Select a Chapter</h2>
        <div className="top-bar-actions">
          {hasDifficultyData && (
            <select
              id="difficulty-select"
              className="difficulty-select"
              value={difficultyFilter === null ? '' : String(difficultyFilter)}
              onChange={(e) =>
                onDifficultyChange(e.target.value === '' ? null : Number(e.target.value))
              }
            >
              <option value="">All levels</option>
              {availableDifficulties.map((d) => (
                <option key={d} value={String(d)}>
                  {DIFFICULTY_LABELS[d] ?? `Level ${d}`}
                </option>
              ))}
            </select>
          )}
          <button
            id="btn-toggle-flip"
            className={`flip-toggle ${answerAsFlashcard ? 'active' : ''}`}
            onClick={onToggleFlip}
            title={answerAsFlashcard ? 'Showing: Answer → Front' : 'Showing: Word → Front'}
          >
            <span className="flip-toggle-icon">⇄</span>
            <span className="flip-toggle-label">
              {answerAsFlashcard ? 'Answer as card' : 'Word as card'}
            </span>
          </button>
        </div>
      </header>

      <div className="chapters-grid">
        {chapterKeys.map((key) => {
          const chapter = data.chapters[key];
          const count = filteredCardCounts[key];
          const dimmed = count === 0;
          return (
            <button
              key={key}
              className={`chapter-card ${dimmed ? 'dimmed' : ''}`}
              onClick={() => !dimmed && onSelect(key)}
              disabled={dimmed}
            >
              <span className="chapter-number">{key}</span>
              <span className="chapter-name">{chapter.name}</span>
              <span className="chapter-count">{count} cards</span>
              {difficultyFilter !== null && (
                <span className="chapter-difficulty-badge">
                  Level {difficultyFilter}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
