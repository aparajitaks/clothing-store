const crypto = require('crypto');
const supabase = require('../config/db');

/**
 * POST /api/webhooks/razorpay
 * Razorpay sends events here. This is the authoritative payment confirmation.
 * Raw body is required for HMAC verification (set before express.json middleware).
 */
const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature     = req.headers['x-razorpay-signature'];

    if (!webhookSecret || !signature || webhookSecret.includes('xxxx')) {
      console.warn('Webhook: missing secret or signature header');
      return res.status(400).json({ success: false, message: 'Webhook not configured' });
    }

    if (!supabase) {
      console.warn('Webhook: Supabase client unavailable in fallback mode, skipping processing');
      return res.status(200).json({ success: true, message: 'Accepted (fallback mode)' });
    }

    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSig !== signature) {
      console.warn('Webhook: invalid signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(req.rawBody);
    const eventId   = event.id;
    const eventType = event.event;

    try {
      const { data: existing } = await supabase
        .from('webhook_events')
        .select('id, processed')
        .eq('event_id', eventId)
        .single();

      if (existing?.processed) {
        console.log(`Webhook: event ${eventId} already processed, skipping`);
        return res.status(200).json({ success: true });
      }
    } catch (e) { /* not found — continue */ }

    await supabase
      .from('webhook_events')
      .upsert({
        event_id:   eventId,
        event_type: eventType,
        payload:    event,
        processed:  false,
      }, { onConflict: 'event_id' });

    if (eventType === 'payment.captured') {
      await handlePaymentCaptured(event);
    } else if (eventType === 'payment.failed') {
      await handlePaymentFailed(event);
    } else if (eventType === 'refund.created') {
      await handleRefund(event);
    }

    await supabase
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', eventId);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ success: false, message: 'Internal error' });
  }
};

async function handlePaymentCaptured(event) {
  if (!supabase) return;
  const payment = event.payload?.payment?.entity;
  if (!payment) return;

  const razorpayOrderId  = payment.order_id;
  const razorpayPaymentId = payment.id;

  let order;
  try {
    const { data } = await supabase
      .from('orders')
      .select('id, status, order_items(*)')
      .eq('razorpay_order_id', razorpayOrderId)
      .single();
    order = data;
  } catch (e) { /* not found */ }

  if (!order) {
    console.warn(`Webhook: order not found for razorpay_order_id=${razorpayOrderId}`);
    return;
  }

  if (order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
    console.log(`Webhook: order ${order.id} already in status ${order.status}, skipping`);
    return;
  }

  await supabase
    .from('orders')
    .update({
      status:               'paid',
      razorpay_payment_id:  razorpayPaymentId,
      webhook_received_at:  new Date().toISOString(),
    })
    .eq('id', order.id);

  // Deduct stock atomically using a database RPC (prevents race conditions)
  // Falls back to simple update if RPC is not available
  for (const item of order.order_items || []) {
    if (item.product_id) {
      try {
        // Use rpc for atomic decrement; if the function doesn't exist, use manual approach
        const { error: rpcError } = await supabase.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });

        if (rpcError) {
          // Fallback: read current stock and update (non-atomic but better than nothing)
          const { data: prod } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (prod && prod.stock > 0) {
            await supabase
              .from('products')
              .update({ stock: Math.max(0, prod.stock - item.quantity) })
              .eq('id', item.product_id);
          }
        }
      } catch (e) {
        console.warn(`Stock decrement failed for product ${item.product_id}:`, e.message);
      }
    }
  }

  console.log(`✅ Order ${order.id} marked as PAID via webhook`);
}

async function handlePaymentFailed(event) {
  if (!supabase) return;
  const payment = event.payload?.payment?.entity;
  if (!payment) return;

  let order;
  try {
    const { data } = await supabase
      .from('orders')
      .select('id, status')
      .eq('razorpay_order_id', payment.order_id)
      .single();
    order = data;
  } catch (e) { /* not found */ }

  if (!order || order.status === 'paid') return;

  await supabase
    .from('orders')
    .update({ status: 'payment_failed', webhook_received_at: new Date().toISOString() })
    .eq('id', order.id);

  console.log(`❌ Order ${order.id} marked as PAYMENT_FAILED via webhook`);
}

async function handleRefund(event) {
  if (!supabase) return;
  const refund = event.payload?.refund?.entity;
  if (!refund) return;

  let order;
  try {
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_payment_id', refund.payment_id)
      .single();
    order = data;
  } catch (e) { /* not found */ }

  if (!order) return;

  await supabase
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', order.id);

  console.log(`💸 Order ${order.id} marked as REFUNDED via webhook`);
}

module.exports = { razorpayWebhook };
