import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import api from '../lib/axios';
import analytics from '../utils/analytics';
import './Search.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [inputVal, setInputVal] = useState(query);

  useEffect(() => {
    setInputVal(query);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    api.get(`/products?search=${encodeURIComponent(query)}&limit=24`)
      .then((res) => {
        const prods = res.data?.data?.products || [];
        setResults(prods);
        analytics.trackSearch(query, prods.length);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchParams({ q: inputVal.trim() });
  };

  return (
    <div className="search-page">
      <div className="search-page__hero container">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="search-page__title">Search</h1>
          <form className="search-page__form" onSubmit={handleSubmit}>
            <div className="search-page__input-wrap">
              <Search size={20} className="search-page__icon" />
              <input
                className="search-page__input"
                type="text"
                placeholder="Search traditional pieces..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              {inputVal && (
                <button type="button" onClick={() => { setInputVal(''); setSearchParams({}); }} className="search-page__clear" aria-label="Clear">
                  <X size={18} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary search-page__btn">Search</button>
          </form>
        </motion.div>
      </div>

      <div className="container search-page__body">
        {loading && (
          <div className="search-page__loading">
            <span className="search-spinner" />
            <p>Searching the atelier...</p>
          </div>
        )}

        {!loading && searched && (
          <p className="search-page__count">
            {results.length > 0
              ? `${results.length} piece${results.length !== 1 ? 's' : ''} found for "${query}"`
              : `No pieces found for "${query}"`}
          </p>
        )}

        {!loading && results.length > 0 && (
          <div className="search-page__grid">
            {results.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="search-page__empty">
            <p className="search-page__empty-title">No kurtas found</p>
            <p className="search-page__empty-sub">
              Try searching for <em>Cotton</em>, <em>Linen</em>, <em>Embroidered</em>, <em>Chanderi</em>, or <em>Festive</em>
            </p>
            <Link to="/shop" className="btn-primary">Browse All Kurtas</Link>
          </div>
        )}

        {!searched && (
          <div className="search-page__idle">
            <p>Type above to discover handcrafted kurtas from TEYA COLLECTIONS.</p>
          </div>
        )}
      </div>
    </div>
  );
}
