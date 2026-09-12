import { useState, useEffect } from 'react';
import { User, Mail, Phone, LogOut, Package, Shield, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import './Account.css';

export default function AccountPage() {
  const { user, profile, signOut, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchProfile(user.id);
      toast.success('Wardrobe profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <div className="account-page container">
      <div className="account-header">
        <h1 className="account-title">My Account</h1>
        <p className="account-sub">Manage your personal atelier details, contact info, and preferences.</p>
      </div>

      <div className="account-grid">
        {/* Navigation / Overview sidebar */}
        <div className="account-sidebar">
          <div className="account-user-card">
            <div className="account-avatar">
              {fullName ? fullName.charAt(0).toUpperCase() : 'T'}
            </div>
            <h3 className="account-user-name">{fullName || 'Teya Member'}</h3>
            <span className="account-user-email">{user?.email}</span>
            {profile?.role === 'admin' && (
              <span className="account-role-badge">
                <Shield size={12} /> Administrator
              </span>
            )}
          </div>

          <div className="account-nav-links">
            <Link to="/orders" className="account-nav-item">
              <Package size={18} />
              <span>Order Archives</span>
            </Link>
            {profile?.role === 'admin' && (
              <Link to="/admin" className="account-nav-item">
                <Shield size={18} />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <button onClick={handleSignOut} className="account-nav-item account-signout-btn">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile edit form */}
        <div className="account-content">
          <div className="account-card">
            <h2 className="account-card-title">Personal Details</h2>
            <form onSubmit={handleUpdate} className="account-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrap">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sabina Verma"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrap">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-disabled"
                  />
                </div>
                <span className="input-hint">Email cannot be changed directly</span>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrap">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary account-save-btn">
                {saving ? (
                  <>
                    <Loader2 size={16} className="spinner" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
