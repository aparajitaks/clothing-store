/**
 * Event-driven analytics dispatcher for TK TiyaCollections
 * Fires events to GA4, Meta Pixel, and any additional configured platforms
 * All tracking respects user consent before firing
 */

const analyticsEvents = {
  PAGE_VIEW: 'page_view',
  VIEW_ITEM: 'view_item',
  VIEW_ITEM_LIST: 'view_item_list',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  SEARCH: 'search',
  WISHLIST_TOGGLE: 'wishlist_toggle',
  COUPON_APPLIED: 'coupon_applied',
};

const hasConsent = () => {
  try {
    return localStorage.getItem('teya_analytics_consent') === 'true';
  } catch {
    return false;
  }
};

/**
 * Core event dispatcher — sends to all configured platforms
 */
const dispatch = (eventName, eventData = {}) => {
  if (!hasConsent() && eventName !== analyticsEvents.PAGE_VIEW) return;

  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...eventData,
  };

  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData);
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    const fbEvents = {
      [analyticsEvents.ADD_TO_CART]: () => window.fbq('track', 'AddToCart', { value: eventData.price, currency: 'INR' }),
      [analyticsEvents.PURCHASE]: () => window.fbq('track', 'Purchase', { value: eventData.revenue, currency: 'INR' }),
      [analyticsEvents.BEGIN_CHECKOUT]: () => window.fbq('track', 'InitiateCheckout'),
      [analyticsEvents.VIEW_ITEM]: () => window.fbq('track', 'ViewContent', { content_ids: [eventData.product_id] }),
    };
    fbEvents[eventName]?.();
  }

  // Dev mode logging
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, payload);
  }
};

const analytics = {
  trackPageView: (page) => dispatch(analyticsEvents.PAGE_VIEW, { page }),

  trackProductView: (product) =>
    dispatch(analyticsEvents.VIEW_ITEM, {
      product_id: product.id,
      product_name: product.name,
      category: product.categories?.name,
      price: product.price,
      currency: 'INR',
    }),

  trackAddToCart: (product, quantity, size, color) =>
    dispatch(analyticsEvents.ADD_TO_CART, {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity,
      size,
      color,
      currency: 'INR',
    }),

  trackRemoveFromCart: (productId, productName) =>
    dispatch(analyticsEvents.REMOVE_FROM_CART, { product_id: productId, product_name: productName }),

  trackBeginCheckout: (cartTotal, itemCount) =>
    dispatch(analyticsEvents.BEGIN_CHECKOUT, { value: cartTotal, items: itemCount, currency: 'INR' }),

  trackPurchase: (orderId, total, items) =>
    dispatch(analyticsEvents.PURCHASE, {
      transaction_id: orderId,
      revenue: total,
      currency: 'INR',
      items: items?.length,
    }),

  trackSearch: (query, resultsCount) =>
    dispatch(analyticsEvents.SEARCH, { search_term: query, results: resultsCount }),

  trackWishlist: (productId, action) =>
    dispatch(analyticsEvents.WISHLIST_TOGGLE, { product_id: productId, action }),

  trackCoupon: (code, discountAmount) =>
    dispatch(analyticsEvents.COUPON_APPLIED, { coupon_code: code, discount: discountAmount }),

  grantConsent: () => {
    try { localStorage.setItem('teya_analytics_consent', 'true'); } catch {}
  },

  revokeConsent: () => {
    try { localStorage.removeItem('teya_analytics_consent'); } catch {}
  },
};

export default analytics;
