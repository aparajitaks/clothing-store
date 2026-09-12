/**
 * Transactional Email Notification Service
 * Luxury branded email templates for TK / TiyaCollections
 * Integrates with Resend API when RESEND_API_KEY is configured,
 * otherwise logs cleanly in development.
 */

const { STORE_SETTINGS } = require('../data/seedData');

const emailHeaderHtml = `
  <div style="background-color: #F9F5F0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5DDD4; border-radius: 4px; overflow: hidden; text-align: left;">
      <div style="background-color: #111111; padding: 24px; text-align: center; border-bottom: 2px solid #C9A96E;">
        <span style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 2px; color: #FFFFFF; font-weight: 400;">TK</span>
        <span style="font-size: 13px; letter-spacing: 4px; color: #C9A96E; text-transform: uppercase; display: block; margin-top: 4px;">TiyaCollections</span>
      </div>
      <div style="padding: 32px 28px; color: #1A1A1A; line-height: 1.6;">
`;

const emailFooterHtml = `
      </div>
      <div style="background-color: #F2EDE6; padding: 20px 28px; border-top: 1px solid #E5DDD4; font-size: 12px; color: #7A6F67; text-align: center;">
        <p style="margin-bottom: 6px;">Need assistance? Reach our concierge at <a href="mailto:${STORE_SETTINGS.support_email}" style="color: #1A1A1A; font-weight: 600;">${STORE_SETTINGS.support_email}</a> or ${STORE_SETTINGS.support_phone}</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} ${STORE_SETTINGS.brand_description}. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

const emailService = {
  /**
   * Dispatch email via Resend or log cleanly in development mode
   */
  send: async ({ to, subject, html }) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey && !resendApiKey.includes('xxxx')) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `TK TiyaCollections <${process.env.EMAIL_FROM || 'concierge@tiyacollections.com'}>`,
            to: [to],
            subject,
            html,
          }),
        });
        const result = await response.json();
        return { success: true, messageId: result.id };
      } catch (err) {
        console.warn('⚠️ Resend email dispatch failed:', err.message);
      }
    }

    // Dev / Demo mode fallback
    console.log(`\n📧 [EMAIL SERVICE - DEV MODE]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Status: Simulated Delivery Success\n`);
    return { success: true, simulated: true };
  },

  /**
   * Order Confirmation Email
   */
  sendOrderConfirmation: async (order, customerEmail) => {
    const itemsHtml = (order.order_items || order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #E5DDD4;">
            <strong style="color: #1A1A1A;">${item.product_name || item.name}</strong><br/>
            <span style="font-size: 12px; color: #7A6F67;">Size: ${item.size || 'Standard'} | Color: ${item.color || 'Default'}</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #E5DDD4; text-align: center; color: #1A1A1A;">${item.quantity}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #E5DDD4; text-align: right; color: #1A1A1A; font-weight: 500;">₹${Number(item.total || item.unit_price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      ${emailHeaderHtml}
      <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: #111111; margin-top: 0;">Order Confirmed</h2>
      <p>Thank you for acquiring traditional craftsmanship from TK TiyaCollections. Your order has been placed successfully and is being prepared with artisanal care.</p>
      
      <div style="background-color: #F9F5F0; padding: 16px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #7A6F67;">Order Reference: <strong style="color: #1A1A1A;">#${(order.id || '').substring(0, 8).toUpperCase()}</strong></p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #7A6F67;">Payment Method: <strong style="color: #1A1A1A;">${(order.payment_method || 'Online Payment').toUpperCase()}</strong></p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr style="text-align: left; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #7A6F67; border-bottom: 1px solid #1A1A1A;">
            <th style="padding-bottom: 8px;">Garment</th>
            <th style="padding-bottom: 8px; text-align: center;">Qty</th>
            <th style="padding-bottom: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 16px; font-size: 14px;">
        <p style="margin: 4px 0; color: #7A6F67;">Subtotal: <strong style="color: #1A1A1A;">₹${Number(order.subtotal || 0).toLocaleString('en-IN')}</strong></p>
        ${Number(order.discount || 0) > 0 ? `<p style="margin: 4px 0; color: #27AE60;">Privilege Discount: <strong>-₹${Number(order.discount).toLocaleString('en-IN')}</strong></p>` : ''}
        <p style="margin: 4px 0; color: #7A6F67;">Shipping: <strong style="color: #1A1A1A;">${Number(order.shipping_fee || 0) === 0 ? 'Complimentary' : '₹' + order.shipping_fee}</strong></p>
        <p style="margin: 12px 0 0; font-size: 18px; font-family: Georgia, serif; color: #111111;">Total Amount: <strong style="color: #C9A96E;">₹${Number(order.total || 0).toLocaleString('en-IN')}</strong></p>
      </div>
      ${emailFooterHtml}
    `;

    return emailService.send({
      to: customerEmail,
      subject: `Order Confirmation #${(order.id || '').substring(0, 8).toUpperCase()} — TK TiyaCollections`,
      html,
    });
  },

  /**
   * Order Shipped Email
   */
  sendOrderShipped: async (order, tracking, customerEmail) => {
    const html = `
      ${emailHeaderHtml}
      <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: #111111; margin-top: 0;">Your Order is En Route</h2>
      <p>Your order #${(order.id || '').substring(0, 8).toUpperCase()} has been carefully inspected, packed in bespoke muslin wraps, and dispatched with our courier partner.</p>
      
      <div style="background-color: #F9F5F0; padding: 20px; border-radius: 4px; margin: 24px 0; border-left: 3px solid #C9A96E;">
        <p style="margin: 0; font-size: 14px;">Courier: <strong>${tracking.courier || 'BlueDart Air'}</strong></p>
        <p style="margin: 6px 0 0; font-size: 14px;">Airway Bill / Tracking: <strong>${tracking.trackingNumber}</strong></p>
        <div style="margin-top: 16px;">
          <a href="${tracking.trackingUrl}" style="background-color: #111111; color: #FFFFFF; padding: 10px 20px; font-size: 13px; text-decoration: none; border-radius: 2px; display: inline-block;">Track Shipment</a>
        </div>
      </div>
      ${emailFooterHtml}
    `;

    return emailService.send({
      to: customerEmail,
      subject: `Your Handcrafted Order #${(order.id || '').substring(0, 8).toUpperCase()} has Shipped — TK TiyaCollections`,
      html,
    });
  },
};

module.exports = emailService;
