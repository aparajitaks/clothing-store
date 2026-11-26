import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import api from '../lib/axios';
import { DEFAULT_PRODUCTS, DEFAULT_COLLECTIONS } from '../data/products';
import './Collections.css';

export default function CollectionDetailPage() {
  const { slug } = useParams();
  const localCol = DEFAULT_COLLECTIONS.find((c) => c.slug === slug);
  const localProds = DEFAULT_PRODUCTS.filter(
    (p) => p.collection?.slug === slug || (localCol && p.collection_id === localCol.id)
  );
  const [collection, setCollection] = useState(localCol || { name: 'Collection', slug });
  const [products, setProducts] = useState(localProds.length > 0 ? localProds : DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const col = DEFAULT_COLLECTIONS.find((c) => c.slug === slug);
    const matching = DEFAULT_PRODUCTS.filter(
      (p) => p.collection?.slug === slug || (col && p.collection_id === col.id)
    );
    setCollection(col || { name: 'Collection', slug });
    setProducts(matching.length > 0 ? matching : DEFAULT_PRODUCTS);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    api.get(`/products/collections/${slug}`, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
        const data = res.data?.data;
        if (isMounted && data) {
          setCollection(data.collection || data);
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="collection-detail-loading container">
        <p>Curating the collection...</p>
      </div>
    );
  }

  return (
    <div className="collection-detail-page">
      {/* Breadcrumb */}
      <div className="collection-detail-crumb-wrap container">
        <nav className="collection-detail-crumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/collections">Collections</Link>
          <span>/</span>
          <span className="current">{collection?.name || slug}</span>
        </nav>
      </div>

      {/* Collection Hero */}
      {collection && (
        <div className="collection-detail-hero">
          <motion.div className="container" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="collections-hero__eyebrow">The Edit</p>
            <h1 className="collection-detail-title">{collection.name}</h1>
            {collection.tagline && <p className="collection-detail-tagline">{collection.tagline}</p>}
            {collection.description && <p className="collection-detail-desc">{collection.description}</p>}
          </motion.div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container">
        {products.length === 0 ? (
          <div className="collection-detail-empty">
            <p>New pieces arriving soon.</p>
            <Link to="/shop" className="btn-primary">
              Browse All Pieces
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
