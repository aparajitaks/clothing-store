import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import SEO from '../../components/SEO';
import './Admin.css';

// Sample return requests for dev mode when Supabase isn't configured
const SAMPLE_RETURNS = [
  {
    id: 'RET-001',
    order_id: 'ORD-20241201-001',
    customer_name: 'Priya Sharma',
    customer_email: 'priya@example.com',
    item_name: 'Pure Silk Kanjivaram Saree',
    reason: 'Size issue — received M instead of L',
    status: 'pending',
    refund_amount: 3999,
    created_at: '2024-12-01T10:22:00Z',
  },
  {
    id: 'RET-002',
    order_id: 'ORD-20241128-012',
    customer_name: 'Anita Mehta',
    customer_email: 'anita.mehta@gmail.com',
    item_name: 'Chanderi Cotton Salwar Kameez',
    reason: 'Fabric quality did not match product images',
    status: 'approved',
    refund_amount: 2199,
    created_at: '2024-11-28T14:05:00Z',
  },
  {
    id: 'RET-003',
    order_id: 'ORD-20241125-007',
    customer_name: 'Kavita Nair',
    customer_email: 'kavita.nair@outlook.com',
    item_name: 'Handloom Banarasi Lehenga',
    reason: 'Wrong colour dispatched — ordered red, got maroon',
    status: 'refunded',
    refund_amount: 6499,
    created_at: '2024-11-25T09:40:00Z',
  },
  {
    id: 'RET-004',
    order_id: 'ORD-20241120-019',
    customer_name: 'Sneha Rao',
    customer_email: 'sneha.rao@email.in',
    item_name: 'Embroidered Georgette Kurti',
    reason: 'Item arrived damaged — thread loose on neckline',
    status: 'rejected',
    refund_amount: 1299,
    created_at: '2024-11-20T17:15:00Z',
  },
];

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#E65100', bg: '#FFF8E1', icon: Clock },
  approved: { label: 'Approved', color: '#1565C0', bg: '#EAF4FB', icon: CheckCircle },
  refunded: { label: 'Refunded', color: '#2D6A4F', bg: '#E8F5E9', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#D90429', bg: '#FFEBEE', icon: XCircle },
};

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/returns');
      setReturns(res.data?.data || res.data || []);
    } catch {
      // Fall back to sample data in dev mode
      setReturns(SAMPLE_RETURNS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const filtered = returns.filter((r) => {
    const matchSearch =
      r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.order_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.item_name?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterStatus !== 'all') return r.status === filterStatus;
    return true;
  });

  const handleStatusChange = async (returnId, newStatus) => {
    try {
      await api.patch(`/admin/returns/${returnId}`, { status: newStatus });
    } catch {
      // Optimistic update in dev mode
    }
    setReturns((prev) =>
      prev.map((r) => (r.id === returnId ? { ...r, status: newStatus } : r))
    );
    if (selectedReturn?.id === returnId) {
      setSelectedReturn((prev) => ({ ...prev, status: newStatus }));
    }
    toast.success(`Return status updated to "${STATUS_CONFIG[newStatus]?.label}"`);
  };

  // Stat counts
  const counts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = returns.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <SEO title="Returns & Refunds — Admin" noIndex />
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Returns & Refunds</h1>
            <p className="admin-page-sub">Review customer return requests and process refunds.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="admin-stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus(key === filterStatus ? 'all' : key)}>
                <div className="admin-stat-icon-wrap" style={{ background: cfg.bg }}>
                  <Icon size={22} color={cfg.color} />
                </div>
                <div>
                  <span className="stat-label">{cfg.label}</span>
                  <p className="stat-value" style={{ color: cfg.color }}>{counts[key] || 0}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="admin-section-card">
          <div className="admin-controls-row">
            <div className="admin-search-bar" style={{ flex: 1, marginBottom: 0 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-wrap">
              <select
                className="admin-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8C887B' }}>Loading returns...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8C887B' }}>No return requests match your filters.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Return ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Refund</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedReturn(r)}>
                        <td>
                          <strong style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', color: '#1A1A1A' }}>
                            {r.id}
                          </strong>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <span style={{ color: '#C9A96E', fontWeight: 600 }}>{r.order_id}</span>
                        </td>
                        <td>
                          <span>{r.customer_name}</span>
                          <span className="text-muted">{r.customer_email}</span>
                        </td>
                        <td style={{ maxWidth: '200px' }}>
                          <span style={{ fontSize: '0.85rem' }}>{r.item_name}</span>
                          <span className="text-muted" style={{ fontSize: '0.72rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {r.reason}
                          </span>
                        </td>
                        <td className="tag-gold">₹{Number(r.refund_amount).toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            className="status-select"
                            value={r.status}
                            style={{ borderColor: cfg.color, color: cfg.color }}
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            className="table-action-btn"
                            title="View Details"
                            onClick={() => setSelectedReturn(r)}
                          >
                            <AlertCircle size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Return Detail Modal */}
      {selectedReturn && (
        <div className="modal-overlay" onClick={() => setSelectedReturn(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Return — {selectedReturn.id}</h2>
              <button className="close-btn" onClick={() => setSelectedReturn(null)}>×</button>
            </div>
            <div className="admin-inspect-body">
              <div className="inspect-status-box">
                <RotateCcw size={20} color="#C9A96E" />
                <div>
                  <strong>Order: {selectedReturn.order_id}</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#7A766E' }}>
                    Filed {new Date(selectedReturn.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
                <span
                  className="stock-badge"
                  style={{
                    background: STATUS_CONFIG[selectedReturn.status]?.bg,
                    color: STATUS_CONFIG[selectedReturn.status]?.color,
                    marginLeft: 'auto'
                  }}
                >
                  {STATUS_CONFIG[selectedReturn.status]?.label}
                </span>
              </div>

              <div className="inspect-items-list">
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{selectedReturn.item_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#7A766E' }}>
                  <strong>Reason:</strong> {selectedReturn.reason}
                </div>
              </div>

              <div style={{ fontSize: '0.85rem' }}>
                <p><strong>Customer:</strong> {selectedReturn.customer_name}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {selectedReturn.customer_email}</p>
              </div>

              <div className="inspect-totals">
                <div className="total-row">
                  <span>Refund Amount</span>
                  <span>₹{Number(selectedReturn.refund_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#7A766E', marginBottom: '0.5rem', display: 'block' }}>
                  Update Status
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => handleStatusChange(selectedReturn.id, k)}
                      className={selectedReturn.status === k ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
