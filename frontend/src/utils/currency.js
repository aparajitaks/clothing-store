/**
 * Centralized currency formatter for TK TiyaCollections
 * Primary: INR (₹) with Indian number formatting
 * Architecture supports future multi-currency expansion
 */

const CURRENCY_CONFIG = {
  INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
  EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
};

/**
 * Format a number as currency
 * @param {number} amount
 * @param {string} currency - 'INR' | 'USD' | 'GBP' | 'EUR'
 * @param {boolean} compact - Use compact notation (e.g., ₹4.9K)
 */
export const formatCurrency = (amount, currency = 'INR', compact = false) => {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
  const numAmount = Number(amount);

  if (isNaN(numAmount)) return `${config.symbol}0`;

  if (compact && numAmount >= 100000) {
    return `${config.symbol}${(numAmount / 100000).toFixed(1)}L`;
  }

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: numAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Calculate discount percentage between original and sale price
 */
export const calcDiscountPercent = (originalPrice, salePrice) => {
  const orig = Number(originalPrice);
  const sale = Number(salePrice);
  if (!orig || !sale || sale >= orig) return 0;
  return Math.round(((orig - sale) / orig) * 100);
};

export default formatCurrency;
