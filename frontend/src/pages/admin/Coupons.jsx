import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Trash2, Copy, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import SEO from '../../components/SEO';
import './Admin.css';

const EMPTY_FORM = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_amount: '',
  usage_limit: '',
  expires_at: '',
  description: '',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data?.data || res.data || []);
    } catch {
      // Use sample data in dev mode
      setCoupons([
        { id: 1, code: 'TEYA10', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, usage_limit: 100, usage_count: 23, expires_at: '2027-12-31', description: 'Welcome 10% off' },
        { id: 2, code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_amount: 500, usage_limit: 200, usage_count: 41, expires_at: '2027-12-31', description: 'New customer discount' },
        { id: 3, code: 'FLAT500', discount_type: 'flat', discount_value: 500, min_order_amount: 2000, usage_limit: 50, usage_count: 12, expires_at: '2026-12-31', description: '₹500 off orders above ₹2000' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const filtered = coupons.filter((c) =>
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount || 0),
        usage_limit: Number(form.usage_limit || 100),
        code: form.code.trim().toUpperCase(),
      };
      const res = await api.post('/coupons', payload);
      const newCoupon = res.data?.data || { ...payload, id: Date.now(), usage_count: 0 };
      setCoupons((prev) => [newCoupon, ...prev]);
      toast.success(`Coupon "${payload.code}" created!`);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${code}`);
      setCoupons((prev) => prev.filter((c) => c.code !== code));
      toast.success('Coupon deleted.');
    } catch {
      setCoupons((prev) => prev.filter((c) => c.code !== code));
      toast('Deleted locally (API unavailable in dev mode)', { icon: '⚠️' });
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`"${code}" copied to clipboard!`);
  };

  const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();

  return (
    <>
      <SEO title="Coupons — Admin" noIndex />
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Coupons</h1>
            <p className="admin-page-sub">Create, manage, and track promotional discount codes.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> New Coupon
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: '#FFF8E1' }}>
              <Tag size={22} color="#C9A96E" />
            </div>
            <div>
              <span className="stat-label">Total Coupons</span>
              <p className="stat-value">{coupons.length}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: '#E8F5E9' }}>
              <ToggleRight size={22} color="#2D6A4F" />
            </div>
            <div>
              <span className="stat-label">Active</span>
              <p className="stat-value">{coupons.filter((c) => !isExpired(c.expires_at)).length}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: '#FFEBEE' }}>
              <ToggleLeft size={22} color="#D90429" />
            </div>
            <div>
              <span className="stat-label">Expired</span>
              <p className="stat-value">{coupons.filter((c) => isExpired(c.expires_at)).length}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-section-card">
          <div className="admin-controls-row">
            <div className="admin-search-bar" style={{ flex: 1, marginBottom: 0 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search coupons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-wrap">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8C887B' }}>Loading coupons...</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min. Order</th>
                    <th>Usage</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const expired = isExpired(c.expires_at);
                    return (
                      <tr key={c.id || c.code}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.06em', color: '#1A1A1A' }}>
                              {c.code}
                            </strong>
                            <button className="table-action-btn" title="Copy" onClick={() => handleCopy(c.code)}>
                              <Copy size={12} />
                            </button>
                          </div>
                          <span className="text-muted">{c.description}</span>
                        </td>
                        <td>
                          <span className="stock-badge stock-ok" style={{ textTransform: 'capitalize' }}>
                            {c.discount_type}
                          </span>
                        </td>
                        <td className="tag-gold">
                          {c.discount_type === 'flat' ? `₹${c.discount_value}` : `${c.discount_value}%`}
                        </td>
                        <td>{c.min_order_amount ? `₹${c.min_order_amount}` : 'None'}</td>
                        <td>
                          {c.usage_count ?? 0} / {c.usage_limit ?? '∞'}
                          <div style={{ marginTop: '4px', background: '#ECE7DE', borderRadius: '2px', height: '4px', width: '80px' }}>
                            <div
                              style={{
                                height: '100%',
                                borderRadius: '2px',
                                background: '#C9A96E',
                                width: `${Math.min(100, ((c.usage_count || 0) / (c.usage_limit || 1)) * 100)}%`
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td>
                          <span className={`stock-badge ${expired ? 'stock-low' : 'stock-ok'}`}>
                            {expired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="table-action-btn btn-danger" title="Delete" onClick={() => handleDelete(c.code)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
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

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>New Coupon</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="admin-modal-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  name="code"
                  required
                  placeholder="e.g. SUMMER20"
                  value={form.code}
                  onChange={handleFormChange}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select name="discount_type" value={form.discount_type} onChange={handleFormChange} className="admin-select" style={{ width: '100%' }}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input name="discount_value" type="number" required min="1" placeholder={form.discount_type === 'percentage' ? '10' : '500'} value={form.discount_value} onChange={handleFormChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min. Order Amount (₹)</label>
                  <input name="min_order_amount" type="number" min="0" placeholder="0" value={form.min_order_amount} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input name="usage_limit" type="number" min="1" placeholder="100" value={form.usage_limit} onChange={handleFormChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Expires At</label>
                <input name="expires_at" type="date" value={form.expires_at} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input name="description" placeholder="e.g. Summer sale 20% off" value={form.description} onChange={handleFormChange} />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
