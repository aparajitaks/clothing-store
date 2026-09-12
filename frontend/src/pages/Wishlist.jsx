import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Trash2 } from 'lucide-react';
import useWishlistStore from '../store/wishlistStore';
import useCartStore from '../store/cartStore';
import useUIStore from '../store/uiStore';
import toast from 'react-hot-toast';
import './Wishlist.css';

export default function WishlistPage() {
  const { items, remove } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const handleMoveToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to wardrobe`);
    openCart();
  };

  if (items.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container wishlist-empty">
          <Heart size={48} strokeWidth={1} className="wishlist-empty__icon" />
          <h1 className="wishlist-empty__title">Your Wishlist is Empty</h1>
          <p className="wishlist-empty__sub">
            Save pieces you adore and revisit them whenever inspiration strikes.
          </p>
          <Link to="/shop" className="btn-primary">Discover Pieces</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-hero container">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="wishlist-eyebrow">Your Saved Pieces</p>
          <h1 className="wishlist-title">Wishlist</h1>
          <p className="wishlist-count">{items.length} piece{items.length !== 1 ? 's' : ''}</p>
        </motion.div>
      </div>

      <div className="container wishlist-body">
        <div className="wishlist-grid">
          {items.map((product, i) => {
            const img = Array.isArray(product.images) && product.images.length > 0
              ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
              : product.image;

            const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
            const discount = hasDiscount
              ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
              : 0;

            return (
              <motion.div
                key={product.id}
                className="wishlist-item"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/product/${product.slug}`} className="wishlist-item__image-wrap">
                  <img src={img} alt={product.name} className="wishlist-item__image" />
                  {hasDiscount && (
                    <span className="wishlist-item__badge">-{discount}%</span>
                  )}
                </Link>

                <div className="wishlist-item__info">
                  {product.categories?.name && (
                    <p className="wishlist-item__category">{product.categories.name}</p>
                  )}
                  <Link to={`/product/${product.slug}`} className="wishlist-item__name">
                    {product.name}
                  </Link>
                  <div className="wishlist-item__prices">
                    <span className="wishlist-item__price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                    {hasDiscount && (
                      <span className="wishlist-item__compare">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  <div className="wishlist-item__actions">
                    <button
                      className="btn-primary wishlist-item__cart-btn"
                      onClick={() => handleMoveToCart(product)}
                    >
                      <ShoppingBag size={15} />
                      Add to Wardrobe
                    </button>
                    <button
                      className="wishlist-item__remove"
                      onClick={() => remove(product.id)}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
