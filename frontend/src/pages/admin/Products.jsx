import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { supabase } from '../../lib/supabase';
import './Admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    price: '',
    compare_price: '',
    stock: 10,
    description: '',
    image_url: '',
    sizes: 'XS, S, M, L, XL',
    colors: 'Champagne Gold, Ivory Cream, Noir Black',
    is_featured: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load categories
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);

      // 2. Load products
      const res = await api.get('/admin/products');
      if (res.data?.data?.products) {
        setProducts(res.data.data.products);
        return;
      }

      const { data: prodData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (prodData) setProducts(prodData);
    } catch (err) {
      console.warn('Fallback products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      price: '',
      compare_price: '',
      stock: 10,
      description: '',
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      sizes: 'XS, S, M, L, XL',
      colors: 'Ivory Cream, Noir Black',
      is_featured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      category_id: prod.category_id || '',
      price: prod.price,
      compare_price: prod.compare_price || '',
      stock: prod.stock,
      description: prod.description || '',
      image_url: Array.isArray(prod.images) && prod.images[0] ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].url) : '',
      sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : 'XS, S, M, L',
      colors: Array.isArray(prod.colors) ? prod.colors.map(c => typeof c === 'string' ? c : c.name).join(', ') : '',
      is_featured: prod.is_featured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_id: formData.category_id || null,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        stock: parseInt(formData.stock),
        description: formData.description,
        images: [{ url: formData.image_url, isPrimary: true }],
        sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map((c) => ({ name: c.trim(), hex: '#1A1A1A' })).filter((c) => c.name),
        is_featured: formData.is_featured,
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        toast.success('Piece updated successfully');
      } else {
        await api.post('/admin/products', payload);
        toast.success('New piece added to atelier catalog');
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving piece');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you certain you wish to archive this garment?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Garment archived');
      loadData();
    } catch (err) {
      toast.error('Could not archive piece');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Garments & Creations Catalog</h1>
          <p className="admin-page-sub">Manage silhouettes, stock allocation, sizing, and pricing.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary admin-add-btn">
          <Plus size={18} /> New Creation
        </button>
      </div>

      <div className="admin-section-card">
        {/* Search */}
        <div className="admin-search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search catalog by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Piece</th>
                <th>Category</th>
                <th>Price</th>
                <th>Compare Price</th>
                <th>Inventory</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prod) => {
                const img = Array.isArray(prod.images) && prod.images[0]
                  ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].url)
                  : 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200';
                return (
                  <tr key={prod.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={img} alt={prod.name} />
                        <div>
                          <strong>{prod.name}</strong>
                          <span className="font-mono text-muted">{prod.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>{prod.categories?.name || '—'}</td>
                    <td>₹{Number(prod.price).toLocaleString('en-IN')}</td>
                    <td>{prod.compare_price ? `₹${Number(prod.compare_price).toLocaleString('en-IN')}` : '—'}</td>
                    <td>
                      <span className={`stock-badge ${prod.stock <= 3 ? 'stock-low' : 'stock-ok'}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td>{prod.is_featured ? <span className="tag-gold">Yes</span> : 'No'}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => openEditModal(prod)} className="table-action-btn" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(prod.id)} className="table-action-btn btn-danger" title="Archive">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit/Create Modal */}
      {modalOpen && (
        <div className="auth-overlay">
          <div className="auth-backdrop" onClick={() => setModalOpen(false)} />
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{editingProduct ? 'Edit Silhouette' : 'New Creation'}</h2>
              <button onClick={() => setModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Garment Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aurelia Silk Midi Dress"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>URL Slug</label>
                  <input
                    type="text"
                    placeholder="aurelia-silk-midi-dress"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock Available *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Compare Price (₹)</label>
                  <input
                    type="number"
                    placeholder="6499"
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Primary Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sizes (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Colors (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description & Textile Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  Featured in Spring/Summer Haute Showcase
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Garment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
