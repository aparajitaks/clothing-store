import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useUIStore from '../store/uiStore';
import useAuthStore from '../store/authStore';
import './AuthModal.css';

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, setAuthMode } = useUIStore();
  const { signIn, signUp } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        await signIn(email, password);
        toast.success('Welcome back to Teya Collections!');
        closeAuth();
      } else {
        await signUp(email, password, fullName);
        toast.success('Account created! Please check your email to confirm.');
        setAuthMode('login');
      }
    } catch (err) {
      console.error('Auth error:', err);

      // Map Supabase error messages to user-friendly text
      const msg = err.message || '';
      let friendlyMsg = 'Authentication failed. Please try again.';

      if (msg.includes('Email not confirmed')) {
        friendlyMsg = 'Please check your inbox and confirm your email before signing in.';
      } else if (msg.includes('Invalid login credentials') || msg.includes('email') || msg.includes('not found')) {
        friendlyMsg = 'Incorrect email or password. Please try again.';
      } else if (msg.includes('already registered')) {
        friendlyMsg = 'An account with this email already exists. Try signing in.';
      } else if (msg.includes('Password should be')) {
        friendlyMsg = 'Password must be at least 6 characters long.';
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        friendlyMsg = 'Too many attempts. Please wait a minute and try again.';
      } else if (msg) {
        friendlyMsg = msg;
      }

      toast.error(friendlyMsg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <div className="auth-overlay">
          {/* Backdrop */}
          <motion.div
            className="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuth}
          />

          {/* Modal card */}
          <motion.div
            className="auth-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <button className="auth-modal__close" onClick={closeAuth} aria-label="Close">
              <X size={20} />
            </button>

            {/* Header */}
            <div className="auth-modal__header">
              <img
                src="/logo-mark.png"
                alt="TEYA COLLECTIONS"
                className="auth-modal__logo-mark"
              />
              <span className="auth-modal__brand">Teya Collections</span>
              <h2 className="auth-modal__title">
                {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="auth-modal__sub">
                {authMode === 'login'
                  ? 'Sign in to access your orders, wishlist, and bespoke recommendations.'
                  : 'Join the world of timeless fashion and enjoy exclusive access to new arrivals.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-modal__form" noValidate={false}>

              {/* Full Name — register only */}
              {authMode === 'register' && (
                <div className="auth-field">
                  <label className="auth-field__label" htmlFor="auth-fullname">Full Name</label>
                  <div className="auth-input-wrapper">
                    {/* Icon: position absolute, left:16px, vertically centred */}
                    <User size={16} className="auth-input-icon" aria-hidden="true" />
                    {/* Input: padding-left:52px so text starts well after icon */}
                    <input
                      id="auth-fullname"
                      className="auth-input"
                      type="text"
                      placeholder="Sabina Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="auth-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="auth-email"
                    className="auth-input"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="auth-password">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="auth-password"
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary btn-block"
                disabled={loading}
                style={{ marginTop: '0.25rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="auth-modal__footer">
              {authMode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => setAuthMode('register')}>
                    Create one
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setAuthMode('login')}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
