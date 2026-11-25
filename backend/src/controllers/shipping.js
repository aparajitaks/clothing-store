const shippingService = require('../services/shippingService');
const taxService = require('../services/taxService');
const { success, badRequest } = require('../utils/apiResponse');

/**
 * GET /api/shipping/pincode/:pincode
 * GET /api/shipping/check-pincode/:pincode  (alias)
 * Returns deliverability info — ALWAYS returns 200 so frontend can check result.deliverable
 */
const checkPincode = (req, res, next) => {
  try {
    const { pincode } = req.params;
    if (!pincode) return badRequest(res, 'Pincode is required');
    const result = shippingService.checkPincode(pincode);
    // Always 200 — frontend reads result.deliverable (true/false)
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shipping/calculate
 * Body: { subtotal: number, pincode?: string }
 */
const calculateShipping = (req, res, next) => {
  try {
    const { subtotal, pincode } = req.body;
    if (subtotal === undefined || subtotal === null) {
      return badRequest(res, 'subtotal is required');
    }
    const result = shippingService.calculateShippingFee(Number(subtotal));

    // Optionally check pincode deliverability
    let deliveryInfo = null;
    if (pincode) {
      deliveryInfo = shippingService.checkPincode(pincode);
    }

    return success(res, {
      fee: result.fee,
      isFree: result.isFree,
      freeThreshold: result.freeThreshold,
      remainingForFree: result.remainingForFree,
      ...(deliveryInfo && { delivery: deliveryInfo }),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shipping/tax
 * Body: { items: [{product_name, unit_price, quantity}], isGstRegistered?, state? }
 */
const calculateTax = (req, res, next) => {
  try {
    const { items, isGstRegistered = true, state = 'Karnataka' } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return badRequest(res, 'items array is required');
    }
    const result = taxService.calculateTax(items, isGstRegistered, state);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { checkPincode, calculateShipping, calculateTax };
