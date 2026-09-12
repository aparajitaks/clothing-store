import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import useAuthStore from './store/authStore';

import MainLayout   from './layouts/MainLayout';
import AdminLayout  from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute   from './components/AdminRoute';
import ScrollToTop  from './components/ScrollToTop';

import HomePage             from './pages/Home';
import ShopPage             from './pages/Shop';
import CategoryPage         from './pages/Category';
import ProductPage          from './pages/Product';
import CartPage             from './pages/Cart';
import CheckoutPage         from './pages/Checkout';
import OrderConfirmPage     from './pages/OrderConfirm';
import OrdersPage           from './pages/Orders';
import OrderDetailPage      from './pages/OrderDetail';
import AccountPage          from './pages/Account';
import CollectionsPage      from './pages/Collections';
import CollectionDetailPage from './pages/CollectionDetail';
import SearchPage           from './pages/Search';
import WishlistPage         from './pages/Wishlist';
import AboutPage            from './pages/About';
import ContactPage          from './pages/Contact';
import FAQPage              from './pages/FAQ';
import NotFoundPage         from './pages/NotFound';

import AdminDashboard    from './pages/admin/Dashboard';
import AdminProducts     from './pages/admin/Products';
import AdminOrders       from './pages/admin/Orders';
import AdminInventory    from './pages/admin/Inventory';
import AdminCoupons      from './pages/admin/Coupons';
import AdminReturns      from './pages/admin/Returns';

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => { initialize(); }, [initialize]);

  return (
    <HelmetProvider>
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '4px',
            background: '#1A1A1A',
            color: '#fff',
          },
          success: { iconTheme: { primary: '#C9A96E', secondary: '#fff' } },
        }}
      />
      <ScrollToTop />
      <Routes>
        {/* Public storefront */}
        <Route element={<MainLayout />}>
          <Route path="/"                     element={<HomePage />} />
          <Route path="/shop"                 element={<ShopPage />} />
          <Route path="/search"               element={<SearchPage />} />
          <Route path="/collections"          element={<CollectionsPage />} />
          <Route path="/collections/:slug"    element={<CollectionDetailPage />} />
          <Route path="/category/:slug"       element={<CategoryPage />} />
          <Route path="/product/:slug"        element={<ProductPage />} />
          <Route path="/cart"                 element={<CartPage />} />
          <Route path="/wishlist"             element={<WishlistPage />} />

          {/* Brand pages */}
          <Route path="/about"                element={<AboutPage />} />
          <Route path="/contact"              element={<ContactPage />} />
          <Route path="/faq"                  element={<FAQPage />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout"           element={<CheckoutPage />} />
            <Route path="/order/confirm/:id"  element={<OrderConfirmPage />} />
            <Route path="/orders"             element={<OrdersPage />} />
            <Route path="/orders/:id"         element={<OrderDetailPage />} />
            <Route path="/account"            element={<AccountPage />} />
          </Route>
        </Route>

        {/* Admin (protected + admin role) */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"              element={<AdminDashboard />} />
            <Route path="/admin/products"     element={<AdminProducts />} />
            <Route path="/admin/orders"       element={<AdminOrders />} />
            <Route path="/admin/inventory"    element={<AdminInventory />} />
            <Route path="/admin/coupons"      element={<AdminCoupons />} />
            <Route path="/admin/returns"      element={<AdminReturns />} />
          </Route>
        </Route>

        <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
      </Routes>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
