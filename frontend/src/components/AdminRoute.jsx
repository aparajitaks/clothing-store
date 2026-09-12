import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function AdminRoute() {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', color: '#8C887B' }}>
          Verifying administrative privileges...
        </p>
      </div>
    );
  }

  // Allow if user is admin, or during dev/preview mode if profile role is admin
  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
