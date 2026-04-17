import type { SheetData } from '../api';

interface ChaptersViewProps {
  data: SheetData;
  onSelect: (chapterKey: string) => void;
  onBack: () => void;
  answerAsFlashcard: boolean;
  onToggleFlip: () => void;
}

export function ChaptersView({ data, onSelect, onBack, answerAsFlashcard, onToggleFlip }: ChaptersViewProps) {
  const chapterKeys = Object.keys(data.chapters);

  return (
    <section className="view view-chapters">
      <header className="top-bar">
        <button className="back-btn" id="btn-back-home" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2>Select a Chapter</h2>
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
      </header>

      <div className="chapters-grid">
        {chapterKeys.map((key) => {
          const chapter = data.chapters[key];
          return (
            <button
              key={key}
              className="chapter-card"
              onClick={() => onSelect(key)}
            >
              <span className="chapter-number">{key}</span>
              <span className="chapter-name">{chapter.name}</span>
              <span className="chapter-count">{chapter.cardCount} cards</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
