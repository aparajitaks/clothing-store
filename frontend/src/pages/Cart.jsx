import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Tag, Loader2, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import api from '../lib/axios';
import SEO from '../components/SEO';
import './Cart.css';

// GST rate for apparel (5% for items ≤ ₹1000, 12% above in India)
function getGstRate(subtotal) {
  return subtotal <= 1000 ? 0.05 : 0.12;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount_type, discount_value, discountAmount }
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 150;

  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === 'flat'
      ? appliedCoupon.discount_value
      : Math.round((subtotal * appliedCoupon.discount_value) / 100)
    : 0;

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstRate = getGstRate(taxableAmount);
  const gstAmount = Math.round(taxableAmount * gstRate);
  // Prices already include GST (inclusive model common in India)
  // We show the GST component for transparency
  const gstInclusive = Math.round(taxableAmount - taxableAmount / (1 + gstRate));
  const total = Math.max(0, taxableAmount + shipping);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code, subtotal });
      const data = res.data?.data || res.data;

      setAppliedCoupon({
        code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        description: data.description,
        discountAmount: data.discount_amount || 0,
      });
      toast.success(`Coupon "${code}" applied — ${data.description || data.discount_value + '% off'}!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code.';
      toast.error(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode('');
    toast('Coupon removed', { icon: '🏷️' });
  };

  if (items.length === 0) {
    return (
      <>
        <SEO title="Your Bag" canonical="/cart" noIndex />
        <div className="cart-page-empty container">
          <ShoppingBag size={56} strokeWidth={1} />
          <h2>Your Wardrobe Bag is Empty</h2>
          <p>Explore our latest creations crafted from pure natural fabrics.</p>
          <Link to="/shop" className="btn-primary">
            Discover The Collection <ArrowRight size={18} />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Your Bag" canonical="/cart" noIndex />
      <div className="cart-page container">
        <div className="cart-header">
          <h1 className="cart-title">Your Wardrobe Bag</h1>
          <span className="cart-count">({items.reduce((s, i) => s + i.quantity, 0)} Items)</span>
        </div>

        <div className="cart-grid">
          {/* Items List */}
          <div className="cart-items-wrapper">
            <div className="cart-table-head">
              <span>Garment</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>

            <div className="cart-items-list">
              {items.map((item) => {
                const key = `${item.id}-${item.size || ''}-${item.color || ''}`;
                return (
                  <div key={key} className="cart-row">
                    <div className="cart-row__product">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300'}
                        alt={item.name}
                        className="cart-row__img"
                      />
                      <div className="cart-row__meta">
                        <Link to={`/product/${item.slug}`} className="cart-row__name">
                          {item.name}
                        </Link>
                        {(item.size || item.color) && (
                          <div className="cart-row__variants">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        )}
                        <span className="cart-row__unit-price">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="cart-row__delete-mobile"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-row__quantity">
                      <div className="quantity-stepper">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-row__subtotal">
                      <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="cart-row__delete"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer-actions">
              <Link to="/shop" className="continue-shopping">
                ← Continue Shopping
              </Link>
              <button onClick={clearCart} className="clear-cart-btn">
                Clear Bag
              </button>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="cart-summary-wrapper">
            <div className="cart-summary">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-row">
                <span>Bag Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-row">
                <span>Express Delivery</span>
                <span>{shipping === 0 ? <strong style={{ color: '#2D6A4F' }}>FREE</strong> : `₹${shipping}`}</span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-row summary-discount">
                  <span>Coupon Discount</span>
                  <span>−₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* GST Breakdown */}
              <div className="summary-gst-box">
                <div className="summary-row summary-gst">
                  <span>GST ({(gstRate * 100).toFixed(0)}% incl.)</span>
                  <span>₹{gstInclusive.toLocaleString('en-IN')}</span>
                </div>
                <p className="gst-note">Prices are GST-inclusive as per Indian tax law.</p>
              </div>

              <div className="summary-divider" />

              {/* Promo code form */}
              {!appliedCoupon ? (
                <form onSubmit={handleApplyPromo} className="promo-form">
                  <div className="promo-input-wrap">
                    <Tag size={16} className="promo-icon" />
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button type="submit" className="promo-btn" disabled={couponLoading}>
                    {couponLoading ? <Loader2 size={14} className="spinner" /> : 'Apply'}
                  </button>
                </form>
              ) : (
                <div className="coupon-applied-badge">
                  <div className="coupon-applied-left">
                    <CheckCircle size={16} color="#2D6A4F" />
                    <div>
                      <span className="coupon-code-text">{appliedCoupon.code}</span>
                      <span className="coupon-desc-text">{appliedCoupon.description}</span>
                    </div>
                  </div>
                  <button className="coupon-remove-btn" onClick={handleRemoveCoupon}>
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-row summary-total">
                <span>Total Payable</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => navigate('/checkout', { state: { appliedCoupon, discountAmount } })}
                className="btn-primary btn-block summary-checkout-btn"
              >
                Proceed to Secure Checkout <ArrowRight size={18} />
              </button>

              <div className="summary-secure">
                <ShieldCheck size={18} />
                <span>Encrypted 256-bit checkout with Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
