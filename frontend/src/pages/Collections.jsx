import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { DEFAULT_COLLECTIONS } from '../data/products';
import './Collections.css';

const FALLBACK_COLLECTIONS = DEFAULT_COLLECTIONS;

export default function CollectionsPage() {
  const [collections, setCollections] = useState(FALLBACK_COLLECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/collections')
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setCollections(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featuredCollections = collections.filter((c) => c.is_featured);
  const otherCollections = collections.filter((c) => !c.is_featured);

  return (
    <div className="collections-page">
      {/* Hero */}
      <div className="collections-hero">
        <motion.div
          className="collections-hero__content container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="collections-hero__eyebrow">Our Curated Edits</p>
          <h1 className="collections-hero__title">Collections</h1>
          <p className="collections-hero__subtitle">
            Each kurta collection is a thoughtful dialogue between master artisans and modern aesthetics —
            curated for your daily rhythms and grandest occasions.
          </p>
        </motion.div>
      </div>

      {/* Featured Collections — full-bleed editorial */}
      <section className="collections-featured container">
        {featuredCollections.map((col, idx) => (
          <motion.div
            key={col.id}
            className={`col-editorial ${idx % 2 === 1 ? 'col-editorial--reverse' : ''}`}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="col-editorial__image-wrap">
              <img src={col.image_url} alt={col.name} className="col-editorial__image" />
            </div>
            <div className="col-editorial__content">
              <p className="col-editorial__eyebrow">Collection</p>
              <h2 className="col-editorial__name">{col.name}</h2>
              <p className="col-editorial__tagline">{col.tagline}</p>
              <p className="col-editorial__desc">{col.description}</p>
              <Link to={`/collections/${col.slug}`} className="btn-primary col-editorial__cta">
                Shop Collection
              </Link>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Other Collections — grid */}
      {otherCollections.length > 0 && (
        <section className="collections-grid-section container">
          <h2 className="collections-grid-title">Explore More</h2>
          <div className="collections-grid">
            {otherCollections.map((col) => (
              <Link key={col.id} to={`/collections/${col.slug}`} className="collection-card">
                <div className="collection-card__image-wrap">
                  <img src={col.image_url} alt={col.name} className="collection-card__image" />
                </div>
                <div className="collection-card__info">
                  <h3 className="collection-card__name">{col.name}</h3>
                  <p className="collection-card__tagline">{col.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
