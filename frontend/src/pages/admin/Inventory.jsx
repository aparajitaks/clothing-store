import { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, TrendingDown, Search, RefreshCw, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import SEO from '../../components/SEO';
import './Admin.css';

const LOW_STOCK_THRESHOLD = 5;

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // all | low | out
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products', { params: { limit: 100 } });
      setProducts(res.data?.data?.products || res.data?.products || []);
    } catch {
      toast.error('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterStock === 'low') return p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
    if (filterStock === 'out') return p.stock === 0;
    return true;
  });

  const handleSaveStock = async (product) => {
    const newStock = parseInt(editStock, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Enter a valid stock number');
      return;
    }
    try {
      await api.patch(`/admin/products/${product.id}`, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
      toast.success(`Stock updated to ${newStock} for "${product.name}"`);
    } catch {
      // Optimistic update even if API fails in dev mode
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
      toast('Stock updated locally (API unavailable in dev mode)', { icon: '⚠️' });
    }
    setEditingId(null);
  };

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <>
      <SEO title="Inventory Management — Admin" noIndex />
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Inventory</h1>
            <p className="admin-page-sub">Monitor stock levels and update quantities in real-time.</p>
          </div>
          <button className="btn-primary" onClick={fetchProducts} style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: '#EAF4FB' }}>
              <Package size={22} color="#1565C0" />
            </div>
            <div>
              <span className="stat-label">Total SKUs</span>
              <p className="stat-value">{products.length}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: '#FFF8E1' }}>
              <TrendingDown size={22} color="#E65100" />
            </div>
            <div>
              <span className="stat-label">Low Stock</span>
              <p className="stat-value" style={{ color: '#E65100' }}>{lowStockCount}</p>
              <span className="stat-hint">≤ {LOW_STOCK_THRESHOLD} units</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: '#FFEBEE' }}>
              <AlertTriangle size={22} color="#D90429" />
            </div>
            <div>
              <span className="stat-label">Out of Stock</span>
              <p className="stat-value" style={{ color: '#D90429' }}>{outOfStockCount}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="admin-section-card">
          <div className="admin-controls-row">
            <div className="admin-search-bar" style={{ flex: 1, marginBottom: 0 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="admin-filter-wrap">
              <select
                className="admin-select"
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8C887B' }}>Loading inventory...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8C887B' }}>No products match your filters.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const isLow = p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
                    const isOut = p.stock === 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="admin-product-cell">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}
                              alt={p.name}
                            />
                            <div>
                              <span>{p.name}</span>
                              <span className="text-muted">{p.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td>{p.categories?.name || p.category || '—'}</td>
                        <td className="tag-gold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                        <td>
                          {editingId === p.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              style={{ width: '70px', padding: '4px 8px', border: '1px solid #C9A96E', borderRadius: '3px', fontSize: '0.85rem' }}
                              autoFocus
                            />
                          ) : (
                            <strong style={{ color: isOut ? '#D90429' : isLow ? '#E65100' : '#1A1A1A' }}>
                              {p.stock ?? '—'}
                            </strong>
                          )}
                        </td>
                        <td>
                          <span className={`stock-badge ${isOut ? 'stock-low' : isLow ? 'stock-low' : 'stock-ok'}`}>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {editingId === p.id ? (
                              <>
                                <button className="table-action-btn" title="Save" onClick={() => handleSaveStock(p)}>
                                  <Check size={14} color="#2D6A4F" />
                                </button>
                                <button className="table-action-btn btn-danger" title="Cancel" onClick={() => setEditingId(null)}>
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                className="table-action-btn"
                                title="Edit Stock"
                                onClick={() => { setEditingId(p.id); setEditStock(String(p.stock ?? 0)); }}
                              >
                                <Edit2 size={14} />
                              </button>
                            )}
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
    </>
  );
}
