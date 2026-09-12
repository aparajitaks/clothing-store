/**
 * Indian GST Tax Service
 * Configurable GST calculation according to Indian tax regulations
 */

const taxService = {
  /**
   * Calculate GST breakdown for an order.
   * In fashion/textiles:
   * - Garments <= ₹1,000 are taxed at 5% GST
   * - Garments > ₹1,000 are taxed at 12% GST
   * All MRP prices on TK / TiyaCollections are GST-inclusive by default.
   */
  calculateTax: (items, isInclusive = true, state = 'Karnataka') => {
    let totalTax = 0;
    let taxableAmount = 0;

    const itemsTax = items.map((item) => {
      const price = Number(item.unit_price || item.price || 0);
      const qty = Number(item.quantity || 1);
      const lineTotal = price * qty;
      const gstRate = price <= 1000 ? 5 : 12;

      let itemTax = 0;
      let netPrice = 0;

      if (isInclusive) {
        // Line total includes GST: tax = lineTotal - (lineTotal / (1 + rate/100))
        netPrice = lineTotal / (1 + gstRate / 100);
        itemTax = lineTotal - netPrice;
      } else {
        netPrice = lineTotal;
        itemTax = (lineTotal * gstRate) / 100;
      }

      totalTax += itemTax;
      taxableAmount += netPrice;

      return {
        product_name: item.product_name || item.name,
        lineTotal,
        gstRate,
        taxAmount: Math.round(itemTax * 100) / 100,
      };
    });

    totalTax = Math.round(totalTax * 100) / 100;
    taxableAmount = Math.round(taxableAmount * 100) / 100;

    // Split CGST + SGST for intra-state (Karnataka) or IGST for inter-state
    const isIntraState = state.toLowerCase().includes('karnataka');

    return {
      isInclusive,
      taxableAmount,
      totalTax,
      cgst: isIntraState ? Math.round((totalTax / 2) * 100) / 100 : 0,
      sgst: isIntraState ? Math.round((totalTax / 2) * 100) / 100 : 0,
      igst: !isIntraState ? totalTax : 0,
      itemsTax,
    };
  },
};

module.exports = taxService;
