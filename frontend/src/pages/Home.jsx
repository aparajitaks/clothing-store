import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Truck, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import api from '../lib/axios';
import SEO, { buildOrganizationSchema } from '../components/SEO';
import './Home.css';

// Fallback kurta products — only used if API is unreachable
const FALLBACK_FEATURED = [
  {
    id: 'prod-1',
    name: 'The Zoya Chanderi Kurta Set',
    slug: 'zoya-handloom-chanderi-kurta',
    price: 6499,
    compare_price: 7999,
    images: [
      { url: '/hero_luxury.jpg', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Ivory Mist', hex: '#FFFFFF' }, { name: 'Soft Sage', hex: '#9CAF88' }],
    stock: 47,
    is_featured: true,
    categories: { name: 'Kurta Sets' },
  },
  {
    id: 'prod-2',
    name: 'The Noor Embroidered Kurta',
    slug: 'noor-hand-embroidered-anarkali-suit',
    price: 8999,
    compare_price: 11499,
    images: [
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', isPrimary: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Champagne Mist', hex: '#EDE8DF' }, { name: 'Deep Emerald', hex: '#1B4332' }],
    stock: 37,
    is_featured: true,
    categories: { name: 'Embroidered Kurtas' },
  },
  {
    id: 'prod-3',
    name: 'The Aira Cotton Everyday Kurta',
    slug: 'aira-cotton-everyday-kurta',
    price: 2999,
    compare_price: 3799,
    images: [
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', isPrimary: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Natural White', hex: '#FAF8F4' }, { name: 'Sand Beige', hex: '#D8C8B8' }],
    stock: 91,
    is_featured: true,
    categories: { name: 'Everyday Kurtas' },
  },
  {
    id: 'prod-4',
    name: 'The Gulnaar Block-Print Kurta',
    slug: 'gulnaar-block-print-kurta',
    price: 3499,
    compare_price: 4499,
    images: [
      { url: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800', isPrimary: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Ochre & Ivory', hex: '#C27D38' }, { name: 'Indigo & White', hex: '#3A4F7A' }],
    stock: 51,
    is_featured: true,
    categories: { name: 'Printed Kurtas' },
  },
];

// BIBA-style Category Tiles using BIBA's high-res category assets
const BIBA_CATEGORIES = [
  {
    name: 'Suit Sets',
    slug: 'kurta-sets',
    subtitle: 'Matching Palazzos & Dupattas',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dwe4dba55e/A-A-SS26/Suit-sets-n.png',
  },
  {
    name: 'Kurtas & Tops',
    slug: 'everyday-kurtas',
    subtitle: 'Everyday Straight & A-Line',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dw2d7ebf21/A-A-SS26/Kurtis_INTL-n.png',
  },
  {
    name: 'Festive Wear',
    slug: 'festive-kurtas',
    subtitle: 'Zari, Dabka & Organza',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dw992781ab/A-A-SS26/Lehenga_INTL-n.png',
  },
  {
    name: 'Cotton & Linen',
    slug: 'cotton-linen-kurtas',
    subtitle: 'Pure Breathable Textures',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dw0494d244/A-A-SS26/Fusion_INTL-n.png',
  },
  {
    name: 'Bottomwear',
    slug: 'shop',
    subtitle: 'Pants, Salwars & Skirts',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dwf04e15d6/A-A-SS26/Bottom-n.png',
  },
  {
    name: 'Artisan Prints',
    slug: 'printed-kurtas',
    subtitle: 'Hand-Block & Bagru Weaves',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dw21fe9f01/A-A-SS26/Girls_INTL-n.png',
  },
];

// BIBA-style Season's Palette Tiles
const COLOR_STORIES = [
  {
    name: 'Pristine Whites',
    shade: 'Ivory, Ecru & Milk',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dw027621cd/A-A-SS26/White.png',
    link: '/category/everyday-kurtas',
  },
  {
    name: 'Emerald & Sage',
    shade: 'Forest, Olive & Mint',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dw001ad7d5/A-A-SS26/Green.png',
    link: '/category/festive-kurtas',
  },
  {
    name: 'Champagne & Gold',
    shade: 'Ecru, Zari & Honey',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dw0494d244/A-A-SS26/Fusion_INTL-n.png',
    link: '/category/kurta-sets',
  },
  {
    name: 'Midnight Noir',
    shade: 'Kohl, Slate & Charcoal',
    image: 'https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/en_US/dw9c6bee30/A-A-SS26/Black.png',
    link: '/category/cotton-linen-kurtas',
  },
];

