import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ChevronRight, ShoppingBag } from 'lucide-react';
import api from '../lib/axios';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import './Orders.css';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserOrders() {
      if (!user) return;
      try {
        const res = await api.get('/orders');
        if (res.data?.data) {
          setOrders(res.data.data);
          return;
        }

        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) setOrders(data);
      } catch (e) {
        console.warn('Orders load fallback:', e);
      } finally {
        setLoading(false);
      }
    }
    loadUserOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="orders-loading container">
        <p>Retrieving your order archives...</p>
      </div>
    );
  }

  return (
    <div className="orders-page container">
      <div className="orders-header">
        <h1 className="orders-title">Your Order History</h1>
        <p className="orders-sub">Manage past purchases, track active shipments, and view bespoke invoices.</p>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <Package size={52} strokeWidth={1} />
          <h3>No Orders Placed Yet</h3>
          <p>Your wardrobe history will appear here once you place your first order.</p>
          <Link to="/shop" className="btn-primary">
            Explore The Collection
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card__header">
                <div className="order-card__meta">
                  <div>
                    <span className="order-label">Order #</span>
                    <span className="order-id font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="order-label">Date Placed</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="order-label">Total Amount</span>
                    <span className="order-total">₹{Number(order.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="order-card__status">
                  <span className={`status-pill status-${order.status}`}>
                    {order.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  <Link to={`/order/confirm/${order.id}`} className="view-order-link">
                    View Details <ChevronRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Items in order */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="order-card__items">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="order-item-chip">
                      <img
                        src={item.product_image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150'}
                        alt={item.product_name}
                      />
                      <div className="chip-details">
                        <span className="chip-name">{item.product_name}</span>
                        <span className="chip-sub">Qty: {item.quantity} · ₹{Number(item.total).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
