import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import api from '../lib/axios';
import './Shop.css';

const CATEGORY_META = {
  'everyday-kurtas': {
    title: 'Everyday Kurtas',
    desc: 'Effortlessly wearable kurtas in breathable cotton and linen — designed for daily elegance from morning to evening.',
    banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600',
  },
  'embroidered-kurtas': {
    title: 'Embroidered Kurtas',
    desc: 'Handcrafted threadwork — resham, zari, and dabka embroidery — placed with patience on each piece.',
    banner: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600',
  },
  'festive-kurtas': {
    title: 'Festive Kurtas',
    desc: 'Celebratory kurtas in pure silk and rich fabrics. Crafted for weddings, festivals, and occasions that matter.',
    banner: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600',
  },
  'printed-kurtas': {
    title: 'Printed Kurtas',
    desc: 'Hand block-printed and screen-printed kurtas rooted in India\'s rich textile traditions.',
    banner: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=1600',
  },
  'cotton-linen-kurtas': {
    title: 'Cotton & Linen Kurtas',
    desc: 'Pure handspun cotton and Belgian linen kurtas — breathable, considered, and beautiful in their simplicity.',
    banner: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600',
  },
  'kurta-sets': {
    title: 'Kurta Sets',
    desc: 'Complete kurta sets with coordinated trousers, palazzos, and dupattas — effortlessly curated for you.',
    banner: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600',
  },
  // Legacy slugs — redirect to shop
  'kurtas-suits': {
    title: 'Kurtas & Suits',
    desc: 'Explore our full kurta collection — from everyday cotton to festive embroidered pieces.',
    banner: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600',
  },
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const meta = CATEGORY_META[slug] || {
    title: slug ? slug.replace('-', ' ').toUpperCase() : 'Category',
    desc: 'Discover artisanal garments curated for modern wardrobes.',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600',
  };

  useEffect(() => {
    async function loadCategoryProducts() {
      setLoading(true);
      try {
        // API shape: { data: { products: [...], pagination: {} } }
        const res = await api.get(`/products?category=${slug}`);
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

        if (data) setProducts(data);
      } catch (err) {
        console.warn('Fallback category load:', err);
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
