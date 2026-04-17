import { useState } from 'react';
import './App.css';
import { HomeView } from './components/HomeView';
import { ChaptersView } from './components/ChaptersView';
import { FlashcardView } from './components/FlashcardView';
import type { SheetData } from './api';

type View = 'home' | 'chapters' | 'flashcard';

function App() {
  const [view, setView] = useState<View>('home');
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  // true = answer column is shown as the flashcard front (default)
  const [answerAsFlashcard, setAnswerAsFlashcard] = useState<boolean>(true);
  // null = show all difficulties; number = show only that difficulty level
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  const handleSheetLoaded = (data: SheetData) => {
    setSheetData(data);
    setView('chapters');
  };

  const handleChapterSelected = (chapterKey: string) => {
    setSelectedChapter(chapterKey);
    setView('flashcard');
  };

  const handleBackToHome = () => {
    setView('home');
    setSheetData(null);
    setSelectedChapter('');
  };

  const handleBackToChapters = () => {
    setView('chapters');
    setSelectedChapter('');
  };

  return (
    <div className="app">
      <div className="bg-gradient" />
      {view === 'home' && <HomeView onLoaded={handleSheetLoaded} />}
      {view === 'chapters' && sheetData && (
        <ChaptersView
          data={sheetData}
          onSelect={handleChapterSelected}
          onBack={handleBackToHome}
          answerAsFlashcard={answerAsFlashcard}
          onToggleFlip={() => setAnswerAsFlashcard((v) => !v)}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
        />
      )}
      {view === 'flashcard' && sheetData && (
        <FlashcardView
          chapter={sheetData.chapters[selectedChapter]}
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
