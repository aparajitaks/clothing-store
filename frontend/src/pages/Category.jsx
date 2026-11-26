import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import api from '../lib/axios';
import { DEFAULT_PRODUCTS } from '../data/products';
import './Shop.css';

const CATEGORY_META = {
  'everyday-kurtas': {
    title: 'Kurtas & Tops',
    desc: 'Effortlessly wearable kurtas in breathable cotton and linen — designed for daily elegance from morning to evening.',
    banner: '/products/navy-rose-embroidered-kurta-set/front.jpg',
  },
  'embroidered-kurtas': {
    title: 'Embroidered Kurtas',
    desc: 'Handcrafted threadwork — resham, zari, and dabka embroidery — placed with patience on each piece.',
    banner: '/products/rust-embroidered-kurta-set/front.jpg',
  },
  'festive-kurtas': {
    title: 'Festive Wear',
    desc: 'Celebratory kurtas in pure silk and rich fabrics. Crafted for weddings, festivals, and occasions that matter.',
    banner: '/products/champagne-gold-zari-kurta-set/front.jpg',
  },
  'printed-kurtas': {
    title: 'Artisan Prints',
    desc: 'Hand block-printed and screen-printed kurtas rooted in India\'s rich textile traditions.',
    banner: '/products/fuchsia-floral-block-print-kurta-set/front.jpg',
  },
  'cotton-linen-kurtas': {
    title: 'Cotton & Linen',
    desc: 'Pure handspun cotton and linen kurtas — breathable, considered, and beautiful in their simplicity.',
    banner: '/products/botanical-printed-pink-kurta-set/front.jpg',
  },
  'kurta-sets': {
    title: 'Kurta Sets',
    desc: 'Complete kurta sets with coordinated trousers, palazzos, and dupattas — effortlessly curated for you.',
    banner: '/products/ivory-floral-embroidered-kurta-set/front.jpg',
  },
  // Legacy slugs
  'kurtas-suits': {
    title: 'Kurtas & Suits',
    desc: 'Explore our full kurta collection — from everyday cotton to festive embroidered pieces.',
    banner: '/hero_luxury.jpg',
  },
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const meta = CATEGORY_META[slug] || {
    title: slug ? slug.replace('-', ' ').toUpperCase() : 'Category',
    desc: 'Discover artisanal garments curated for modern wardrobes.',
    banner: '/hero_luxury.jpg',
  };

  useEffect(() => {
    async function loadCategoryProducts() {
      setLoading(true);
      try {
        // API shape: { data: { products: [...], pagination: {} } }
        const res = await api.get(`/products?category=${slug}&limit=50`);
        const apiProducts = res.data?.data?.products ?? res.data?.data;
        if (Array.isArray(apiProducts) && apiProducts.length > 0) {
          setProducts(apiProducts);
          return;
        }

        const { data } = await supabase
          .from('products')
          .select('*, categories!inner(name, slug)')
          .eq('categories.slug', slug)
          .eq('is_active', true);

        if (data && data.length > 0) {
          setProducts(data);
          return;
        }

        const filtered = DEFAULT_PRODUCTS.filter(
          (p) => (p.categories && p.categories.slug === slug) || p.category_slug === slug
        );
        setProducts(filtered.length > 0 ? filtered : DEFAULT_PRODUCTS);
      } catch (err) {
        console.warn('Fallback category load:', err);
        const filtered = DEFAULT_PRODUCTS.filter(
          (p) => (p.categories && p.categories.slug === slug) || p.category_slug === slug
        );
        setProducts(filtered.length > 0 ? filtered : DEFAULT_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryProducts();
  }, [slug]);

  return (
    <div className="shop-page container">
      {/* Breadcrumb */}
      <nav className="breadcrumb" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#8C887B' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
        <span>/</span>
        <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{meta.title}</span>
      </nav>

      {/* Hero Banner for Category */}
      <div className="shop-header">
        <span className="shop-header__tag">Capsule Collection</span>
        <h1 className="shop-header__title">{meta.title}</h1>
        <p className="shop-header__desc">{meta.desc}</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="shop-loading">
          <p>Gathering pieces...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="shop-empty">
          <h3>No garments available in this collection currently</h3>
          <p>Please check back soon as our artisans weave new pieces.</p>
          <Link to="/shop" className="btn-primary">
            Explore All Creations
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
