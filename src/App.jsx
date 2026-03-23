import { useContext, useEffect, useState } from 'react';
import { AppProvider, AppContext } from './context.jsx';
import GlobalStyles from './GlobalStyles.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import AuthModal from './components/AuthModal.jsx';
import ResetPasswordModal from './components/ResetPasswordModal.jsx';

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
  const { state, dispatch } = useContext(AppContext);
  const [verifying, setVerifying] = useState(false);

  // Handle Paystack redirect return (?payment_ref=xxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('payment_ref');
    if (!ref) return;

    // Clean URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    const pending = sessionStorage.getItem('pending_order');
    if (!pending) return;
    const order = JSON.parse(pending);
    sessionStorage.removeItem('pending_order');

    setVerifying(true);
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ reference: ref }),
      }
    )
      .then((r) => r.json())
      .then(async (data) => {
        if (data.paid) {
          const { insertOrder, decrementStock } = await import('./supabase.js');
          const { sendReceiptEmail } = await import('./email.js');
          if (order.customer?.id || state.user?.id) {
            await insertOrder(order, state.user?.id).catch(console.error);
          }
          decrementStock(order.items);
          order.items.forEach((item) => dispatch({ type: 'DECREMENT_STOCK', payload: { id: item.id, qty: item.qty } }));
          sendReceiptEmail(order);
          dispatch({ type: 'PLACE_ORDER', payload: order });
          dispatch({ type: 'SET_TOAST', payload: { msg: 'Payment confirmed! Order placed 🎉', icon: '✅' } });
        } else {
          dispatch({ type: 'SET_TOAST', payload: { msg: 'Payment could not be verified — contact support', icon: '❌' } });
          dispatch({ type: 'SET_VIEW', payload: 'checkout' });
        }
      })
      .catch(() => {
        dispatch({ type: 'SET_TOAST', payload: { msg: 'Verification error — contact support', icon: '❌' } });
      })
      .finally(() => setVerifying(false));
  }, []);

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

  if (verifying) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <GlobalStyles />
        <div style={{ fontSize: 48 }}>⏳</div>
        <p style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--espresso)' }}>Confirming your payment…</p>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Please wait, do not close this page.</p>
      </div>
    );
  }

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
      {state.view === 'reset-password' && <ResetPasswordModal />}
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
