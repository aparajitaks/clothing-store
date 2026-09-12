import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import AuthModal from '../components/AuthModal';
import SearchOverlay from '../components/SearchOverlay';

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>
        {children || <Outlet />}
      </main>
      <Footer />
      <CartDrawer />
      <AuthModal />
      <SearchOverlay />
    </>
  );
}