// BIBA-style Runway Looks / Editorial Stories
const TREND_STORIES = [
  {
    title: 'The Chanderi Edit',
    subtitle: 'Lustrous Silk With Gold Zari Accents',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4646?w=600&q=80&auto=format&fit=crop',
    link: '/category/kurta-sets',
  },
  {
    title: 'The Flared Anarkali',
    subtitle: 'Imperial Volume & Intricate Necklines',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80&auto=format&fit=crop',
    link: '/category/festive-kurtas',
  },
  {
    title: 'Artisanal Block-Prints',
    subtitle: 'Natural Dyes & Floral Bootas',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80&auto=format&fit=crop',
    link: '/category/printed-kurtas',
  },
  {
    title: 'Festive Radiance',
    subtitle: 'Heirloom Dabka on Organza',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80&auto=format&fit=crop',
    link: '/category/festive-kurtas',
  },
  {
    title: 'Minimalist Linen Weaves',
    subtitle: 'Pure Texture for Effortless Living',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop',
    link: '/category/cotton-linen-kurtas',
  },
  {
    title: 'The Tailored Trouser Set',
    subtitle: 'Structured Shoulders & Fluid Drapes',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&auto=format&fit=crop',
    link: '/category/kurta-sets',
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
              srcSet="/hero_luxury.jpg"
            />
            <source
              media="(min-width: 769px)"
              srcSet="/hero_luxury.jpg"
            />
            <img
              src="/hero_luxury.jpg"
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
                <Link to={cat.slug === 'shop' ? '/shop' : `/category/${cat.slug}`} className="biba-cat-card__link">
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

        {/* ── 3. DUAL EDITORIAL SPOTLIGHT (BIBA Signature) ────────── */}
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
                    src="https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/default/dw748b2fd8/A-A-AW26/AW'26_Lehengas.jpg"
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
              <Link to="/category/everyday-kurtas" className="biba-spotlight__card">
                <div className="biba-spotlight__img-box">
                  <img
                    src="https://www.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Library-Sites-BibaSharedLibrary/default/dwfcd918b4/A-A-SS26/Biba_NXT-D.jpg"
                    alt="Contemporary Minimalist"
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

        {/* ── 4. FEATURED NEW ARRIVALS PRODUCTS ───────────────────── */}
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
              srcSet="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=85&auto=format&fit=crop"
            />
            <source
              media="(min-width: 769px)"
              srcSet="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&q=85&auto=format&fit=crop"
            />
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&q=85&auto=format&fit=crop"
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

        {/* ── 6. SEASON'S COLOR PALETTE ───────────────────────────── */}
        <section className="biba-section biba-palette-section container">
          <div className="biba-section-head text-center">
            <span className="biba-section-tag">Color Stories</span>
            <h2 className="biba-section-title">Palette of the Season</h2>
            <div className="biba-section-divider" />
          </div>

          <div className="biba-palette-grid">
            {COLOR_STORIES.map((color, i) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="biba-palette-card"
              >
                <Link to={color.link} className="biba-palette-card__link">
                  <div className="biba-palette-card__img-box">
                    <img src={color.image} alt={color.name} loading="lazy" />
                  </div>
                  <div className="biba-palette-card__meta">
                    <h3 className="biba-palette-card__title">{color.name}</h3>
                    <p className="biba-palette-card__shade">{color.shade}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 7. TREND STORIES / CURATED LOOKS ───────────────────── */}
        <section className="biba-section biba-trends-section container">
          <div className="biba-section-head text-center">
            <span className="biba-section-tag">Curated Looks</span>
            <h2 className="biba-section-title">Stories in Weave</h2>
            <div className="biba-section-divider" />
          </div>

          <div className="biba-trends-grid">
            {TREND_STORIES.map((trend, i) => (
              <motion.div
                key={trend.title}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="biba-trend-card"
              >
                <Link to={trend.link} className="biba-trend-card__link">
                  <div className="biba-trend-card__img-box">
                    <img src={trend.image} alt={trend.title} loading="lazy" />
                    <div className="biba-trend-card__overlay" />
                  </div>
                  <div className="biba-trend-card__meta">
                    <h3 className="biba-trend-card__title">{trend.title}</h3>
                    <p className="biba-trend-card__sub">{trend.subtitle}</p>
                    <span className="biba-trend-card__cta">Shop The Look <ArrowRight size={14} /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
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
