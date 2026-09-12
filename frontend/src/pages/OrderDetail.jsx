import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import api from '../lib/axios';
import './OrderDetail.css';

const STATUS_STEPS = [
  { key: 'pending',          label: 'Order Placed',        icon: Package },
  { key: 'paid',             label: 'Payment Confirmed',   icon: CheckCircle },
  { key: 'processing',       label: 'Processing',          icon: Clock },
  { key: 'packed',           label: 'Packed',              icon: Package },
  { key: 'shipped',          label: 'Shipped',             icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery',    icon: Truck },
  { key: 'delivered',        label: 'Delivered',           icon: CheckCircle },
];

const CANCELLED_STATUSES = ['cancelled', 'return_requested', 'returned', 'refunded'];

function getStatusIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : (status === 'payment_initiated' ? 0 : -1);
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState('return');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data?.data || null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      await api.post(`/orders/${id}/return-request`, {
        type: returnType,
        reason: returnReason,
        selectedItems: order?.order_items || [],
      });
      setReturnSubmitted(true);
      setReturnModal(false);
      setOrder((prev) => ({ ...prev, status: 'return_requested' }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) return (
    <div className="order-detail-loading container">
      <p>Loading order details...</p>
    </div>
  );

  if (!order) return (
    <div className="order-detail-empty container">
      <h2>Order Not Found</h2>
      <Link to="/orders" className="btn-primary">My Orders</Link>
    </div>
  );

  const statusIdx = getStatusIndex(order.status);
  const isCancelled = CANCELLED_STATUSES.includes(order.status);
  const canRequestReturn = order.status === 'delivered' && !returnSubmitted;

  return (
    <div className="order-detail-page">
      <div className="order-detail-hero container">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <nav className="order-detail-breadcrumb">
            <Link to="/orders">My Orders</Link>
            <span>/</span>
            <span>#{(order.id || '').substring(0, 12).toUpperCase()}</span>
          </nav>
          <div className="order-detail-header">
            <div>
              <h1 className="order-detail-id">Order #{(order.id || '').substring(0, 12).toUpperCase()}</h1>
              <p className="order-detail-date">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className={`order-status-badge status-${order.status}`}>
              {order.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="container order-detail-body">
        {/* Status Timeline */}
        {!isCancelled && (
          <div className="order-timeline">
            <h2 className="order-section-title">Order Progress</h2>
            <div className="timeline-steps">
              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = statusIdx >= i;
                const current = statusIdx === i;
                return (
                  <div key={step.key} className={`timeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                    <div className="timeline-step__circle">
                      <Icon size={16} />
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className={`timeline-step__line ${statusIdx > i ? 'done' : ''}`} />}
                    <p className="timeline-step__label">{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="order-cancelled-notice">
            <AlertCircle size={20} />
            <span>This order has been {order.status.replace(/_/g, ' ')}.</span>
          </div>
        )}

        {/* Tracking */}
        {order.tracking && (
          <div className="order-tracking-card">
            <h2 className="order-section-title">Tracking Details</h2>
            <p><strong>Courier:</strong> {order.tracking.courier}</p>
            <p><strong>Tracking Number:</strong> {order.tracking.trackingNumber}</p>
            {order.tracking.trackingUrl && (
              <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn-outline order-tracking__link">
                Track Shipment →
              </a>
            )}
          </div>
        )}

        <div className="order-detail-grid">
          {/* Items */}
          <div className="order-items-section">
            <h2 className="order-section-title">Items Ordered</h2>
            <ul className="order-items-list">
              {(order.order_items || order.items || []).map((item) => (
                <li key={item.id || item.product_id} className="order-item">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="order-item__image" />
                  )}
                  <div className="order-item__info">
                    <p className="order-item__name">{item.product_name || item.name}</p>
                    <p className="order-item__meta">
                      {item.size && <>Size: {item.size}</>}
                      {item.color && <> · Color: {item.color}</>}
                      {' · Qty: '}{item.quantity}
                    </p>
                  </div>
                  <p className="order-item__price">₹{Number(item.total || (item.unit_price * item.quantity)).toLocaleString('en-IN')}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary & Address */}
          <div className="order-sidebar">
            <div className="order-summary-card">
              <h2 className="order-section-title">Order Summary</h2>
              <div className="order-summary-row">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(order.discount || 0) > 0 && (
                <div className="order-summary-row discount">
                  <span>Discount</span>
                  <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="order-summary-row">
                <span>Shipping</span>
                <span>{Number(order.shipping_fee || 0) === 0 ? 'Complimentary' : `₹${Number(order.shipping_fee).toLocaleString('en-IN')}`}</span>
              </div>
              <div className="order-summary-row total">
                <span>Total</span>
                <span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="order-summary-row">
                <span>Payment</span>
                <span style={{ textTransform: 'uppercase', fontSize: '12px' }}>{order.payment_method || 'Online'}</span>
              </div>
            </div>

            {order.shipping_address && (
              <div className="order-address-card">
                <h2 className="order-section-title">Shipping Address</h2>
                <p>{order.shipping_address.name}</p>
                <p>{order.shipping_address.line1}</p>
                {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
                <p>{order.shipping_address.country || 'India'}</p>
                <p style={{ marginTop: '8px', color: 'var(--color-text-muted)' }}>📞 {order.shipping_address.phone}</p>
              </div>
            )}

            {canRequestReturn && (
              <button className="btn-outline order-return-btn" onClick={() => setReturnModal(true)}>
                <RotateCcw size={15} /> Request Return / Exchange
              </button>
            )}

            {returnSubmitted && (
              <div className="order-return-success">
                <CheckCircle size={16} />
                Return request submitted. Our concierge will contact you within 24 hours.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {returnModal && (
        <div className="return-modal-overlay" onClick={() => setReturnModal(false)}>
          <div className="return-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="return-modal__title">Return / Exchange Request</h3>
            <form onSubmit={handleReturnSubmit}>
              <div className="return-modal__field">
                <label>Request Type</label>
                <select value={returnType} onChange={(e) => setReturnType(e.target.value)}>
                  <option value="return">Return & Refund</option>
                  <option value="exchange">Exchange for a Different Size/Color</option>
                </select>
              </div>
              <div className="return-modal__field">
                <label>Reason</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please describe the reason for your return or exchange request..."
                  rows={4}
                  required
                />
              </div>
              <div className="return-modal__actions">
                <button type="button" className="btn-outline" onClick={() => setReturnModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submittingReturn}>
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
