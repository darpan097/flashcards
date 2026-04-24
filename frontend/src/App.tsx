import { useState } from 'react';
import './App.css';
import { HomeView } from './components/HomeView';
import { ChaptersView } from './components/ChaptersView';
import { FlashcardView } from './components/FlashcardView';
import type { SheetData, Chapter } from './api';

type View = 'home' | 'chapters' | 'flashcard';

function App() {
  const [view, setView] = useState<View>('home');
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  // true = answer column is shown as the flashcard front (default)
  const [answerAsFlashcard, setAnswerAsFlashcard] = useState<boolean>(true);
  // null = show all difficulties; number = show only that difficulty level
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  const handleSheetLoaded = (data: SheetData) => {
    setSheetData(data);
    setView('chapters');
  };

  const handleChapterSelected = (chapterKey: string) => {
    if (!sheetData) return;
    setSelectedChapter(chapterKey);
    setActiveChapter(sheetData.chapters[chapterKey]);
    setView('flashcard');
  };

  const handleAllChapters = () => {
    if (!sheetData) return;
    // Merge all cards from every chapter into one synthetic chapter
    const allCards = Object.values(sheetData.chapters).flatMap((ch) => ch.cards);
    setSelectedChapter('All');
    setActiveChapter({ name: 'All Chapters', cardCount: allCards.length, cards: allCards });
    setView('flashcard');
  };

  const handleBackToHome = () => {
    setView('home');
    setSheetData(null);
    setSelectedChapter('');
    setActiveChapter(null);
  };

  const handleBackToChapters = () => {
    setView('chapters');
    setSelectedChapter('');
    setActiveChapter(null);
  };

  return (
    <div className="app">
      <div className="bg-gradient" />
      {view === 'home' && <HomeView onLoaded={handleSheetLoaded} />}
      {view === 'chapters' && sheetData && (
        <ChaptersView
          data={sheetData}
          onSelect={handleChapterSelected}
          onSelectAll={handleAllChapters}
          onBack={handleBackToHome}
          answerAsFlashcard={answerAsFlashcard}
          onToggleFlip={() => setAnswerAsFlashcard((v) => !v)}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
        />
      )}
      {view === 'flashcard' && activeChapter && (
        <FlashcardView
          chapter={activeChapter}
          chapterKey={selectedChapter}
          onBack={handleBackToChapters}
          answerAsFlashcard={answerAsFlashcard}
          difficultyFilter={difficultyFilter}
        />
      )}
    </div>
  );
}

export default App;
