import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Chapter } from '../api';

interface FlashcardViewProps {
  chapter: Chapter;
  chapterKey: string;
  onBack: () => void;
}

/** Fisher-Yates shuffle */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function FlashcardView({ chapter, chapterKey, onBack }: FlashcardViewProps) {
  const cards = useMemo(() => shuffle(chapter.cards), [chapter]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = cards[index];
  const total = cards.length;

  const flipCard = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  const nextCard = useCallback(() => {
    if (index < total - 1) {
      setFlipped(false);
      // Small delay so flip-back animation plays before content changes
      setTimeout(() => setIndex((i) => i + 1), 150);
    }
  }, [index, total]);

  const prevCard = useCallback(() => {
    if (index > 0) {
      setFlipped(false);
      setTimeout(() => setIndex((i) => i - 1), 150);
    }
  }, [index]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextCard();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevCard();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipCard, nextCard, prevCard]);

  return (
    <section className="view view-flashcard">
      <header className="top-bar">
        <button className="back-btn" id="btn-back-chapters" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2>Chapter {chapterKey}</h2>
        <span className="card-counter">{index + 1} / {total}</span>
      </header>

      <div className="flashcard-area">
        <div
          className={`flashcard-wrapper ${flipped ? 'flipped' : ''}`}
          onClick={flipCard}
          role="button"
          tabIndex={0}
          aria-label={flipped ? 'Answer revealed, click to hide' : 'Click to reveal answer'}
        >
          <div className="flashcard">
            <div className="flashcard-front">
              <span className="card-label">Word</span>
              <p className="card-content">{current.word}</p>
            </div>
            <div className="flashcard-back">
              <span className="card-label">Answer</span>
              <p className="card-content">{current.answer}</p>
            </div>
          </div>
        </div>
        <p className="flip-hint">
          {flipped ? 'Tap again to hide answer' : 'Tap the card to reveal the answer'}
        </p>
      </div>

      <div className="controls-bar">
        <button
          className="ctrl-btn"
          id="btn-prev"
          onClick={prevCard}
          disabled={index === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Prev</span>
        </button>
        <button
          className={`ctrl-btn primary ${index === total - 1 ? 'done' : ''}`}
          id="btn-next"
          onClick={nextCard}
          disabled={index === total - 1}
        >
          <span>{index === total - 1 ? 'Done!' : 'Next'}</span>
          {index < total - 1 && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
