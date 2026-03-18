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
