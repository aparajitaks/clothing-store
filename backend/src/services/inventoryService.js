/**
 * Variant-Level Inventory Service
 * Manages SKU-specific stock levels (size + color combinations),
 * pre-checkout availability checks, and post-payment inventory deductions.
 */

const { SEED_PRODUCTS } = require('../data/seedData');

// Local in-memory store of products with variant matrices for dev/fallback mode
const inMemoryProducts = JSON.parse(JSON.stringify(SEED_PRODUCTS));

const inventoryService = {
  /**
   * Check if requested item quantity is available for the given variant
   */
  checkVariantStock: (productId, size, color, quantity = 1) => {
    const product = inMemoryProducts.find((p) => p.id === productId || p.slug === productId);
    if (!product) {
      return { available: false, message: 'Product not found', currentStock: 0 };
    }

    // If product has specific variant matrix
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const variant = product.variants.find(
        (v) => (!size || v.size === size) && (!color || v.color.toLowerCase() === color.toLowerCase())
      );

      if (!variant) {
        // Variant combination does not exist
        return {
          available: false,
          message: `Combination "${color || 'Default'} / ${size || 'Standard'}" is not available`,
          currentStock: 0,
        };
      }

      if (variant.stock < quantity) {
        return {
          available: false,
          message: `Only ${variant.stock} left in "${variant.color} / ${variant.size}"`,
          currentStock: variant.stock,
        };
      }

      return { available: true, currentStock: variant.stock, sku: variant.sku };
    }

    // Fallback to overall product stock if variants are not granularly split
    if (product.stock < quantity) {
      return {
        available: false,
        message: `Only ${product.stock} pieces remaining for "${product.name}"`,
        currentStock: product.stock,
      };
    }

    return { available: true, currentStock: product.stock };
  },

  /**
   * Deduct stock upon verified payment
   */
  deductStock: (items) => {
    const deductions = [];

    for (const item of items) {
      const product = inMemoryProducts.find(
        (p) => p.id === (item.productId || item.product_id) || p.slug === item.slug
      );
      if (!product) continue;

      const qty = Number(item.quantity || 1);

      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const variant = product.variants.find(
          (v) => (!item.size || v.size === item.size) && (!item.color || v.color.toLowerCase() === item.color.toLowerCase())
        );

        if (variant) {
          variant.stock = Math.max(0, variant.stock - qty);
          // Recalculate total product stock
          product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          deductions.push({ productId: product.id, sku: variant.sku, newStock: variant.stock });
          continue;
        }
      }

      // Decrement product level
      product.stock = Math.max(0, product.stock - qty);
      deductions.push({ productId: product.id, newStock: product.stock });
    }

    return deductions;
  },

  /**
   * Restore stock on order cancellation or approved return
   */
  restoreStock: (items) => {
    for (const item of items) {
      const product = inMemoryProducts.find(
        (p) => p.id === (item.productId || item.product_id) || p.slug === item.slug
      );
      if (!product) continue;

      const qty = Number(item.quantity || 1);
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const variant = product.variants.find(
          (v) => (!item.size || v.size === item.size) && (!item.color || v.color.toLowerCase() === item.color.toLowerCase())
        );
        if (variant) {
          variant.stock += qty;
          product.stock += qty;
          continue;
        }
      }
      product.stock += qty;
    }
  },

  getProducts: () => inMemoryProducts,
  getProductBySlug: (slug) => inMemoryProducts.find((p) => p.slug === slug || p.id === slug),
};

module.exports = inventoryService;
