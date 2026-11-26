import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Warehouse, Tag, RotateCcw, ChevronRight, Menu, X } from 'lucide-react';
import './AdminLayout.css';

const navLinks = [
  { to: '/admin',             label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products',    label: 'Products',  icon: Package },
  { to: '/admin/orders',      label: 'Orders',    icon: ShoppingBag },
  { to: '/admin/inventory',   label: 'Inventory', icon: Warehouse },
  { to: '/admin/coupons',     label: 'Coupons',   icon: Tag },
  { to: '/admin/returns',     label: 'Returns',   icon: RotateCcw },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="admin-layout">
      {/* Mobile Topbar */}
      <header className="admin-mobile-header">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle admin menu"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="admin-mobile-title">Teya Atelier Admin</span>
        <Link to="/" className="admin-mobile-store-link">Store →</Link>
      </header>

      {sidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <Link to="/" className="admin-brand-logo" aria-label="Visit storefront">
            <img src="/logo-mark-white.png" alt="TC" className="admin-brand-logo-img" />
          </Link>
          <div>
            <p className="admin-brand-name">Teya Collections</p>
            <p className="admin-brand-role label-sm">Atelier Admin</p>
          </div>
        </div>

        <nav className="admin-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`admin-nav-link ${pathname === to ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
              {pathname === to && <ChevronRight size={14} className="admin-nav-arrow" />}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
            ← Back to Store
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
