import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useUIStore from '../store/uiStore';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const freeShippingThreshold = 999;
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="cart-drawer__header">
              <div className="cart-drawer__title">
                <ShoppingBag size={20} />
                <span>Your Wardrobe ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              </div>
              <button onClick={closeCart} className="cart-drawer__close" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="cart-drawer__shipping-bar">
              {remaining > 0 ? (
                <p>Add <strong>₹{remaining.toLocaleString('en-IN')}</strong> more for <span>FREE Delivery</span></p>
              ) : (
                <p className="free-unlocked">✨ You have unlocked <strong>FREE Express Shipping</strong>!</p>
              )}
              <div className="shipping-progress">
                <div className="shipping-progress__fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Items List */}
            <div className="cart-drawer__items">
              {items.length === 0 ? (
                <div className="cart-drawer__empty">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="cart-drawer__empty-title">Your shopping bag is empty</p>
                  <p className="cart-drawer__empty-sub">Discover our latest handcrafted silhouettes</p>
                  <button onClick={() => { closeCart(); navigate('/shop'); }} className="btn-primary">
                    Explore Collection
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const key = `${item.id}-${item.size || ''}-${item.color || ''}`;
                  return (
                    <div key={key} className="cart-item">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300'}
                        alt={item.name}
                        className="cart-item__image"
                      />
                      <div className="cart-item__info">
                        <div className="cart-item__top">
                          <h4 className="cart-item__name">{item.name}</h4>
                          <button
                            onClick={() => removeItem(item.id, item.size, item.color)}
                            className="cart-item__remove"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {(item.size || item.color) && (
                          <div className="cart-item__variant">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        )}

                        <div className="cart-item__bottom">
                          <div className="quantity-stepper">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="cart-item__price">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-drawer__subtotal">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="cart-drawer__taxes">Shipping & taxes calculated at checkout</p>
                <div className="cart-drawer__actions">
                  <button onClick={handleCheckout} className="btn-primary btn-block">
                    Proceed to Checkout <ArrowRight size={18} />
                  </button>
                  <button onClick={() => { closeCart(); navigate('/cart'); }} className="btn-outline btn-block">
                    View Bag Details
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
