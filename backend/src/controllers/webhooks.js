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

    if (!webhookSecret || !signature) {
      console.warn('Webhook: missing secret or signature header');
      return res.status(400).json({ success: false });
    }

    // Verify HMAC
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

    // Idempotency — skip already-processed events
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id, processed')
      .eq('event_id', eventId)
      .single();

    if (existing?.processed) {
      console.log(`Webhook: event ${eventId} already processed, skipping`);
      return res.status(200).json({ success: true });
    }

    // Store the event
    await supabase
      .from('webhook_events')
      .upsert({
        event_id:   eventId,
        event_type: eventType,
        payload:    event,
        processed:  false,
      }, { onConflict: 'event_id' });

    // Handle event types
    if (eventType === 'payment.captured') {
      await handlePaymentCaptured(event);
    } else if (eventType === 'payment.failed') {
      await handlePaymentFailed(event);
    } else if (eventType === 'refund.created') {
      await handleRefund(event);
    }

    // Mark event as processed
    await supabase
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', eventId);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    // Return 200 to prevent Razorpay retrying on our internal errors
    return res.status(200).json({ success: false, message: 'Internal error' });
  }
};

async function handlePaymentCaptured(event) {
  const payment = event.payload?.payment?.entity;
  if (!payment) return;

  const razorpayOrderId  = payment.order_id;
  const razorpayPaymentId = payment.id;

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, order_items(*)')
    .eq('razorpay_order_id', razorpayOrderId)
    .single();

  if (!order) {
    console.warn(`Webhook: order not found for razorpay_order_id=${razorpayOrderId}`);
    return;
  }

  // Idempotent — only update if not already paid
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

  // Decrement stock for each item
  for (const item of order.order_items || []) {
    if (item.product_id) {
      await supabase
        .from('products')
        .update({ stock: supabase.raw(`stock - ${item.quantity}`) })
        .eq('id', item.product_id)
        .gt('stock', 0);
    }
  }

  console.log(`✅ Order ${order.id} marked as PAID via webhook`);
}

async function handlePaymentFailed(event) {
  const payment = event.payload?.payment?.entity;
  if (!payment) return;

  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('razorpay_order_id', payment.order_id)
    .single();

  if (!order || order.status === 'paid') return;

  await supabase
    .from('orders')
    .update({ status: 'payment_failed', webhook_received_at: new Date().toISOString() })
    .eq('id', order.id);

  console.log(`❌ Order ${order.id} marked as PAYMENT_FAILED via webhook`);
}

async function handleRefund(event) {
  const refund = event.payload?.refund?.entity;
  if (!refund) return;

  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_payment_id', refund.payment_id)
    .single();

  if (!order) return;

  await supabase
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', order.id);

  console.log(`💸 Order ${order.id} marked as REFUNDED via webhook`);
}

module.exports = { razorpayWebhook };
