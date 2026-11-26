import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Truck, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import api from '../lib/axios';
import SEO, { buildOrganizationSchema } from '../components/SEO';
import { DEFAULT_PRODUCTS } from '../data/products';
import './Home.css';

// Active launch products
const FALLBACK_FEATURED = DEFAULT_PRODUCTS;

// Category tiles using real product images
const BIBA_CATEGORIES = [
  {
    name: 'Kurta Sets',
    slug: 'kurta-sets',
    subtitle: 'Matching Palazzos & Dupattas',
    image: '/products/rust-embroidered-kurta-set/front.jpg',
  },
  {
    name: 'Kurtas & Tops',
    slug: 'everyday-kurtas',
    subtitle: 'Everyday Straight & A-Line',
    image: '/products/navy-rose-embroidered-kurta-set/front.jpg',
  },
  {
    name: 'Festive Wear',
    slug: 'festive-kurtas',
    subtitle: 'Zari, Dabka & Organza',
    image: '/products/champagne-gold-zari-kurta-set/front.jpg',
  },
  {
    name: 'Cotton & Linen',
    slug: 'cotton-linen-kurtas',
    subtitle: 'Pure Breathable Textures',
    image: '/products/botanical-printed-pink-kurta-set/front.jpg',
  },
  {
    name: 'Artisan Prints',
    slug: 'printed-kurtas',
    subtitle: 'Hand-Block & Kalamkari Weaves',
    image: '/products/fuchsia-floral-block-print-kurta-set/front.jpg',
  },
];


