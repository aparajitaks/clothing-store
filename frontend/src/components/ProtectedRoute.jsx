import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import { useEffect } from 'react';

export default function ProtectedRoute() {
  const { user, loading } = useAuthStore();
  const openAuth = useUIStore((s) => s.openAuth);
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      openAuth('login');
    }
  }, [loading, user, openAuth]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', color: '#8C887B' }}>
          Loading your session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
