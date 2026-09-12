import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, Clock, ShoppingBag } from 'lucide-react';
import api from '../lib/axios';
import { supabase } from '../lib/supabase';
import './OrderConfirm.css';

export default function OrderConfirmPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data?.data) {
          setOrder(res.data.data);
          return;
        }

        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .single();

        if (data) setOrder(data);
      } catch (err) {
        console.warn('Could not load order details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="confirm-loading container">
        <p>Retrieving order confirmation...</p>
      </div>
    );
  }

  const isPaid = order?.status === 'paid' || order?.payment_status === 'captured';

  return (
    <div className="order-confirm-page container">
      <div className="confirm-card">
        <div className="confirm-icon-wrap">
          <CheckCircle2 size={48} className="confirm-check" />
        </div>

        <span className="confirm-tag">Order Confirmed</span>
        <h1 className="confirm-title">Thank you for your purchase</h1>
        <p className="confirm-sub">
          Your order has been received and our atelier has begun carefully hand-inspecting and packaging your garments.
        </p>

        <div className="confirm-meta-grid">
          <div className="meta-box">
            <span className="meta-label">Order Reference</span>
            <span className="meta-value font-mono">{id?.slice(0, 8).toUpperCase() || 'ORD-9821'}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Payment Status</span>
            <span className={`status-tag ${isPaid ? 'status-paid' : 'status-pending'}`}>
              {isPaid ? 'Payment Received' : 'Processing'}
            </span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Estimated Delivery</span>
            <span className="meta-value">3–5 Business Days</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Total Amount</span>
            <span className="meta-value">₹{Number(order?.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Shipping address details */}
        {order?.shipping_address && (
          <div className="confirm-address-box">
            <div className="box-header">
              <Truck size={18} />
              <h4>Delivery Destination</h4>
            </div>
            <p><strong>{order.shipping_address.name}</strong> ({order.shipping_address.phone})</p>
            <p>{order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''}</p>
            <p>{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
          </div>
        )}

        {/* Items breakdown */}
        {order?.order_items && order.order_items.length > 0 && (
          <div className="confirm-items-box">
            <h4>Garments in this Shipment</h4>
            <div className="confirm-items-list">
              {order.order_items.map((item, idx) => (
                <div key={idx} className="confirm-item-row">
                  <img
                    src={item.product_image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200'}
                    alt={item.product_name}
                  />
                  <div className="confirm-item-info">
                    <h5>{item.product_name}</h5>
                    <span>Qty: {item.quantity} {item.size ? `· Size ${item.size}` : ''}</span>
                  </div>
                  <span className="confirm-item-price">
                    ₹{Number(item.total).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="confirm-actions">
          <Link to="/orders" className="btn-primary">
            View All Orders <ArrowRight size={16} />
          </Link>
          <Link to="/shop" className="btn-outline">
            Continue Exploring
          </Link>
        </div>
      </div>
    </div>
  );
}
