import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axios';
import useUIStore from '../store/uiStore';
import './SearchOverlay.css';

const TRENDING = [
  'Chanderi Kurta Set',
  'Banarasi Silk Saree',
  'Hand-Embroidered Anarkali',
  'Raw Silk Bandhgala',
  'Kalamkari Dupatta',
];

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
        setResults(res.data?.data?.results || []);
      } catch {
        // Local fallback
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleResultClick = (slug) => {
    closeSearch();
    navigate(`/product/${slug}`);
  };

  const handleTrendingClick = (term) => {
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            className="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
          />
          <motion.div
            className="search-overlay"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="search-overlay__inner container">
              <form className="search-form" onSubmit={handleSubmit}>
                <Search size={22} className="search-form__icon" />
                <input
                  ref={inputRef}
                  className="search-form__input"
                  type="text"
                  placeholder="Search handcrafted traditional pieces..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                {query && (
                  <button type="button" className="search-form__clear" onClick={() => setQuery('')} aria-label="Clear search">
                    <X size={18} />
                  </button>
                )}
                <button type="submit" className="search-form__submit">
                  <ArrowRight size={20} />
                </button>
              </form>

              <div className="search-body">
                {!query && (
                  <div className="search-trending">
                    <p className="search-section-label">Trending Searches</p>
                    <div className="search-trending__tags">
                      {TRENDING.map((term) => (
                        <button key={term} className="search-tag" onClick={() => handleTrendingClick(term)}>
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="search-loading">
                    <span className="search-spinner" />
                    <p>Searching the atelier...</p>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div className="search-results">
                    <p className="search-section-label">{results.length} results for "{query}"</p>
                    <ul className="search-results__list">
                      {results.map((item) => (
                        <li key={item.id}>
                          <button className="search-result-item" onClick={() => handleResultClick(item.slug)}>
                            {item.image && (
                              <img src={item.image} alt={item.name} className="search-result-item__img" />
                            )}
                            <div className="search-result-item__info">
                              <p className="search-result-item__name">{item.name}</p>
                              <p className="search-result-item__price">₹{Number(item.price).toLocaleString('en-IN')}</p>
                            </div>
                            <ArrowRight size={16} className="search-result-item__arrow" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!loading && query.length >= 2 && results.length === 0 && (
                  <div className="search-empty">
                    <p>No pieces found for "<strong>{query}</strong>"</p>
                    <p className="search-empty__hint">Try searching for Saree, Anarkali, Kurta, or Lehenga</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
