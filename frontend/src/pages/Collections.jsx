import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import './Collections.css';

const FALLBACK_COLLECTIONS = [
  {
    id: 'col-1',
    slug: 'everyday-edit',
    name: 'The Everyday Edit',
    tagline: 'Kurtas designed for effortless daily wear',
    description: 'A curated selection of breathable, beautifully draped kurtas that move with you through every part of your day.',
    image_url: '/hero_luxury.jpg',
    is_featured: true,
  },
  {
    id: 'col-2',
    slug: 'festive-noor',
    name: 'Festive Noor',
    tagline: 'Luminous kurtas for celebrations',
    description: 'Rich embroidery, jewel tones, and heirloom craftsmanship — designed to shine at every occasion.',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200',
    is_featured: true,
  },
  {
    id: 'col-3',
    slug: 'craft-weave',
    name: 'Craft & Weave',
    tagline: 'Honoring India\'s handloom heritage',
    description: 'Handwoven Chanderi, hand-block prints, and hand-embroidered Chanderi sets from artisans across India.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200',
    is_featured: true,
  },
  {
    id: 'col-4',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    tagline: 'Fresh kurtas, just landed',
    description: 'The latest additions to the Teya Collections kurta wardrobe.',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200',
    is_featured: false,
  },
];

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
