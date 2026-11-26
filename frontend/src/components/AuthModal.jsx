import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useUIStore from '../store/uiStore';
import useAuthStore from '../store/authStore';
import './AuthModal.css';

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, setAuthMode } = useUIStore();
  const { signIn, signUp, signUpWithPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showMobileTab, setShowMobileTab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOtpVerification, setIsOtpVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        await signIn(email, password);
        toast.success('Welcome back to Teya Collections!');
        closeAuth();
      } else if (isOtpVerification) {
        // OTP verification for phone sign-up
        await useAuthStore.getState().verifyPhoneOtp(phone, otp);
        toast.success('Phone verified! Account created.');
        setAuthMode('login');
        setIsOtpVerification(false);
        setPhone('');
        setOtp('');
      } else if (showMobileTab) {
        // Mobile sign-up with OTP
        if (!phone) {
          throw new Error('Please enter your mobile number');
        }
        if (!/^\+91\d{10}$/.test(phone)) {
          throw new Error('Please enter a valid mobile number with country code +91');
        }
        // Send OTP via supabase
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setIsOtpVerification(true);
        toast.success('OTP sent to your mobile number. Please verify.');
      } else {
        // Email sign-up with validation
        if (!email || !password || !fullName) {
          throw new Error('Please fill in all required fields');
        }
        await signUpWithPassword(email, password, fullName);
        toast.success('Account created! Please check your email to confirm.');
        setAuthMode('login');
      }
    } catch (err) {
      console.error('Auth error:', err);

      // Map Supabase error messages to user-friendly text
      const msg = err.message || '';
      let friendlyMsg = 'Authentication failed. Please try again.';

      if (msg === 'Failed to fetch' || msg.includes('Network') || msg.includes('CORS') || !err.response && !msg) {
        friendlyMsg =
          'Network error (CORS). In Supabase Dashboard → Authentication → URL Configuration → Redirect URLs, add: http://localhost:5173  (and confirm your project URL/anon key are valid in frontend/.env).';
      } else if (msg.includes('Email not confirmed')) {
        friendlyMsg = 'Please check your inbox and confirm your email before signing in.';
      } else if (msg.includes('Invalid login credentials') || msg.includes('email') || msg.includes('not found')) {
        friendlyMsg = 'Incorrect email or password. Please try again.';
      } else if (msg.includes('already registered') || msg.includes('User already registered')) {
        friendlyMsg = 'An account with this email already exists. Try signing in.';
      } else if (msg.includes('Password should be') || msg.includes('password is too weak')) {
        friendlyMsg = 'Password must be at least 6 characters long.';
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        friendlyMsg = 'Too many attempts. Please wait a minute and try again.';
      } else if (msg) {
        friendlyMsg = msg;
      }

      toast.error(friendlyMsg, { duration: 8000 });
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

              {/* Tab Buttons */}
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab-btn ${!showMobileTab ? 'active' : ''}`}
                  onClick={() => setShowMobileTab(false)}
                >
                  Email <Mail size={16} />
                </button>
                <button
                  type="button"
                  className={`auth-tab-btn ${showMobileTab ? 'active' : ''}`}
                  onClick={() => setShowMobileTab(true)}
                >
                  Mobile <Mobile size={16} />
                </button>
              </div>

              {/* Email Sign-up Tab */}
              {showMobileTab !== true && (
                <div>
                  {authMode === 'register' && !isOtpVerification && (
                    <div className="auth-field">
                      <label className="auth-field__label" htmlFor="auth-fullname">Full Name</label>
                      <div className="auth-input-wrapper">
                        <User size={16} className="auth-input-icon" aria-hidden="true" />
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

                  {isOtpVerification && (
                    <div className="auth-field">
                      <label className="auth-field__label" htmlFor="auth-otp">OTP Code</label>
                      <div className="auth-input-wrapper">
                        <Loader2 size={16} className="auth-input-icon" aria-hidden="true" />
                        <input
                          id="auth-otp"
                          className="auth-input"
                          type="number"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          autoComplete="one-time-code"
                        />
                      </div>
                    </div>
                  )}

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

                  <div className="auth-field">
                    <label className="auth-field__label" htmlFor="auth-password">Password</label>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="auth-password"
                        className="auth-input"
                        type="password"
                        placeholder="••••••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Sign-up Tab */}
              {showMobileTab && (
                <div>
                  {authMode === 'register' && !isOtpVerification && (
                    <div className="auth-field">
                      <label className="auth-field__label" htmlFor="auth-fullname">Full Name</label>
                      <div className="auth-input-wrapper">
                        <User size={16} className="auth-input-icon" aria-hidden="true" />
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

                  <div className="auth-field">
                    <label className="auth-field__label" htmlFor="auth-phone">Mobile Number</label>
                    <div className="auth-input-wrapper">
                      <Mobile size={16} className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="auth-phone"
                        className="auth-input"
                        type="tel"
                        placeholder="+91 98765 12345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        autoComplete="tel"
                        maxLength={15}
                        placeholder="+91 followed by 10 digits"
                      />
                    </div>
                  </div>

                  {/* Send OTP button */}
                  <div className="auth-field">
                    <button
                      type="button"
                      onClick={() => {
                        if (!phone) {
                          throw new Error('Please enter your mobile number');
                        }
                        if (!/^\+91\d{10}$/.test(phone)) {
                          throw new Error('Please enter a valid mobile number with country code +91');
                        }
                        supabase.auth.signInWithOtp({
                          phone,
                          options: { data: { full_name: fullName } },
                        }).then(() => {
                          setIsOtpVerification(true);
                          toast.success('OTP sent to your mobile number. Please verify.');
                        }).catch((err) => {
                          toast.error(err.message || 'Failed to send OTP');
                        });
                      }}
                      className="btn-secondary"
                      disabled={loading}
                    >
                      Send OTP
                    </button>
                  </div>

                  {/* OTP Verification Section */}
                  {isOtpVerification && (
                    <div className="auth-field">
                      <label className="auth-field__label" htmlFor="auth-otp">OTP Code</label>
                      <div className="auth-input-wrapper">
                        <Loader2 size={16} className="auth-input-icon" aria-hidden="true" />
                        <input
                          id="auth-otp"
                          className="auth-input"
                          type="number"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          autoComplete="one-time-code"
                        />
                      </div>
                    </div>
                  )}

                  {/* Resend OTP */}
                  {isOtpVerification && (
                    <div className="auth-field">
                      <p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!phone) return;
                            supabase.auth.signInWithOtp({
                              phone,
                              options: { data: { full_name: fullName } },
                            }).then(() => {
                              toast.success('OTP resent successfully');
                            }).catch((err) => {
                              toast.error(err.message || 'Failed to resend OTP');
                            });
                          }}
                          className="auth-resend-btn"
                        >
                          Resend OTP
                        </button>
                        {isOtpVerification && !otp && (
                          <span>00:30</span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Submit OTP Verification */}
                  {isOtpVerification && (
                    <button
                      type="submit"
                      className="btn-primary btn-block"
                      disabled={loading}
                    >
                      Verify OTP
                    </button>
                  )}
                </div>
              )}

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