const couponService = require('../services/couponService');
const { success, badRequest, notFound, created } = require('../utils/apiResponse');

const validateCoupon = (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return badRequest(res, 'Coupon code is required');

    const result = couponService.validateCoupon(code, Number(subtotal || 0));
    if (!result.valid) {
      return badRequest(res, result.message);
    }

    // Enrich response with fields frontend needs for discount calculation
    const responseData = {
      ...result,
      discount_type: result.discountType === 'fixed' ? 'flat' : result.discountType,
      discount_value: result.discountValue,
      discount_amount: result.discountAmount,
    };

    return success(res, responseData, 'Coupon applied successfully');
  } catch (err) {
    next(err);
  }
};

const listCoupons = (req, res, next) => {
  try {
    const coupons = couponService.getAllCoupons();
    return success(res, coupons);
  } catch (err) {
    next(err);
  }
};

const createCoupon = (req, res, next) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, usage_limit, expires_at, description } = req.body;
    if (!code || !discount_value) return badRequest(res, 'Code and discount value are required');

    // Normalize 'flat' → 'fixed' for backend consistency
    const normalizedType = (discount_type === 'flat' ? 'fixed' : discount_type) || 'percentage';

    const newCoupon = couponService.createCoupon({
      code,
      discount_type: normalizedType,
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount || 0),
      usage_limit: Number(usage_limit || 100),
      expires_at: expires_at || '2028-12-31T23:59:59Z',
      description: description || 'Promotional Discount',
      is_active: true,
      times_used: 0,
    });

    return created(res, newCoupon, 'Coupon created successfully');
  } catch (err) {
    next(err);
  }
};

const deleteCoupon = (req, res, next) => {
  try {
    const { code } = req.params;
    const removed = couponService.deleteCoupon(code);
    if (!removed) return notFound(res, 'Coupon not found');
    return success(res, {}, 'Coupon deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validateCoupon,
  listCoupons,
  createCoupon,
  deleteCoupon,
};
