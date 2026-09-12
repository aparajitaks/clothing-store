import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useUIStore from '../store/uiStore';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  if (!product) return null;

  // Extract images
  let primaryImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600';
  let secondaryImage = null;

  if (Array.isArray(product.images) && product.images.length > 0) {
    primaryImage = typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url;
    if (product.images.length > 1) {
      secondaryImage = typeof product.images[1] === 'string' ? product.images[1] : product.images[1].url;
    }
  }

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

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;

  return (
    <div
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="product-card__image-container">
        <img
          src={hovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-card__badges">
          {product.is_featured && <span className="badge badge--gold">Featured</span>}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="badge badge--low">Low Stock</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`product-card__wishlist-btn ${isWishlisted ? 'active' : ''}`}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={isWishlisted ? '#C9A96E' : 'none'} color={isWishlisted ? '#C9A96E' : '#1A1A1A'} />
        </button>

        {/* Quick Add Overlay */}
        <div className="product-card__overlay">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="product-card__quick-add-btn"
          >
            <ShoppingBag size={16} /> Quick Add
          </button>
        </div>
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
            <span className="product-card__compare-price">
              ₹{Number(product.compare_price).toLocaleString('en-IN')}
            </span>
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
      </div>
    </div>
  );
}
