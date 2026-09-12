import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('You\'re on the list. Welcome to the Teya circle.');
    setEmail('');
  };

  return (
    <footer className="footer">
      {/* Brand Values Banner */}
      <div className="footer__features container">
        <div className="feature-item">
          <Truck className="feature-icon" size={24} />
          <div>
            <h4>Free Express Shipping</h4>
            <p>On all orders above ₹999</p>
          </div>
        </div>
        <div className="feature-item">
          <Award className="feature-icon" size={24} />
          <div>
            <h4>Artisan Craftsmanship</h4>
            <p>Every kurta made with intention</p>
          </div>
        </div>
        <div className="feature-item">
          <RefreshCw className="feature-icon" size={24} />
          <div>
            <h4>7-Day Easy Returns</h4>
            <p>Hassle-free size exchange and refunds</p>
          </div>
        </div>
        <div className="feature-item">
          <ShieldCheck className="feature-icon" size={24} />
          <div>
            <h4>Secure Payments</h4>
            <p>100% encrypted checkout via Razorpay</p>
          </div>
        </div>
      </div>

      <div className="footer__divider" />

      {/* Main Footer Content */}
      <div className="footer__main container">
        <div className="footer__col footer__col--brand">
          <Link to="/" className="footer__brand" aria-label="TEYA COLLECTIONS Home">
            <img
              src="/logo-horizontal-white.png"
              alt="TEYA COLLECTIONS"
              className="footer__brand-logo"
            />
          </Link>
          <p className="footer__desc">
            Premium kurtas for the modern Indian wardrobe. Handcrafted in natural fabrics — cotton, linen, and Chanderi silk — by artisans across India.
          </p>
          <div className="footer__socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4 className="footer__title">Shop</h4>
          <ul className="footer__links">
            <li><Link to="/shop">All Kurtas</Link></li>
            <li><Link to="/category/everyday-kurtas">Everyday Kurtas</Link></li>
            <li><Link to="/category/embroidered-kurtas">Embroidered Kurtas</Link></li>
            <li><Link to="/category/festive-kurtas">Festive Kurtas</Link></li>
            <li><Link to="/category/cotton-linen-kurtas">Cotton & Linen</Link></li>
            <li><Link to="/category/kurta-sets">Kurta Sets</Link></li>
            <li><Link to="/collections">Collections</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__title">Help</h4>
          <ul className="footer__links">
            <li><Link to="/orders">Track Order</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/faq">Shipping & Returns</Link></li>
            <li><Link to="/faq">Size Guide</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer__col footer__col--newsletter">
          <h4 className="footer__title">The Teya Journal</h4>
          <p className="footer__newsletter-desc">
            New seasonal kurta drops, styling journals, and craft stories — delivered to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="footer__form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="footer__input"
            />
            <button type="submit" className="footer__submit" aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="footer__bottom container">
        <p className="footer__copyright">
          © {new Date().getFullYear()} TEYA COLLECTIONS. PREMIUM INDIAN ETHNIC WEAR & KURTAS.
        </p>
        <div className="footer__payments">
          <img
            src="https://www.biba.in/on/demandware.static/-/Library-Sites-BibaSharedLibrary/default/dw3e8c0d89/payment-partners.svg"
            alt="Payment Partners"
            height="22"
            loading="lazy"
          />
        </div>
        <div className="footer__legal">
          <Link to="/faq">Privacy Policy</Link>
          <span>·</span>
          <Link to="/faq">Terms of Service</Link>
          <span>·</span>
          <Link to="/faq">Shipping Policy</Link>
        </div>
      </div>
    </footer>
  );
}
