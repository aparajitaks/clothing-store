import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useUIStore from '../store/uiStore';
import { buildSrcSet, handleImageError, PRODUCT_CARD_SIZES } from '../utils/images';
import './ProductCard.css';

export default function ProductCard({ product, priority = false }) {
  const [activePoseIndex, setActivePoseIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const didSwipeRef = useRef(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  // Extract all media poses (front, back, left, right, video)
  const mediaList = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map((img, idx) => {
        if (typeof img === 'string') {
          const isVid = img.endsWith('.mp4') || img.includes('video');
          return {
            url: img,
            type: isVid ? 'video' : 'image',
            poster: product.video_poster || null,
          };
        }
        return {
          url: img.url,
          type: img.type || (img.url?.endsWith('.mp4') ? 'video' : 'image'),
          poster: img.poster || product.video_poster || null,
          alt: img.alt || product.name,
        };
      });
    }
    // Fallback to first product's video if available, else default image
    const fallbackUrl = '/products/rust-embroidered-kurta-set/front.jpg';
    return [{ url: fallbackUrl, type: 'image' }];
  }, [product]);

  if (!product) return null;

  const currentPose = mediaList[activePoseIndex] || mediaList[0];
  const imageSrc =
    currentPose?.type === 'video'
      ? (currentPose.poster || mediaList.find((m) => m.type === 'image')?.url || currentPose?.url)
      : currentPose?.url;

  const handlePrevPose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePoseIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    setVideoFailed(false);
  };

  const handleNextPose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePoseIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
    setVideoFailed(false);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Default to first size if available
    const defaultSize = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null;
    const defaultColor = Array.isArray(product.colors) && product.colors.length > 0
      ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name)
      : null;

    addItem(product, 1, defaultSize, defaultColor);
    toast.success(`Added ${product.name} to wardrobe`);
    openCart();
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(!isWishlisted ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  const handleTouchStart = (e) => {
    if (mediaList.length <= 1 || !e.touches?.[0]) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    didSwipeRef.current = false;
  };

  const handleTouchEnd = (e) => {
    if (mediaList.length <= 1 || !e.changedTouches?.[0]) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      didSwipeRef.current = true;
      if (dx < 0) {
        setActivePoseIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
      } else {
        setActivePoseIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
      }
    }
  };

  const handleImageLinkClick = (e) => {
    if (didSwipeRef.current) {
      e.preventDefault();
      didSwipeRef.current = false;
    }
  };

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;

  return (
    <div
      className="product-card"
      onMouseLeave={() => {
        setActivePoseIndex(0);
      }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="product-card__image-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleImageLinkClick}
      >
        {currentPose?.type === 'video' && !videoFailed ? (
          <video
            key={currentPose.url}
            poster={currentPose.poster || undefined}
            preload="metadata"
            autoPlay
            muted
            playsInline
            loop
            onError={() => setVideoFailed(true)}
            className="product-card__image product-card__video"
          >
            <source src={currentPose.url} type="video/mp4" />
          </video>
        ) : (
          <img
            src={imageSrc}
            alt={product.name}
            className="product-card__image"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            srcSet={buildSrcSet(imageSrc)}
            sizes={PRODUCT_CARD_SIZES}
            onError={(e) => handleImageError(e, imageSrc)}
          />
        )}

        {/* Badges (priority: Low Stock > Discount > Featured) */}
        <div className="product-card__badges">
          {product.stock <= 3 && product.stock > 0 && (
            <span className="badge badge--low">Low Stock</span>
          )}
          {hasDiscount && <span className="badge badge--discount">{discountPercent}% OFF</span>}
          {product.is_featured && <span className="badge badge--gold">Featured</span>}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`product-card__wishlist-btn ${isWishlisted ? 'active' : ''}`}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isWishlisted ? '#C9A96E' : 'none'} color={isWishlisted ? '#C9A96E' : '#1A1A1A'} />
        </button>

        {/* Quick Add Overlay (desktop hover only) */}
        <div className="product-card__overlay">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="product-card__quick-add-btn"
          >
            <ShoppingBag size={15} /> Quick Add
          </button>
        </div>

        {/* Pose Navigation Arrows (desktop hover only) */}
        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              className="product-card__pose-arrow product-card__pose-arrow--left"
              onClick={handlePrevPose}
              aria-label="Previous pose"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="product-card__pose-arrow product-card__pose-arrow--right"
              onClick={handleNextPose}
              aria-label="Next pose"
            >
              <ChevronRight size={16} />
            </button>

            {/* Interactive Pose Thumbnails / Dots Bar */}
            <div className="product-card__pose-strip" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              {mediaList.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`pose-strip-btn ${activePoseIndex === idx ? 'active' : ''}`}
                  onMouseEnter={() => setActivePoseIndex(idx)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePoseIndex(idx);
                  }}
                  aria-label={item.type === 'video' ? 'Model Video shoot' : `Pose ${idx + 1}`}
                  title={item.type === 'video' ? 'Model Video shoot' : `Pose ${idx + 1}`}
                >
                  {item.type === 'video' ? (
                    <span className="pose-strip-vid-icon"><Play size={7} fill="#FFF" color="#FFF" /></span>
                  ) : (
                    <span className="pose-strip-dot" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </Link>

      {/* Info Section */}
      <div className="product-card__info">
        {product.categories?.name && (
          <span className="product-card__category">{product.categories.name}</span>
        )}
        <h3 className="product-card__title">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="product-card__pricing">
          <span className="product-card__price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <>
              <span className="product-card__compare-price">
                ₹{Number(product.compare_price).toLocaleString('en-IN')}
              </span>
              <span className="product-card__discount-pill">{discountPercent}% OFF</span>
            </>
          )}
        </div>

        {/* Size chips preview if available */}
        {Array.isArray(product.sizes) && product.sizes.length > 0 && (
          <div className="product-card__sizes">
            {product.sizes.slice(0, 5).map((size) => (
              <span key={size} className="size-pill">{size}</span>
            ))}
          </div>
        )}

        {/* Touch / Mobile Quick Add (below info, never obscures product image) */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className="product-card__mobile-add"
        >
          <ShoppingBag size={13} /> Quick Add
        </button>
      </div>
    </div>
  );
}
