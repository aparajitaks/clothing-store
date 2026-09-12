const { SEED_COUPONS } = require('../data/seedData');

// In-memory coupon state for dev/testing; easily connects to Supabase coupons table
let activeCoupons = [...SEED_COUPONS];

const couponService = {
  /**
   * Validate and calculate discount for a given coupon code and cart subtotal
   */
  validateCoupon: (code, subtotal) => {
    if (!code || typeof code !== 'string') {
      return { valid: false, message: 'Please enter a valid coupon code' };
    }

    const cleanedCode = code.trim().toUpperCase();
    const coupon = activeCoupons.find((c) => c.code.toUpperCase() === cleanedCode && c.is_active);

    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code' };
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, message: 'This coupon code has expired' };
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return {
        valid: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.min_order_amount.toLocaleString('en-IN')}`,
      };
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount,
      newTotal: Math.max(0, subtotal - discountAmount),
    };
  },

  recordUsage: (code) => {
    const cleanedCode = code.trim().toUpperCase();
    const coupon = activeCoupons.find((c) => c.code.toUpperCase() === cleanedCode);
    if (coupon) {
      coupon.times_used = (coupon.times_used || 0) + 1;
    }
  },

  getAllCoupons: () => activeCoupons,

  createCoupon: (couponData) => {
    const newCoupon = {
      ...couponData,
      code: couponData.code.trim().toUpperCase(),
      times_used: 0,
      is_active: couponData.is_active !== undefined ? couponData.is_active : true,
    };
    activeCoupons.unshift(newCoupon);
    return newCoupon;
  },

  deleteCoupon: (code) => {
    const initialLen = activeCoupons.length;
    activeCoupons = activeCoupons.filter((c) => c.code.toUpperCase() !== code.trim().toUpperCase());
    return activeCoupons.length < initialLen;
  },
};

module.exports = couponService;
