import { useEffect, useState } from 'react';
import Head from 'next/head';

function readStoredProfile() {
  try {
    const a = localStorage.getItem('profile');
    if (a) return JSON.parse(a);
  } catch {}
  try {
    const b = sessionStorage.getItem('profile');
    if (b) return JSON.parse(b);
  } catch {}
  return null;
}

export default function HomePage() {
  const [p, setP] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchBusy, setSearchBusy] = useState(false);

  useEffect(() => {
    // если пользователь вышел — на главную
    if (sessionStorage.getItem('logged_out') === '1') {
      window.location.replace('/');
      return;
    }
    const cached = readStoredProfile();
    if (!cached) {
      // нет профиля — на экран логина
      window.location.replace('/');
      return;
    }
    setP(cached);
  }, []);

  if (!p) {
    return (
      <div className="container">
        <div className="hero" style={{maxWidth:560, textAlign:'center'}}>Загружаем меню…</div>
      </div>
    );
  }

  const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Гость';
  const avatar = p.photo_url || '/placeholder.png';
  const at = p.username ? '@' + p.username : '';

  // Функция поиска пользователей
  async function handleSearch(query) {
    const trimmed = (query || '').replace(/^@/, '').trim();
    if (!trimmed) { 
      setSearchResults([]); 
      return; 
    }
    
    try {
      setSearchBusy(true);
      // Имитируем поиск - в реальном проекте тут будет API
      setTimeout(() => {
        const mockResults = [
          {
            username: trimmed,
            name: `User ${trimmed}`,
            avatar: '/placeholder.png',
            id: Math.random()
          }
        ];
        setSearchResults(mockResults);
        setSearchBusy(false);
      }, 500);
    } catch (error) {
      console.error('Search error:', error);
      setSearchBusy(false);
    }
  }

  // Обработка изменений в поисковой строке
  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => handleSearch(searchQuery), 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <>
      <Head><title>Главное меню — CloudsMarket</title></Head>
      <div className="container">
        <div className="hero" style={{maxWidth:980}}>
          {/* top bar */}
          <div className="topbar">
            <div className="topbar-left">
              <img className="avatar" src={avatar} alt="avatar" />
              <div className="hello">
                <div className="hello-hi">Привет, {name}</div>
                <div className="hello-sub">{at || 'Добро пожаловать!'}</div>
              </div>
            </div>
            <a className="btn btn-ghost" href="/profile" aria-label="Профиль">
              Профиль
            </a>
          </div>

          {/* grid tiles */}
          <div className="grid">
            {/* Auctions */}
            <a className="tile tile-auction" href="/auctions">
              <div className="tile-head">
                <div className="tile-title">Аукционы</div>
                <div className="tile-badge">Live</div>
              </div>
              <div className="tile-desc">
                Делай ставки на редкие подарки в реальном времени.
              </div>
            </a>

            {/* Gifts */}
            <a className="tile tile-gifts" href="/gifts">
              <div className="tile-head">
                <div className="tile-title">Подарки</div>
              </div>
              <div className="tile-desc">
                Каталог наборов и коллекций — отправляй друзьям в один тап.
              </div>
            </a>

            {/* Plans */}
            <a className="tile tile-plans" href="/plans">
              <div className="tile-head">
                <div className="tile-title">Тарифы</div>
              </div>
              <ul className="tile-list">
                <li>Бесплатный — стартуй без рисков</li>
                <li>Plus — расширенная витрина</li>
                <li>Pro — максимум для продавцов</li>
              </ul>
            </a>

            {/* My purchases */}
            <a className="tile tile-orders" href="/orders">
              <div className="tile-head">
                <div className="tile-title">Покупки</div>
              </div>
              <div className="tile-desc">История покупок и статусы отправки.</div>
            </a>

            {/* Search user */}
            <button className="tile tile-search" onClick={() => setShowSearch(true)}>
              <div className="tile-head">
                <div className="tile-title">Поиск человека</div>
              </div>
              <div className="tile-desc">Найди пользователя по @никнейму и отправь ему подарок.</div>
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно поиска */}
      {showSearch && (
        <div className="overlay" onClick={() => setShowSearch(false)}>
          <div className="overlay-backdrop" />
          <div className="overlay-panel search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-header">
              <h2 className="search-title">Поиск человека</h2>
              <button className="search-close" onClick={() => setShowSearch(false)}>✕</button>
            </div>
            
            <div className="search-input-wrapper">
              <span className="search-at">@</span>
              <input
                className="search-input"
                placeholder="введите никнейм..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="search-results">
              {searchBusy && (
                <div className="search-loading">Ищем пользователей...</div>
              )}
              
              {!searchBusy && searchResults.length === 0 && searchQuery.trim() && (
                <div className="search-empty">Пользователь не найден</div>
              )}

              {!searchBusy && searchResults.map(user => (
                <div key={user.id} className="search-result-item" onClick={() => {
                  alert(`Выбран пользователь: @${user.username}`);
                  setShowSearch(false);
                }}>
                  <img src={user.avatar} alt="" className="search-result-avatar" />
                  <div className="search-result-info">
                    <div className="search-result-name">{user.name}</div>
                    <div className="search-result-username">@{user.username}</div>
                  </div>
                  <span className="search-result-action">Выбрать</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}