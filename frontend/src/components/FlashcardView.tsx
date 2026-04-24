import { useState, useCallback, useEffect } from 'react';
import type { Chapter } from '../api';

interface FlashcardViewProps {
  chapter: Chapter;
  chapterKey: string;
  onBack: () => void;
  answerAsFlashcard: boolean;
  difficultyFilter: number | null;
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

// Animation durations — must match the CSS values below
const FLIP_HALF_MS  = 150; // scaleX → 0, then swap, then scaleX → 1
const NAV_EXIT_MS   = 160; // slide-out keyframe duration
const NAV_ENTER_MS  = 200; // slide-in keyframe duration (just needs to play; we don't block)

type AnimState =
  | 'idle'
  | 'flip-out'         // scaleX to 0 (flip reveal)
  | 'nav-exit-next'    // slide out to the left  (going forward)
  | 'nav-exit-prev'    // slide out to the right (going back)
  | 'nav-enter-next'   // slide in from the right
  | 'nav-enter-prev';  // slide in from the left

export function FlashcardView({ chapter, chapterKey, onBack, answerAsFlashcard, difficultyFilter }: FlashcardViewProps) {
  const [cards] = useState(() => {
    const filtered = difficultyFilter === null
      ? chapter.cards
      : chapter.cards.filter((c) => c.difficult === difficultyFilter);
    return shuffle(filtered);
  });
  const total = cards.length;

  // `index` drives the visible counter; `displayIndex` drives the card content.
  // They diverge during navigation so the counter updates immediately while
  // the old content is still visible during the exit animation.
  const [index, setIndex]               = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [flipped, setFlipped]           = useState(false);
  const [animState, setAnimState]       = useState<AnimState>('idle');

  const current    = cards[displayIndex];
  const frontText  = answerAsFlashcard ? current.answer : current.word;
  const backText   = answerAsFlashcard ? current.word   : current.answer;
  const frontLabel = answerAsFlashcard ? 'Answer' : 'Word';
  const backLabel  = answerAsFlashcard ? 'Word'   : 'Answer';

  // ── Flip (reveal / hide answer) ──────────────────────────────────────────
  // Animation: scaleX 1→0 (flip-out), swap content, scaleX 0→1 (transition back)
  const flipCard = useCallback(() => {
    if (animState !== 'idle') return;
    setAnimState('flip-out');
    setTimeout(() => {
      setFlipped((f) => !f);
      setAnimState('idle'); // triggers transition back to scaleX(1)
    }, FLIP_HALF_MS);
  }, [animState]);

  // ── Navigate (next / prev) ────────────────────────────────────────────────
  // Animation: slide-exit → swap content → slide-enter → idle
  const goToCard = useCallback((delta: number) => {
    if (animState !== 'idle') return;
    const next = index + delta;
    if (next < 0 || next >= total) return;

    const exitState: AnimState = delta > 0 ? 'nav-exit-next' : 'nav-exit-prev';
    const enterState: AnimState = delta > 0 ? 'nav-enter-next' : 'nav-enter-prev';

    setIndex(next);           // counter updates immediately
    setAnimState(exitState);

    setTimeout(() => {
      setFlipped(false);      // always start new card face-up
      setDisplayIndex(next);  // swap content at the mid-point (while opacity is 0)
      setAnimState(enterState);

      setTimeout(() => {
        setAnimState('idle');
      }, NAV_ENTER_MS);
    }, NAV_EXIT_MS);
  }, [animState, index, total]);

  const goToNext = useCallback(() => goToCard(1),  [goToCard]);
  const goToPrev = useCallback(() => goToCard(-1), [goToCard]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  // Enter = flip · Shift+Enter = next · ←/↑ = prev · →/↓ = next
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

  // Map animState to a CSS class on the wrapper
  const wrapperClass = animState === 'idle' ? 'flashcard-wrapper' : `flashcard-wrapper ${animState}`;

  return (
    <section className="view view-flashcard">
      <header className="top-bar">
        <button className="back-btn" id="btn-back-chapters" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2>{chapterKey === 'All' ? 'All Chapters' : `Chapter ${chapterKey}`}</h2>
        <span className="card-counter">{index + 1} / {total}</span>
      </header>

      <div className="flashcard-area">
        <div
          className={wrapperClass}
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
