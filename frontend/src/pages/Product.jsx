import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Maximize2,
  X,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
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
import { DEFAULT_PRODUCTS } from '../data/products';
import './Product.css';

const DEFAULT_IMAGES = [
  { url: '/products/rust-embroidered-kurta-set/front.jpg', label: 'Front Pose', type: 'image' },
  { url: '/products/rust-embroidered-kurta-set/back.jpg', label: 'Back Pose', type: 'image' },
  { url: '/products/rust-embroidered-kurta-set/right.jpg', label: 'Right Side', type: 'image' },
  { url: '/products/rust-embroidered-kurta-set/left.jpg', label: 'Left Side', type: 'image' },
  { url: '/products/rust-embroidered-kurta-set/video.mp4', label: 'Model Shoot', type: 'video', poster: '/products/rust-embroidered-kurta-set/video-poster.jpg' },
];

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist);

  // Synchronous initial product to ensure 0ms instantaneous loading (No spinner lock!)
  const initialProduct = useMemo(
    () => DEFAULT_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null,
    [slug]
  );

  const [product, setProduct] = useState(initialProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(initialProduct?.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(
    initialProduct?.colors?.[0]?.name || (initialProduct?.colors?.[0] || 'Rust Orange')
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [related, setRelated] = useState(DEFAULT_PRODUCTS.filter((p) => p.slug !== slug));
  const [loading, setLoading] = useState(!initialProduct);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Amazon-style Zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageWrapRef = useRef(null);

  // Amazon-style Lightbox Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [lightboxZoomPos, setLightboxZoomPos] = useState({ x: 50, y: 50 });

  // Video player state
  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Reset selected image when slug changes
  useEffect(() => {
    setSelectedImage(0);
    setVideoPlaying(false);
    setVideoError(false);
    setLightboxZoomed(false);
    const found = DEFAULT_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    if (found) {
      setProduct(found);
      setLoading(false);
      if (Array.isArray(found.sizes) && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
    }
  }, [slug]);

  // Reset video state when switching media items
  useEffect(() => {
    setVideoPlaying(false);
    setVideoError(false);
    setLightboxZoomed(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [selectedImage]);

  // Background fetch to refresh data if API or DB is available
  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        // Fast timeout check so it doesn't block UI
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const res = await api.get(`/products/${slug}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (isMounted && res.data?.data) {
          const p = res.data.data;
          setProduct(p);
          if (Array.isArray(p.sizes) && p.sizes.length > 0 && !selectedSize) setSelectedSize(p.sizes[0]);
          if (Array.isArray(p.colors) && p.colors.length > 0 && !selectedColor) {
            setSelectedColor(typeof p.colors[0] === 'string' ? p.colors[0] : p.colors[0].name);
          }
        }
      } catch (err) {
        // Quiet fallback to local product (already displayed)
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [slug]);

  // Parse media (images & video) with descriptive pose labels
  const mediaList = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      const defaultLabels = ['Front Pose', 'Back Pose', 'Right Profile', 'Left Profile', 'Video Shoot'];
      return product.images.map((item, index) => {
        if (typeof item === 'string') {
          const isVid = item.endsWith('.mp4') || item.includes('video');
          return {
            url: item,
            type: isVid ? 'video' : 'image',
            label: isVid ? 'Video Shoot' : (defaultLabels[index] || `Pose ${index + 1}`),
            poster: product.video_poster || null,
          };
        }
        const isVid = item.type === 'video' || item.url?.endsWith('.mp4');
        return {
          url: item.url,
          type: isVid ? 'video' : 'image',
          label: isVid ? 'Video Shoot' : (item.label || (item.alt?.includes(' — ') ? item.alt.split(' — ')[1] : defaultLabels[index]) || `Pose ${index + 1}`),
          alt: item.alt || product.name,
          poster: item.poster || product.video_poster || null,
        };
      });
    }
    return DEFAULT_IMAGES;
  }, [product]);

  const currentMedia = mediaList[selectedImage] || mediaList[0];

  // Video control handlers
  const handleVideoPlay = useCallback(() => {
    if (!videoRef.current) return;
    setVideoError(false);
    if (videoPlaying) {
      videoRef.current.pause();
      setVideoPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setVideoPlaying(true);
      }).catch(() => {
        // Retry muted if browser blocked unmuted playback
        if (videoRef.current && !videoRef.current.muted) {
          videoRef.current.muted = true;
          setVideoMuted(true);
          videoRef.current.play().then(() => setVideoPlaying(true)).catch(() => setVideoPlaying(false));
        } else {
          setVideoPlaying(false);
        }
      });
    }
  }, [videoPlaying]);

  const handleVideoRetry = useCallback((e) => {
    e?.stopPropagation();
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => setVideoPlaying(true)).catch(() => setVideoPlaying(false));
    }
  }, []);

  const handleVideoMuteToggle = useCallback((e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoMuted;
    setVideoMuted((m) => !m);
  }, [videoMuted]);

  // Amazon-style mouse move zoom calculation (pointer/hover devices only)
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  const handleMouseMove = (e) => {
    if (!canHover || !imageWrapRef.current || currentMedia?.type === 'video') return;
    const { left, top, width, height } = imageWrapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handlePrevMedia = (e) => {
    e?.stopPropagation();
    setSelectedImage((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNextMedia = (e) => {
    e?.stopPropagation();
    setSelectedImage((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'ArrowRight') handleNextMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, mediaList.length]);

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

  const hasDiscount = product?.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;

  if (loading && !product) {
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

  return (
    <>
      <SEO
        title={product.name}
        description={product.description || `Buy ${product.name} from TEYA COLLECTIONS — premium handcrafted traditional Indian fashion.`}
        canonical={`/product/${product.slug}`}
        image={product.images?.[0]?.url || product.images?.[0]}
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
          {/* Amazon-Style Gallery */}
          <div className="pdp-gallery amazon-gallery">
            {/* Vertical Thumbnail Strip with Hover-to-Switch */}
            <div className="pdp-thumbnails amazon-thumbnails">
              {mediaList.map((item, i) => {
                const isActive = selectedImage === i;
                return (
                  <button
                    key={i}
                    className={`pdp-thumb amazon-thumb ${isActive ? 'active' : ''}`}
                    onMouseEnter={() => setSelectedImage(i)}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View ${item.label || (item.type === 'video' ? 'Video' : 'Pose ' + (i + 1))}`}
                  >
                    <div className="amazon-thumb__img-wrap">
                      <img
                        src={item.type === 'video' ? (item.poster || item.url) : item.url}
                        alt={`${product.name} — ${item.label}`}
                      />
                      {item.type === 'video' && (
                        <span className="amazon-thumb__video-badge">
                          <Play size={11} fill="#FFF" color="#FFF" />
                          <span>VIDEO</span>
                        </span>
                      )}
                    </div>
                    <span className="amazon-thumb__label">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Image Viewer with Amazon-Style Hover Zoom */}
            <div
              className={`pdp-main-image-wrap amazon-main-viewer ${isZooming ? 'is-zoomed' : ''}`}
              ref={imageWrapRef}
              onMouseEnter={() => canHover && currentMedia?.type !== 'video' && setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => currentMedia?.type !== 'video' && setLightboxOpen(true)}
              title={currentMedia?.type !== 'video' ? 'Click to open expanded view' : undefined}
            >
              {currentMedia?.type === 'video' ? (
                <div className="amazon-video-wrapper">
                  <video
                    ref={videoRef}
                    key={currentMedia.url}
                    className="pdp-main-video"
                    poster={currentMedia.poster || undefined}
                    preload="metadata"
                    playsInline
                    loop
                    onEnded={() => setVideoPlaying(false)}
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    onError={() => {
                      setVideoPlaying(false);
                      setVideoError(true);
                    }}
                  >
                    <source src={currentMedia.url} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>

                  {/* Video load error fallback */}
                  {videoError ? (
                    <div className="amazon-video-play-overlay" onClick={handleVideoRetry}>
                      <div className="amazon-video-error">
                        <p>Video could not be loaded.</p>
                        <button type="button" className="btn-primary" onClick={handleVideoRetry}>
                          Retry Playback
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Play / Pause overlay — shown until playback starts */
                    !videoPlaying && (
                      <div className="amazon-video-play-overlay" onClick={handleVideoPlay}>
                        <button
                          type="button"
                          className="amazon-video-play-btn"
                          onClick={(e) => { e.stopPropagation(); handleVideoPlay(); }}
                          aria-label="Play video"
                        >
                          <Play size={36} fill="#FFF" color="#FFF" />
                        </button>
                      </div>
                    )
                  )}

                  {/* Quick mute toggle before playback starts (native controls handle audio while playing) */}
                  {!videoPlaying && !videoError && (
                    <button
                      type="button"
                      className="amazon-video-mute-btn"
                      onClick={handleVideoMuteToggle}
                      aria-label={videoMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  )}

                  <div className="amazon-video-badge-pill">
                    <Play size={12} fill="#FFF" color="#FFF" />
                    <span>{selectedImage + 1} / {mediaList.length} · Model Shoot · HD</span>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={currentMedia?.url || mediaList[0]?.url}
                    alt={`${product.name} — ${currentMedia?.label}`}
                    className={`pdp-main-image ${isZooming ? 'zooming' : ''}`}
                    style={
                      isZooming
                        ? {
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            transform: 'scale(2.5)',
                            willChange: 'transform',
                          }
                        : undefined
                    }
                    // Add srcset for responsive/retina images
                    srcset={currentMedia?.url
                      ? [
                          currentMedia?.url.replace(/\.jpg$/, '') + '@480w 480w',
                          currentMedia?.url.replace(/\.jpg$/, '') + '@960w 960w',
                          currentMedia?.url.replace(/\.jpg$/, '') + '@1600w 1600w',
                        ].join(', ')
                      : ''
                    }
                    // Tell browser the image will fill the main viewer area
                    sizes="(max-width: 768px) 100%, (max-width: 1024px) 85%, 70%"
                    draggable={false}
                  />

                  {/* Amazon Zoom Hint & Fullscreen Icon */}
                  <div className="amazon-zoom-pill">
                    <ZoomIn size={13} />
                    <span>Roll over image to zoom • Click to expand</span>
                  </div>

                  <button
                    type="button"
                    className="amazon-expand-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxOpen(true);
                    }}
                    aria-label="Expand image fullscreen"
                  >
                    <Maximize2 size={16} />
                  </button>
                </>
              )}

              {/* Prev / Next Arrows for quick flipping between poses */}
              <button
                type="button"
                className="amazon-nav-arrow amazon-nav-arrow--left"
                onClick={handlePrevMedia}
                aria-label="Previous pose"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="amazon-nav-arrow amazon-nav-arrow--right"
                onClick={handleNextMedia}
                aria-label="Next pose"
              >
                <ChevronRight size={22} />
              </button>

              {/* Active Pose Counter Badge (images only — video has its own combined badge) */}
              {currentMedia?.type !== 'video' && (
                <div className="amazon-pose-indicator">
                  <span>{selectedImage + 1} / {mediaList.length}</span>
                  <span className="amazon-pose-separator">•</span>
                  <span>{currentMedia?.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Column */}
          <div className="pdp-details">
            {product.categories?.name && (
              <span className="pdp-category">{product.categories.name}</span>
            )}
            <h1 className="pdp-title">{product.name}</h1>

            {/* Pricing: Original MRP strikethrough & Discounted Selling Price */}
            <div className="pdp-price-row">
              <span className="pdp-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <>
                  <span className="pdp-compare-price">MRP ₹{Number(product.compare_price).toLocaleString('en-IN')}</span>
                  <span className="pdp-save-badge">
                    {discountPercent}% OFF • LAUNCH OFFER
                  </span>
                </>
              )}
            </div>
            <p className="pdp-tax-note">
              Final Selling Price (All taxes included).{hasDiscount ? ` You save ₹${(Number(product.compare_price) - Number(product.price)).toLocaleString('en-IN')} (${discountPercent}% off).` : ''} Free express delivery across India.
            </p>

            {/* Color Selector */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div className="pdp-option-group">
                <label className="pdp-label">
                  Color: <strong>{selectedColor}</strong>
                </label>
                <div className="pdp-colors-list">
                  {product.colors.map((c) => {
                    const name = typeof c === 'string' ? c : c.name;
                    const hex = typeof c === 'string' ? '#C2542D' : c.hex;
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
                    <p>{product.description || 'A striking two-piece ensemble in a rich rust hue, featuring a button-down tunic with mandarin collar and scalloped floral embroidery.'}</p>
                    <ul>
                      <li>Fabric: {product.fabric || 'Pure Silk Blend'}</li>
                      <li>Fit: {product.fit || 'Relaxed Straight Fit'}</li>
                      <li>Neckline: {product.neckline || 'Mandarin Collar with Front Button Placket'}</li>
                      <li>Sleeves: {product.sleeves || 'Three-Quarter Sleeves with Scalloped Embroidery'}</li>
                      <li>Occasion: {product.occasion || 'Festive, Celebrations, Evening Gatherings'}</li>
                      <li>Gentle hand wash in cold water or dry clean recommended</li>
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

        {/* Amazon-Style Fullscreen Lightbox Modal */}
        {lightboxOpen && (
          <div className="amazon-lightbox" onClick={() => setLightboxOpen(false)}>
            <div className="amazon-lightbox__content" onClick={(e) => e.stopPropagation()}>
              <button
                className="amazon-lightbox__close"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close expanded view"
              >
                <X size={26} />
              </button>

              <div className="amazon-lightbox__header">
                <h3>{product.name}</h3>
                <span className="amazon-lightbox__counter">
                  Pose {selectedImage + 1} of {mediaList.length}: {currentMedia?.label}
                </span>
              </div>

              <div className="amazon-lightbox__main">
                <button
                  className="amazon-lightbox__nav-btn amazon-lightbox__nav-btn--prev"
                  onClick={handlePrevMedia}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={36} />
                </button>

                <div
                  className={`amazon-lightbox__stage ${lightboxZoomed ? 'is-zoomed' : ''}`}
                  onMouseMove={(e) => {
                    if (!lightboxZoomed) return;
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
                    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
                    setLightboxZoomPos({ x, y });
                  }}
                >
                  {currentMedia?.type === 'video' ? (
                    <video
                      key={currentMedia.url}
                      poster={currentMedia.poster || undefined}
                      preload="metadata"
                      controls
                      playsInline
                      className="amazon-lightbox__video"
                    >
                      <source src={currentMedia.url} type="video/mp4" />
                      Your browser does not support HTML5 video.
                    </video>
                  ) : (
                    <img
                      src={currentMedia?.url}
                      alt={`${product.name} — ${currentMedia?.label}`}
                      className={`amazon-lightbox__img ${lightboxZoomed ? 'zoomed' : ''}`}
                      onClick={() => setLightboxZoomed((z) => !z)}
                      style={
                        lightboxZoomed
                          ? {
                              transformOrigin: `${lightboxZoomPos.x}% ${lightboxZoomPos.y}%`,
                              transform: 'scale(2.2)',
                            }
                          : undefined
                      }
                      title={lightboxZoomed ? 'Click to reset zoom' : 'Click to zoom in'}
                      draggable={false}
                    />
                  )}
                </div>

                <button
                  className="amazon-lightbox__nav-btn amazon-lightbox__nav-btn--next"
                  onClick={handleNextMedia}
                  aria-label="Next photo"
                >
                  <ChevronRight size={36} />
                </button>
              </div>

              {/* Bottom Thumbnail Strip */}
              <div className="amazon-lightbox__thumbs">
                {mediaList.map((item, i) => (
                  <button
                    key={i}
                    className={`amazon-lightbox__thumb ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img
                      src={item.type === 'video' ? (item.poster || item.url) : item.url}
                      alt={item.label}
                    />
                    {item.type === 'video' && (
                      <span className="amazon-lightbox__video-icon">
                        <Play size={10} fill="#FFF" color="#FFF" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
