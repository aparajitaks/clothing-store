import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import api from '../lib/axios';

export default function CollectionDetailPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/collections/${slug}`)
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          setCollection(data.collection || data);
          setProducts(data.products || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="shop-loading container" style={{ paddingTop: 'calc(var(--nav-height) + 6rem)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Curating the collection...
        </p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 'var(--space-4xl)' }}>
      {/* Breadcrumb */}
      <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-xl))', paddingBottom: 'var(--space-md)' }}>
        <nav style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--color-text-muted)' }}>Home</Link>
          <span>/</span>
          <Link to="/collections" style={{ color: 'var(--color-text-muted)' }}>Collections</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text)' }}>{collection?.name || slug}</span>
        </nav>
      </div>

      {/* Collection Hero */}
      {collection && (
        <div style={{ background: 'var(--color-bg-alt)', padding: 'var(--space-3xl) var(--space-xl)', textAlign: 'center', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-3xl)' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: 'var(--space-md)' }}>The Edit</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--color-text)', marginBottom: 'var(--space-md)' }}>{collection.name}</h1>
            {collection.tagline && <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>{collection.tagline}</p>}
            {collection.description && <p style={{ maxWidth: '520px', margin: '0 auto', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{collection.description}</p>}
          </motion.div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container" style={{ padding: '0 var(--space-xl)' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-4xl) 0' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              New pieces arriving soon.
            </p>
            <Link to="/shop" className="btn-primary" style={{ marginTop: 'var(--space-xl)', display: 'inline-flex' }}>
              Browse All Pieces
            </Link>
          </div>
        ) : (
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-xl)' }}>
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
