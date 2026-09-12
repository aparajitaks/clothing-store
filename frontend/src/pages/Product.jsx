import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, ChevronDown, ChevronUp, Star, Share2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useUIStore from '../store/uiStore';
import useWishlistStore from '../store/wishlistStore';
import ProductCard from '../components/ProductCard';
import SizeGuideModal from '../components/SizeGuideModal';
import PincodeChecker from '../components/PincodeChecker';
import { supabase } from '../lib/supabase';
import api from '../lib/axios';
import analytics from '../utils/analytics';
import SEO, { buildProductSchema, buildBreadcrumbSchema } from '../components/SEO';
import './Product.css';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1000',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000',
];

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        // Try Express API
        const res = await api.get(`/products/${slug}`);
        if (res.data?.data) {
          const p = res.data.data;
          setProduct(p);
          if (Array.isArray(p.sizes) && p.sizes.length > 0) setSelectedSize(p.sizes[0]);
          if (Array.isArray(p.colors) && p.colors.length > 0) {
            setSelectedColor(typeof p.colors[0] === 'string' ? p.colors[0] : p.colors[0].name);
          }
          return;
        }

        // Direct Supabase fallback
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('slug', slug)
          .single();

        if (data) {
          setProduct(data);
          if (Array.isArray(data.sizes) && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
          if (Array.isArray(data.colors) && data.colors.length > 0) {
            setSelectedColor(typeof data.colors[0] === 'string' ? data.colors[0] : data.colors[0].name);
          }
        }
      } catch (err) {
        console.warn('Product load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // Load related products
  useEffect(() => {
    async function loadRelated() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .neq('slug', slug)
          .limit(4);
        if (data) setRelated(data);
      } catch (e) {
        // quiet
      }
    }
    loadRelated();
  }, [slug]);

  if (loading) {
    return (
      <div className="product-page-loading container">
        <p>Unfolding garment details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page-empty container">
        <h2>Piece Not Found</h2>
        <p>The garment you are looking for may have been archived.</p>
        <Link to="/shop" className="btn-primary">Browse All Pieces</Link>
      </div>
    );
  }

  // Parse images
  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
    : DEFAULT_IMAGES;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    toast.success(`Added ${product.name} to wardrobe`);
    analytics.trackAddToCart(product, quantity, selectedSize, selectedColor);
    openCart();
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    const action = wishlistToggle(product);
    analytics.trackWishlist(product.id, action);
    toast(action === 'added' ? `Saved to wishlist` : `Removed from wishlist`, {
      icon: action === 'added' ? '♡' : '✕',
    });
  };

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);

  return (
    <>
      <SEO
        title={product.name}
        description={product.description || `Buy ${product.name} from TK TeyaCollections — premium handcrafted traditional Indian fashion.`}
        canonical={`/product/${product.slug}`}
        image={product.images?.[0]}
        type="product"
        jsonLd={[
          buildProductSchema(product),
          buildBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Shop', url: '/shop' },
            { name: product.name, url: `/product/${product.slug}` },
          ]),
        ]}
      />
    <div className="product-page container">
      {/* Breadcrumb */}
      <nav className="pdp-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        {product.categories && (
          <>
            <Link to={`/category/${product.categories.slug}`}>{product.categories.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="current">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="pdp-grid">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-thumbnails">
            {imagesList.map((img, i) => (
              <button
                key={i}
                className={`pdp-thumb ${selectedImage === i ? 'active' : ''}`}
                onClick={() => setSelectedImage(i)}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>

          <div className="pdp-main-image-wrap">
            <img
              src={imagesList[selectedImage] || imagesList[0]}
              alt={product.name}
              className="pdp-main-image"
            />
          </div>
        </div>

        {/* Product Details Column */}
        <div className="pdp-details">
          {product.categories?.name && (
            <span className="pdp-category">{product.categories.name}</span>
          )}
          <h1 className="pdp-title">{product.name}</h1>

          {/* Pricing */}
          <div className="pdp-price-row">
            <span className="pdp-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <>
                <span className="pdp-compare-price">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>
                <span className="pdp-save-badge">
                  Save {Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)}%
                </span>
              </>
            )}
          </div>
          <p className="pdp-tax-note">Taxes included. Free express shipping on this piece.</p>

          {/* Color Selector */}
          {Array.isArray(product.colors) && product.colors.length > 0 && (
            <div className="pdp-option-group">
              <label className="pdp-label">
                Color: <strong>{selectedColor}</strong>
              </label>
              <div className="pdp-colors-list">
                {product.colors.map((c) => {
                  const name = typeof c === 'string' ? c : c.name;
                  const hex = typeof c === 'string' ? '#1A1A1A' : c.hex;
                  return (
                    <button
                      key={name}
                      className={`pdp-color-swatch ${selectedColor === name ? 'active' : ''}`}
                      style={{ backgroundColor: hex }}
                      title={name}
                      onClick={() => setSelectedColor(name)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div className="pdp-option-group">
              <div className="flex-between">
                <label className="pdp-label">
                  Select Size: <strong>{selectedSize}</strong>
                </label>
                <button className="pdp-size-guide-btn" onClick={() => setSizeGuideOpen(true)}>Size Guide</button>
              </div>
              <div className="pdp-sizes-list">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`pdp-size-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="pdp-actions">
            <div className="pdp-qty-stepper">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <button onClick={handleAddToCart} className="btn-primary pdp-add-btn">
              <ShoppingBag size={18} /> Add to Wardrobe
            </button>

            <button
              className={`pdp-wishlist-btn ${isWishlisted(product?.id) ? 'wishlisted' : ''}`}
              onClick={handleWishlistToggle}
              aria-label={isWishlisted(product?.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={isWishlisted(product?.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          <button onClick={handleBuyNow} className="btn-secondary pdp-buy-btn">
            Instant Checkout
          </button>

          {/* Pincode Checker */}
          <PincodeChecker />

          {/* Value Props Guarantee */}
          <div className="pdp-guarantees">
            <div className="pdp-guarantee-item">
              <Truck size={18} />
              <span>Complimentary express delivery in 3-5 business days</span>
            </div>
            <div className="pdp-guarantee-item">
              <RefreshCw size={18} />
              <span>7-day door-step trial & seamless returns</span>
            </div>
            <div className="pdp-guarantee-item">
              <ShieldCheck size={18} />
              <span>100% authentic hand-inspected artisan garment</span>
            </div>
          </div>

          {/* Accordion Tabs */}
          <div className="pdp-accordions">
            <div className="pdp-accordion-item">
              <button
                className="pdp-accordion-trigger"
                onClick={() => setActiveTab(activeTab === 'details' ? null : 'details')}
              >
                <span>Garment Description & Fit</span>
                {activeTab === 'details' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {activeTab === 'details' && (
                <div className="pdp-accordion-body">
                  <p>{product.description || 'Crafted with extraordinary precision, this silhouette is tailored to drape softly over the body with a bespoke sense of luxury.'}</p>
                  <ul>
                    <li>Dry clean or gentle hand wash with natural pH detergent</li>
                    <li>Low steam iron inside out</li>
                    <li>Sustainably packaged in reusable organic linen bag</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="pdp-accordion-item">
              <button
                className="pdp-accordion-trigger"
                onClick={() => setActiveTab(activeTab === 'shipping' ? null : 'shipping')}
              >
                <span>Shipping & Bespoke Packaging</span>
                {activeTab === 'shipping' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {activeTab === 'shipping' && (
                <div className="pdp-accordion-body">
                  <p>All Teya pieces are delivered in our signature ivory presentation boxes with magnetic ribbon closure, protecting your garment during transit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.categories?.name}
        sizeChart={product.size_chart}
      />

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pdp-related section">
          <div className="section-header">
            <span className="section-header__tag">Complementary Pieces</span>
            <h2 className="section-header__title">You May Also Admire</h2>
          </div>
          <div className="products-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
