import { useState, useRef, useCallback, useEffect } from 'react';
import type { Chapter } from '../api';

interface FlashcardViewProps {
  chapter: Chapter;
  chapterKey: string;
  onBack: () => void;
  answerAsFlashcard: boolean;
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

// Duration of the first half of the flip (card scales to 0), in ms.
// Must match the CSS transition duration for .flashcard.
const HALF_FLIP_MS = 150;

export function FlashcardView({ chapter, chapterKey, onBack, answerAsFlashcard }: FlashcardViewProps) {
  const cards = useState(() => shuffle(chapter.cards))[0];
  const total = cards.length;

  const [index, setIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // true while the card is scaled to 0 (mid-flip)
  const [midFlip, setMidFlip] = useState(false);
  const flipping = useRef(false);
  const navigating = useRef(false);

  const current = cards[displayIndex];
  const frontText  = answerAsFlashcard ? current.answer : current.word;
  const backText   = answerAsFlashcard ? current.word   : current.answer;
  const frontLabel = answerAsFlashcard ? 'Answer' : 'Word';
  const backLabel  = answerAsFlashcard ? 'Word'   : 'Answer';

  // 2-phase flip: scale to 0 → swap content → scale back to 1
  const flipCard = useCallback(() => {
    if (flipping.current || navigating.current) return;
    flipping.current = true;
    setMidFlip(true);
    setTimeout(() => {
      setFlipped((f) => !f);
      setMidFlip(false);
      flipping.current = false;
    }, HALF_FLIP_MS);
  }, []);

  const goToCard = useCallback((delta: number) => {
    if (navigating.current || flipping.current) return;
    setIndex((i) => {
      const next = i + delta;
      if (next < 0 || next >= cards.length) return i;
      navigating.current = true;

      if (flipped) {
        // If revealed, flip back first before navigating
        setMidFlip(true);
        setTimeout(() => {
          setFlipped(false);
          setMidFlip(false);
          setTimeout(() => {
            setDisplayIndex(next);
            navigating.current = false;
          }, HALF_FLIP_MS);
        }, HALF_FLIP_MS);
      } else {
        setMidFlip(true);
        setTimeout(() => {
          setDisplayIndex(next);
          setMidFlip(false);
          navigating.current = false;
        }, HALF_FLIP_MS);
      }
      return next;
    });
  }, [cards.length, flipped]);

  const goToNext = useCallback(() => goToCard(1), [goToCard]);
  const goToPrev = useCallback(() => goToCard(-1), [goToCard]);

  // Keyboard shortcuts: Enter = flip, Shift+Enter = next, arrows = navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) goToNext();
        else flipCard();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipCard, goToNext, goToPrev]);

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
          className={`flashcard-wrapper${midFlip ? ' mid-flip' : ''}`}
          onClick={flipCard}
          role="button"
          tabIndex={0}
          aria-label={flipped ? 'Answer revealed, click to hide' : 'Click to reveal answer'}
        >
          {!flipped ? (
            <div className="flashcard-face flashcard-front">
              <span className="card-label">{frontLabel}</span>
              <p className="card-content">{frontText}</p>
            </div>
          ) : (
            <div className="flashcard-face flashcard-back">
              <span className="card-label">{backLabel}</span>
              <p className="card-content">{backText}</p>
            </div>
          )}
        </div>
        <p className="flip-hint">
          {flipped
            ? 'Tap again to hide · Shift+Enter for next'
            : 'Tap or press Enter to reveal'}
        </p>
      </div>

      <div className="controls-bar">
        <button
          className="ctrl-btn"
          id="btn-prev"
          onClick={goToPrev}
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
          onClick={goToNext}
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
