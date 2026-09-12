/**
 * Logistics & Shipping Service (Shiprocket-ready abstraction)
 */

const { STORE_SETTINGS } = require('../data/seedData');

const METRO_PIN_PREFIXES = ['11', '12', '40', '41', '56', '50', '60', '70']; // Delhi/NCR, Mumbai/Pune, Bangalore, Hyderabad, Chennai, Kolkata

const shippingService = {
  /**
   * Check deliverability and estimated transit time for an Indian postal code
   */
  checkPincode: (pincode) => {
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return {
        deliverable: false,
        message: 'Please enter a valid 6-digit Indian PIN code',
      };
    }

    const cleanPin = pincode.trim();
    const prefix = cleanPin.substring(0, 2);
    const isMetro = METRO_PIN_PREFIXES.includes(prefix);

    const minDays = isMetro ? 2 : 4;
    const maxDays = isMetro ? 3 : 6;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + maxDays);

    return {
      deliverable: true,
      pincode: cleanPin,
      city: isMetro ? 'Metro Express Zone' : 'Standard Delivery Zone',
      estimatedDays: `${minDays} - ${maxDays} Business Days`,
      estimatedDate: deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      codAvailable: STORE_SETTINGS.enable_cod,
      courierPartner: isMetro ? 'BlueDart Air' : 'Delhivery Surface',
      message: `Delivery available in ${minDays}–${maxDays} business days via Express Courier.`,
    };
  },

  /**
   * Calculate shipping fee based on cart subtotal
   */
  calculateShippingFee: (subtotal, shippingMethod = 'standard') => {
    if (subtotal >= STORE_SETTINGS.free_shipping_threshold) {
      return { fee: 0, isFree: true, threshold: STORE_SETTINGS.free_shipping_threshold };
    }
    return {
      fee: STORE_SETTINGS.default_shipping_fee,
      isFree: false,
      amountNeededForFree: Math.max(0, STORE_SETTINGS.free_shipping_threshold - subtotal),
      threshold: STORE_SETTINGS.free_shipping_threshold,
    };
  },

  /**
   * Generate shipment tracking details
   */
  createShipment: (orderId, shippingAddress) => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `TK-EXP-${randomSuffix}`;
    const courier = 'BlueDart Air Express';

    return {
      trackingNumber,
      courier,
      trackingUrl: `https://www.bluedart.com/tracking?trackNumber=${trackingNumber}`,
      estimatedDeliveryDays: 3,
      status: 'manifest_created',
      createdAt: new Date().toISOString(),
    };
  },
};

module.exports = shippingService;
