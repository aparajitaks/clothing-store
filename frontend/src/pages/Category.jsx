import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import api from '../lib/axios';
import { DEFAULT_PRODUCTS } from '../data/products';
import SEO from '../components/SEO';
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
  const initialFiltered = DEFAULT_PRODUCTS.filter(
    (p) => (p.categories && p.categories.slug === slug) || p.category_slug === slug
  );
  const [products, setProducts] = useState(initialFiltered);
  const [loading, setLoading] = useState(false);

  const meta = CATEGORY_META[slug] || {
    title: slug ? slug.replace('-', ' ').toUpperCase() : 'Category',
    desc: 'Discover artisanal garments curated for modern wardrobes.',
    banner: '/hero_luxury.jpg',
  };

  useEffect(() => {
    let isMounted = true;
    const localFiltered = DEFAULT_PRODUCTS.filter(
      (p) => (p.categories && p.categories.slug === slug) || p.category_slug === slug
    );
    setProducts(localFiltered);

    async function loadCategoryProducts() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        // API shape: { data: { products: [...], pagination: {} } }
        const res = await api.get(`/products?category=${slug}&limit=50`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const apiProducts = res.data?.data?.products ?? res.data?.data;
        if (isMounted && Array.isArray(apiProducts) && apiProducts.length > 0) {
          setProducts(apiProducts);
          return;
        }

        const { data } = await supabase
          .from('products')
          .select('*, categories!inner(name, slug)')
          .eq('categories.slug', slug)
          .eq('is_active', true);

        if (isMounted && data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        // Keep local category items already rendered
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCategoryProducts();
    return () => { isMounted = false; };
  }, [slug]);

  return (
    <div className="shop-page container">
      {/* Breadcrumb */}
      <nav className="shop-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <span className="current">{meta.title}</span>
      </nav>

      {/* Hero Banner for Category */}
      <div className="shop-header">
        <span className="shop-header__tag">Capsule Collection</span>
        <h1 className="shop-header__title">{meta.title}</h1>
        <p className="shop-header__desc">{meta.desc}</p>
      </div>

      <SEO
        title={meta?.title || 'Category'}
        description={meta?.desc || 'Discover artisanal garments curated for modern wardrobes.'}
        canonical={meta?.slug ? `/category/${meta.slug}` : '/category'}
        image={`${process.env.PUBLIC_URL}/og-image.png`}
        type="website"
      />

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
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
