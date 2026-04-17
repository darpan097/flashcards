import { useState, useEffect } from 'react';
import { fetchSheet } from '../api';
import type { SheetData } from '../api';

const STORAGE_KEY = 'flashcards_sheet_url';

interface HomeViewProps {
  onLoaded: (data: SheetData) => void;
}

export function HomeView({ onLoaded }: HomeViewProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill with last used URL
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUrl(saved);
  }, []);

  const handleLoad = async () => {
    if (!url.trim()) {
      setError('Please enter a Google Sheets URL');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await fetchSheet(url.trim());
      localStorage.setItem(STORAGE_KEY, url.trim());
      onLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLoad();
  };

  const handleClear = () => {
    setUrl('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasSavedUrl = !!localStorage.getItem(STORAGE_KEY);

  return (
    <section className="view view-home">
      <div className="home-container">
        <div className="logo-area">
          <div className="logo-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="10" width="28" height="20" rx="3" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              <rect x="14" y="18" width="28" height="20" rx="3" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            </svg>
          </div>
          <h1>Flashcards</h1>
          <p className="tagline">Learn any language with flashcards powered by Google Sheets</p>
        </div>

        <div className="input-card">
          <div className="input-label-row">
            <label htmlFor="sheet-url">Google Sheets Link</label>
            {hasSavedUrl && (
              <button className="clear-url-btn" onClick={handleClear} title="Clear saved URL">
                Clear saved
              </button>
            )}
          </div>
          <div className="input-row">
            <input
              type="url"
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              autoComplete="off"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              id="btn-load"
              onClick={handleLoad}
              disabled={loading}
              className={loading ? 'loading' : ''}
            >
              {loading ? (
                <span className="btn-loader">
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                  </svg>
                </span>
              ) : (
                <span className="btn-text">Load</span>
              )}
            </button>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="sheet-hint">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              Sheet must be shared as <strong>"Anyone with the link"</strong>.
              Expected columns: <em>Chapter, Word, Answer</em>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
