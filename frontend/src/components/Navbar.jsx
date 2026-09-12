import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Heart, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/collections/new-arrivals',     label: 'New Arrivals' },
  { to: '/category/kurta-sets',          label: 'Kurta Sets' },
  { to: '/category/everyday-kurtas',     label: 'Kurtas & Tops' },
  { to: '/category/festive-kurtas',      label: 'Festive Wear' },
  { to: '/category/cotton-linen-kurtas', label: 'Cotton & Linen' },
  { to: '/collections',                  label: 'Collections' },
  { to: '/about',                        label: 'About' },
];

const isNavActive = (to, currentPath) => {
  const normPath = currentPath.replace(/\/+$/, '') || '/';
  const normTo = to.replace(/\/+$/, '') || '/';

  const isMatch = normPath === normTo || normPath.startsWith(normTo + '/');
  if (!isMatch) return false;

  // If another link in NAV_LINKS is a more specific (longer) match for currentPath, do not activate this one
  const hasMoreSpecificMatch = NAV_LINKS.some(({ to: otherTo }) => {
    const normOther = otherTo.replace(/\/+$/, '') || '/';
    return (
      normOther !== normTo &&
      normOther.length > normTo.length &&
      (normPath === normOther || normPath.startsWith(normOther + '/'))
    );
  });

  return !hasMoreSpecificMatch;
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  const items       = useCartStore((s) => s.items);
  const itemCount   = items.reduce((s, i) => s + i.quantity, 0);
  const user        = useAuthStore((s) => s.user);
  const openCart    = useUIStore((s) => s.openCart);
  const openAuth    = useUIStore((s) => s.openAuth);
  const openSearch  = useUIStore((s) => s.openSearch);
  const authOpen    = useUIStore((s) => s.authOpen);
  const searchOpen  = useUIStore((s) => s.searchOpen);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header className={`navbar ${isTransparent ? 'navbar--transparent' : 'navbar--solid'} ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">
          {/* Brand */}
          <Link to="/" className="navbar__brand" aria-label="TEYA COLLECTIONS Home">
            <img
              src="/logo-horizontal.png"
              alt="TEYA COLLECTIONS"
              className="navbar__brand-logo"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar__nav">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`navbar__link ${isNavActive(to, pathname) ? 'active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="navbar__actions">
            <button className="navbar__icon-btn" onClick={openSearch} aria-label="Search">
              <Search size={19} />
            </button>

            {user ? (
              <Link to="/account" className="navbar__icon-btn" aria-label="Account">
                <User size={19} />
              </Link>
            ) : (
              <button className="navbar__icon-btn" onClick={openAuth} aria-label="Sign in">
                <User size={19} />
              </button>
            )}

            <Link to="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
              <Heart size={19} />
            </Link>

            <button
              className="navbar__icon-btn navbar__cart-btn"
              onClick={openCart}
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="navbar__cart-badge"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            <button
              className="navbar__icon-btn navbar__mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Announcement Bar — hidden when any modal is open */}
        {!scrolled && isHome && !authOpen && !searchOpen && (
          <div className="announcement-bar">
            <div className="marquee-wrap">
              <div className="marquee-track">
                {['Complimentary Express Shipping Across India', '·', 'AW Season Collection Now Live', '·', 'Handcrafted Natural Textiles & Pure Silks', '·', 'Artisanal Tailoring & Heirloom Finishes', '·', 'Complimentary Express Shipping Across India', '·', 'AW Season Collection Now Live', '·', 'Handcrafted Natural Textiles & Pure Silks', '·', 'Artisanal Tailoring & Heirloom Finishes', '·'].map((t, i) => (
                  <span key={i} className="announcement-item">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="mobile-menu"
          >
            <div className="mobile-menu__header">
              <Link to="/" className="navbar__brand" onClick={() => setMobileOpen(false)}>
                <img
                  src="/logo-horizontal.png"
                  alt="TEYA COLLECTIONS"
                  className="navbar__brand-logo"
                />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="navbar__icon-btn">
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-menu__nav">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`mobile-menu__link ${isNavActive(to, pathname) ? 'active' : ''}`}
                >
                  {label}
                </Link>
              ))}
              <div className="mobile-menu__divider" />
              {user ? (
                <>
              <Link to="/account" className="mobile-menu__link">My Account</Link>
                  <Link to="/orders"   className="mobile-menu__link">My Orders</Link>
                  <Link to="/wishlist" className="mobile-menu__link">Wishlist</Link>
                </>
              ) : (
                <button className="mobile-menu__link" onClick={() => { openAuth(); setMobileOpen(false); }}>
                  Sign In / Register
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
