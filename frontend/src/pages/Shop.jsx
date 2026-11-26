import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import api from '../lib/axios';
import SEO from '../components/SEO';
import { DEFAULT_PRODUCTS } from '../data/products';
import './Shop.css';

const CATEGORIES = [
  { slug: 'all', label: 'All Pieces' },
  { slug: 'kurta-sets', label: 'Kurta Sets' },
  { slug: 'everyday-kurtas', label: 'Kurtas & Tops' },
  { slug: 'festive-kurtas', label: 'Festive Wear' },
  { slug: 'cotton-linen-kurtas', label: 'Cotton & Linen' },
  { slug: 'printed-kurtas', label: 'Artisan Prints' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        // Request full catalog (backend default limit is 12)
        const res = await api.get('/products?limit=50', { signal: controller.signal });
        clearTimeout(timeoutId);
        const apiProducts = res.data?.data?.products ?? res.data?.data;
        if (isMounted && Array.isArray(apiProducts) && apiProducts.length > 0) {
          setProducts(apiProducts);
          return;
        }

        // Direct Supabase fallback
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (isMounted && !error && data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        // Quiet fallback to instant catalog already rendered
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catSlug = p.categories?.slug || p.category_slug;
        if (catSlug !== selectedCategory) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      // default: featured
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <SEO
        title="Shop Kurtas | Premium Indian Kurtas & Sets"
        description="Discover our collection of premium Indian kurtas — everyday cotton and linen styles, hand-embroidered Chanderi, and festive sets by TEYA COLLECTIONS."
        canonical="/shop"
      />
    <div className="shop-page container">
      {/* Page Header */}
      <div className="shop-header">
        <span className="shop-header__tag">The Kurta Wardrobe</span>
        <h1 className="shop-header__title">All Kurtas</h1>
        <p className="shop-header__desc">
          Explore handcrafted kurtas designed for daily grace and celebration. Woven in pure cottons, linens, and silks with artisanal embroidery.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="shop-controls">
        <div className="shop-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`shop-category-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="shop-filters">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search kurtas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="sort-wrap">
            <ArrowUpDown size={15} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Sort: Curated / Featured</option>
              <option value="newest">Sort: Newest First</option>
              <option value="price-low">Sort: Price Low to High</option>
              <option value="price-high">Sort: Price High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Count Indicator */}
      <div className="shop-count">
        <span>Showing {filteredProducts.length} results</span>
        {selectedCategory !== 'all' && (
          <button onClick={() => handleCategoryChange('all')} className="clear-filter-btn">
            Clear filter
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="shop-loading">
          <RefreshCw size={28} className="spinner" />
          <p>Curating collection...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="shop-empty">
          <h3>No garments match your criteria</h3>
          <p>Try clearing your filters or search keywords.</p>
          <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="btn-primary">
            Reset Catalog
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
    </>
  );
}