export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState(FALLBACK_FEATURED);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.get('/products?featured=true&limit=8');
        const apiProducts = res.data?.data?.products ?? res.data?.data;
        if (Array.isArray(apiProducts) && apiProducts.length > 0) {
          setFeaturedProducts(apiProducts);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (!error && data && data.length > 0) {
          setFeaturedProducts(data);
        }
      } catch (e) {
        console.warn('Using fallback kurta products:', e.message);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <>
      <SEO
        title="TEYA COLLECTIONS — Premium Indian Ethnic Wear & Kurtas"
        description="Explore the new season collection of premium kurtas, embroidered suit sets, and handspun silhouettes inspired by India's timeless craft traditions."
        canonical="/"
        jsonLd={buildOrganizationSchema()}
      />

      <div className="biba-home">

        {/* ── 1. HERO CAMPAIGN BANNER ────────────────────────────── */}
        <section className="biba-hero">
          <picture className="biba-hero__picture">
            <source
              media="(max-width: 768px)"
              srcSet="/biba_hero_m.jpg"
            />
            <source
              media="(min-width: 769px)"
              srcSet="/biba_hero.jpg"
            />
            <img
              src="/biba_hero.jpg"
              alt="TEYA COLLECTIONS Autumn Winter Collection"
              className="biba-hero__image"
            />
          </picture>

          <div className="biba-hero__overlay">
            <div className="container biba-hero__content-wrap">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="biba-hero__card"
              >
                <span className="biba-hero__eyebrow">Autumn Winter Collection</span>
                <h1 className="biba-hero__title">
                  Discover The New Season<br />Of Elegance
                </h1>
                <p className="biba-hero__desc">
                  Curated handlooms, regal chanderi weaves, and master-tailored silhouettes designed for festive grace and timeless comfort.
                </p>
                <div className="biba-hero__actions">
                  <Link to="/collections/new-arrivals" className="biba-btn biba-btn--primary">
                    Explore New Arrivals <ArrowRight size={16} />
                  </Link>
                  <Link to="/category/kurta-sets" className="biba-btn biba-btn--outline">
                    Shop Kurta Sets
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 2. EXPLORE BY CATEGORY GRID ────────────────────────── */}
        <section className="biba-section biba-categories-section container">
          <div className="biba-section-head text-center">
            <span className="biba-section-tag">Curated Collections</span>
            <h2 className="biba-section-title">Explore By Category</h2>
            <div className="biba-section-divider" />
          </div>

          <div className="biba-cat-grid">
            {BIBA_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="biba-cat-card"
              >
                <Link to={`/category/${cat.slug}`} className="biba-cat-card__link">
                  <div className="biba-cat-card__img-box">
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                  </div>
                  <div className="biba-cat-card__meta">
                    <h3 className="biba-cat-card__name">{cat.name}</h3>
                    <p className="biba-cat-card__sub">{cat.subtitle}</p>
                    <span className="biba-cat-card__cta">Explore <ChevronRight size={14} /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 3. DUAL EDITORIAL SPOTLIGHT ──────────────────────────── */}
        <section className="biba-section biba-spotlight container">
          <div className="biba-spotlight__grid">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="biba-spotlight__col"
            >
              <Link to="/category/festive-kurtas" className="biba-spotlight__card">
                <div className="biba-spotlight__img-box">
                  <img
                    src="/products/scarlet-red-kashmiri-embroidered-kurta-set/front-2.jpg"
                    alt="The Celebratory Edit"
                    loading="lazy"
                  />
                  <div className="biba-spotlight__overlay" />
                </div>
                <div className="biba-spotlight__content">
                  <span className="biba-spotlight__tag">Festive Grandeur</span>
                  <h3 className="biba-spotlight__title">The Celebratory Edit</h3>
                  <p className="biba-spotlight__desc">
                    Zari embroidery, rich jewel tones, and opulent fabrics crafted for unforgettable celebrations.
                  </p>
                  <span className="biba-spotlight__btn">Shop Festive <ArrowRight size={16} /></span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="biba-spotlight__col"
            >
              <Link to="/category/cotton-linen-kurtas" className="biba-spotlight__card">
                <div className="biba-spotlight__img-box">
                  <img
                    src="/products/sage-olive-mirrorwork-kurta-set/front.jpg"
                    alt="Contemporary Silhouettes"
                    loading="lazy"
                  />
                  <div className="biba-spotlight__overlay" />
                </div>
                <div className="biba-spotlight__content">
                  <span className="biba-spotlight__tag">Modern Craft</span>
                  <h3 className="biba-spotlight__title">Contemporary Silhouettes</h3>
                  <p className="biba-spotlight__desc">
                    Relaxed cuts, breathable handspun linens, and effortless grace for everyday sophistication.
                  </p>
                  <span className="biba-spotlight__btn">Shop Contemporary <ArrowRight size={16} /></span>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>


        <section className="biba-section biba-featured container">
          <div className="biba-section-head flex-between">
            <div>
              <span className="biba-section-tag">Fresh On The Looms</span>
              <h2 className="biba-section-title">New Arrivals</h2>
            </div>
            <Link to="/collections/new-arrivals" className="biba-view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── 5. FULL-WIDTH MID-PAGE EDITORIAL BANNER ─────────────── */}
        <section className="biba-mid-banner">
          <picture className="biba-mid-banner__picture">
            <source
              media="(max-width: 768px)"
              srcSet="/biba_hero_m.jpg"
            />
            <source
              media="(min-width: 769px)"
              srcSet="/biba_hero.jpg"
            />
            <img
              src="/biba_hero.jpg"
              alt="Artisanal Heritage Weaves"
              loading="lazy"
            />
          </picture>

          <div className="biba-mid-banner__overlay">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="biba-mid-banner__content"
              >
                <span className="biba-mid-banner__tag">The Heritage Atelier</span>
                <h2 className="biba-mid-banner__title">Mastery in Every Thread</h2>
                <p className="biba-mid-banner__desc">
                  Honoring the artisanal heritage of Indian textiles — handspun natural fibers, authentic hand-block motifs, and generational tailoring.
                </p>
                <Link to="/about" className="biba-btn biba-btn--primary">
                  Explore The Craft <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>


        {/* ── 8. BRAND TRUST & SERVICE BAR ───────────────────────── */}
        <section className="biba-trust-bar">
          <div className="container biba-trust-bar__inner">
            <div className="biba-trust-item">
              <div className="biba-trust-item__icon"><Truck size={24} /></div>
              <div className="biba-trust-item__text">
                <h4>Complimentary Shipping</h4>
                <p>On luxury orders across India</p>
              </div>
            </div>
            <div className="biba-trust-item">
              <div className="biba-trust-item__icon"><Sparkles size={24} /></div>
              <div className="biba-trust-item__text">
                <h4>Authentic Craftsmanship</h4>
                <p>100% genuine artisan weaves</p>
              </div>
            </div>
            <div className="biba-trust-item">
              <div className="biba-trust-item__icon"><RefreshCw size={24} /></div>
              <div className="biba-trust-item__text">
                <h4>Easy 7-Day Exchange</h4>
                <p>Hassle-free size adjustments</p>
              </div>
            </div>
            <div className="biba-trust-item">
              <div className="biba-trust-item__icon"><ShieldCheck size={24} /></div>
              <div className="biba-trust-item__text">
                <h4>Secure Checkout</h4>
                <p>Razorpay & COD payment options</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
