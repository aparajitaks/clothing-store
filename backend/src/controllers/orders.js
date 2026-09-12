const crypto = require('crypto');
const supabase = require('../config/db');
const { success, created, error, notFound, badRequest, unauthorized } = require('../utils/apiResponse');
const inventoryService = require('../services/inventoryService');
const couponService = require('../services/couponService');
const taxService = require('../services/taxService');
const paymentService = require('../services/paymentService');
const shippingService = require('../services/shippingService');
const emailService = require('../services/emailService');
const { STORE_SETTINGS } = require('../data/seedData');

// Fallback in-memory orders repository for testing / offline dev
const localOrders = [];

/**
 * POST /api/orders/create
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, couponCode, paymentMethod = 'card', isSimulated = false } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return badRequest(res, 'Order items are required');
    }
    if (!shippingAddress) {
      return badRequest(res, 'Shipping address is required');
    }

    // Validate required address fields
    const requiredFields = ['name', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        return badRequest(res, `Shipping address missing: ${field}`);
      }
    }

    // Fetch and validate product prices server-side
    let orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const pid = item.productId || item.id;
      const product = inventoryService.getProductBySlug(pid) || inventoryService.getProducts().find((p) => p.id === pid);

      if (!product) {
        return badRequest(res, `Product not found: ${pid}`);
      }

      // Check variant level stock
      const stockCheck = inventoryService.checkVariantStock(product.id, item.size, item.color, item.quantity);
      if (!stockCheck.available) {
        return badRequest(res, stockCheck.message);
      }

      const price = Number(product.price);
      const qty = Number(item.quantity || 1);
      const lineTotal = parseFloat((price * qty).toFixed(2));
      subtotal += lineTotal;

      const primaryImg = product.images?.find((i) => i.isPrimary) || product.images?.[0];
      const imgUrl = typeof primaryImg === 'string' ? primaryImg : primaryImg?.url || product.image;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: imgUrl,
        size: item.size || null,
        color: item.color || null,
        quantity: qty,
        unit_price: price,
        total: lineTotal,
      });
    }

    subtotal = parseFloat(subtotal.toFixed(2));

    // Calculate coupon discount
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const couponResult = couponService.validateCoupon(couponCode, subtotal);
      if (couponResult.valid) {
        discount = couponResult.discountAmount;
        appliedCoupon = couponResult.code;
      }
    }

    // Calculate shipping fee
    const shippingCalc = shippingService.calculateShippingFee(subtotal - discount);
    const shippingFee = shippingCalc.fee;

    // Total
    const total = parseFloat(Math.max(0, subtotal - discount + shippingFee).toFixed(2));

    // Tax calculation breakdown
    const taxBreakdown = taxService.calculateTax(orderItems, true, shippingAddress.state);

    // Create unique order reference
    const orderId = `TK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Handle Payment Provider creation
    let paymentOrderData = null;
    if (paymentMethod.toLowerCase() === 'cod') {
      if (!STORE_SETTINGS.enable_cod) {
        return badRequest(res, 'Cash on Delivery is currently unavailable.');
      }
      paymentOrderData = {
        provider: 'cod',
        orderId: `cod_${orderId}`,
        isSimulated: false,
      };
    } else {
      paymentOrderData = await paymentService.createOrder({
        amountInInr: total,
        receiptId: orderId,
        isSimulated: isSimulated || !paymentService.isConfigured(),
      });
    }

    const orderRecord = {
      id: orderId,
      user_id: req.user?.id || 'guest',
      customer_email: req.user?.email || shippingAddress.email || 'customer@example.com',
      customer_name: shippingAddress.name,
      razorpay_order_id: paymentOrderData.orderId,
      status: paymentMethod.toLowerCase() === 'cod' ? 'processing' : 'payment_initiated',
      subtotal,
      shipping_fee: shippingFee,
      discount,
      coupon_code: appliedCoupon,
      total,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      tax_breakdown: taxBreakdown,
      order_items: orderItems,
      tracking: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If COD, assign tracking right away & deduct stock
    if (paymentMethod.toLowerCase() === 'cod') {
      orderRecord.tracking = shippingService.createShipment(orderId, shippingAddress);
      inventoryService.deductStock(orderItems);
      if (appliedCoupon) couponService.recordUsage(appliedCoupon);

      // Trigger order confirmation email
      emailService.sendOrderConfirmation(orderRecord, orderRecord.customer_email);
    }

    // Persist to Supabase if client active
    if (supabase) {
      try {
        const { data: dbOrder, error: oErr } = await supabase
          .from('orders')
          .insert({
            user_id: req.user?.id || null,
            razorpay_order_id: paymentOrderData.orderId,
            status: orderRecord.status,
            subtotal,
            shipping_fee: shippingFee,
            discount,
            total,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
          })
          .select()
          .single();

        if (!oErr && dbOrder) {
          orderRecord.id = dbOrder.id;
          await supabase.from('order_items').insert(
            orderItems.map((oi) => ({ ...oi, order_id: dbOrder.id }))
          );
        }
      } catch (e) {
        console.warn('Supabase order insert fallback to memory:', e.message);
      }
    }

    localOrders.unshift(orderRecord);

    return created(res, {
      order: orderRecord,
      razorpayOrderId: paymentOrderData.orderId,
      isSimulated: paymentOrderData.isSimulated,
      amount: Math.round(total * 100),
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders/verify
 * Server-side payment confirmation & stock deduction
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return badRequest(res, 'Payment credentials missing');
    }

    // Server-side verification
    const verification = paymentService.verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!verification.isValid) {
      return badRequest(res, verification.message || 'Payment signature verification failed');
    }

    // Find and update order
    let order = localOrders.find((o) => o.razorpay_order_id === razorpayOrderId);

    if (!order && supabase) {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();
      order = data;
    }

    if (!order) {
      return notFound(res, 'Matching order could not be located');
    }

    // Update order status to paid / processing
    order.status = 'paid';
    order.razorpay_payment_id = razorpayPaymentId;
    order.razorpay_signature = razorpaySignature;
    order.paid_at = new Date().toISOString();
    order.tracking = shippingService.createShipment(order.id, order.shipping_address);

    // Deduct stock safely
    inventoryService.deductStock(order.order_items || []);

    // Record coupon usage if applied
    if (order.coupon_code) {
      couponService.recordUsage(order.coupon_code);
    }

    // Dispatch Order Confirmation Email
    emailService.sendOrderConfirmation(order, order.customer_email);

    if (supabase) {
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        })
        .eq('id', order.id);
    }

    return success(res, {
      orderId: order.id,
      status: order.status,
      tracking: order.tracking,
      message: 'Payment confirmed successfully. Wardrobe dispatch initiated.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let orders = localOrders.filter((o) => !userId || o.user_id === userId || o.user_id === 'guest');

    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          orders = data;
        }
      } catch (e) {
        // fallback to memory
      }
    }

    return success(res, orders);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order = localOrders.find((o) => o.id === id || o.razorpay_order_id === id);

    if (!order && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .single();
        if (!error && data) order = data;
      } catch (e) {
        // quiet
      }
    }

    if (!order) return notFound(res, 'Order not found');

    return success(res, order);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/orders/:id/return-request
 */
const submitReturnRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, reason, selectedItems, replacementDetails } = req.body;

    const order = localOrders.find((o) => o.id === id);
    if (!order) return notFound(res, 'Order not found');

    const returnRecord = {
      id: `RET-${Date.now().toString(36).toUpperCase()}`,
      orderId: id,
      type: type || 'return', // 'return' | 'exchange'
      reason: reason || 'Size adjustment',
      selectedItems: selectedItems || order.order_items,
      replacementDetails: replacementDetails || null,
      status: 'review_pending', // 'review_pending' | 'approved' | 'rejected' | 'processed'
      createdAt: new Date().toISOString(),
    };

    order.return_request = returnRecord;
    order.status = 'return_requested';

    return success(res, returnRecord, 'Your return/exchange request has been logged. Our concierge will review it within 24 hours.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  submitReturnRequest,
  localOrders,
};
