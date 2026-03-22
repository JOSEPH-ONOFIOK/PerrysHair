import { useContext, useEffect } from 'react';
import { AppProvider, AppContext } from './context.jsx';
import GlobalStyles from './GlobalStyles.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import AuthModal from './components/AuthModal.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const PAGE_TITLES = {
  home:            "Perry's Hairline – Hair Store",
  products:        "Shop – Perry's Hairline",
  'product-detail':"Product – Perry's Hairline",
  cart:            "Your Cart – Perry's Hairline",
  checkout:        "Checkout – Perry's Hairline",
  'order-tracking':"Order Tracking – Perry's Hairline",
  history:         "My Orders – Perry's Hairline",
  admin:           "Admin Dashboard – Perry's Hairline",
  auth:            "Sign In – Perry's Hairline",
};

function AppInner() {
  const { state } = useContext(AppContext);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.view]);

  useEffect(() => {
    document.title = PAGE_TITLES[state.view] ?? "Perry's Hairline";
  }, [state.view]);

  const renderView = () => {
    switch (state.view) {
      case 'home':          return <HomePage />;
      case 'products':      return <ProductsPage />;
      case 'product-detail':return <ProductDetail />;
      case 'cart':          return <CartPage />;
      case 'checkout':      return <CheckoutPage />;
      case 'order-tracking':return <OrderTracking />;
      case 'history':       return <HistoryPage />;
      case 'admin':         return <AdminDashboard />;
      default:              return <HomePage />;
    }
  };

  if (state.loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
        <GlobalStyles />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          {/* Skeleton navbar */}
          <div style={{ height: 64, background: 'rgba(253,240,245,0.96)', marginBottom: 40, borderRadius: 8 }} />
          {/* Skeleton product cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ height: 200, background: 'linear-gradient(90deg, #f0e8ed 25%, #fdf0f5 50%, #f0e8ed 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ padding: 18 }}>
                  <div style={{ height: 12, borderRadius: 6, background: '#f0e8ed', marginBottom: 10, width: '60%' }} />
                  <div style={{ height: 18, borderRadius: 6, background: '#f0e8ed', marginBottom: 10 }} />
                  <div style={{ height: 12, borderRadius: 6, background: '#f0e8ed', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <GlobalStyles />
      <Navbar />
      <main>{renderView()}</main>
      {state.view === 'auth' && <AuthModal />}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
