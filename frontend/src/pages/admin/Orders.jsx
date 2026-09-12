import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { supabase } from '../../lib/supabase';
import './Admin.css';

const STATUS_OPTIONS = [
  'all',
  'pending',
  'payment_initiated',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' ? '/admin/orders' : `/admin/orders?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data?.data?.orders) {
        setOrders(res.data.data.orders);
        return;
      }

      let query = supabase
        .from('orders')
        .select('*, order_items(*), profiles(full_name, phone)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;
      if (data) setOrders(data);
    } catch (err) {
      console.warn('Fallback admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const idMatch = o.id.toLowerCase().includes(q);
    const nameMatch = (o.profiles?.full_name || o.shipping_address?.name || '').toLowerCase().includes(q);
    return idMatch || nameMatch;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Client Fulfillment & Orders</h1>
          <p className="admin-page-sub">Track payments, issue dispatch manifests, and update fulfillment milestones.</p>
        </div>
      </div>

      <div className="admin-section-card">
        {/* Controls */}
        <div className="admin-controls-row">
          <div className="admin-search-bar" style={{ marginBottom: 0, flex: 1 }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by client or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-filter-wrap">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Status: {st.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Client</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Fulfillment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => (
                <tr key={ord.id}>
                  <td className="font-mono">{ord.id.slice(0, 8).toUpperCase()}</td>
                  <td>
                    <strong>{ord.profiles?.full_name || ord.shipping_address?.name || 'Guest'}</strong>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {ord.shipping_address?.phone || ord.shipping_address?.city || ''}
                    </div>
                  </td>
                  <td>{new Date(ord.created_at).toLocaleDateString('en-IN')}</td>
                  <td>{ord.order_items?.length || 0} items</td>
                  <td>₹{Number(ord.total).toLocaleString('en-IN')}</td>
                  <td>
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className={`status-select status-${ord.status}`}
                    >
                      <option value="payment_initiated">Payment Initiated</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="table-action-btn"
                      title="Inspect Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspect Drawer / Modal */}
      {selectedOrder && (
        <div className="auth-overlay">
          <div className="auth-backdrop" onClick={() => setSelectedOrder(null)} />
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h2>Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="close-btn">×</button>
            </div>

            <div className="admin-inspect-body">
              <div className="inspect-status-box">
                <span>Current Status:</span>
                <span className={`status-pill status-${selectedOrder.status}`}>
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>

              <h4>Shipping Destination</h4>
              <p>
                <strong>{selectedOrder.shipping_address?.name}</strong> ({selectedOrder.shipping_address?.phone})<br />
                {selectedOrder.shipping_address?.line1}, {selectedOrder.shipping_address?.line2}<br />
                {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} — {selectedOrder.shipping_address?.pincode}
              </p>

              <h4>Ordered Items</h4>
              <div className="inspect-items-list">
                {selectedOrder.order_items?.map((it, idx) => (
                  <div key={idx} className="inspect-item-row">
                    <img
                      src={it.product_image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                      alt={it.product_name}
                    />
                    <div>
                      <strong>{it.product_name}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Qty: {it.quantity} {it.size ? `| Size: ${it.size}` : ''}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
                      ₹{Number(it.total).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="inspect-totals">
                <div><span>Subtotal:</span> <span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span></div>
                <div><span>Shipping:</span> <span>₹{Number(selectedOrder.shipping_fee).toLocaleString('en-IN')}</span></div>
                <div className="total-row"><span>Total:</span> <span>₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
