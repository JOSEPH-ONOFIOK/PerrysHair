import { useContext, useEffect, useRef, useState } from 'react';
import { AppProvider, AppContext } from './context.jsx';
import GlobalStyles from './GlobalStyles.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import AuthModal from './components/AuthModal.jsx';
import ResetPasswordModal from './components/ResetPasswordModal.jsx';
import WhatsAppBubble from './components/WhatsAppBubble.jsx';
import RegionModal from './components/RegionModal.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import WishlistPage from './pages/WishlistPage.jsx';

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
  wishlist:        "My Wishlist – Perry's Hairline",
};

function AppInner() {
  const { state, dispatch } = useContext(AppContext);
  const [verifying, setVerifying] = useState(false);
  const [pendingRecovery, setPendingRecovery] = useState(
    () => !!localStorage.getItem('pending_order')
  );

  const recoverPayment = () => {
    const raw = localStorage.getItem('pending_order');
    if (!raw) { setPendingRecovery(false); return; }
    let order;
    try { order = JSON.parse(raw); } catch { setPendingRecovery(false); return; }
    if (!order?.id) { setPendingRecovery(false); return; }
    localStorage.removeItem('pending_order');
    sessionStorage.removeItem('pending_order');
    setPendingRecovery(false);
    setVerifying(true);
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ reference: order.id }),
      }
    )
      .then((r) => r.json())
      .then(async (data) => {
        if (data.paid) {
          const { insertOrder, decrementStock } = await import('./supabase.js');
          const { sendReceiptEmail, sendAdminNewOrderEmail } = await import('./email.js');
          if (state.user?.id) await insertOrder(order, state.user.id).catch(() => {});
          decrementStock(order.items);
          order.items.forEach((item) => dispatch({ type: 'DECREMENT_STOCK', payload: { id: item.id, qty: item.qty } }));
          sendReceiptEmail(order);
          sendAdminNewOrderEmail(order);
          dispatch({ type: 'PLACE_ORDER', payload: order });
          dispatch({ type: 'SET_TOAST', payload: { msg: 'Payment confirmed! Order placed 🎉', icon: '✅' } });
        } else {
          dispatch({ type: 'SET_TOAST', payload: { msg: 'Payment not confirmed yet — if you paid, contact support', icon: '⚠️' } });
        }
      })
      .catch(() => dispatch({ type: 'SET_TOAST', payload: { msg: 'Could not verify — contact support on WhatsApp', icon: '❌' } }))
      .finally(() => setVerifying(false));
  };

  // Handle Paystack redirect return — supports both ?payment_ref= and bare ?trxref=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('payment_ref');
    const trxrefParam = params.get('trxref') || params.get('reference');

    // Accept redirect if either our custom ref or Paystack's trxref is present
    const hasRef = ref && /^[A-Za-z0-9_\-]{4,100}$/.test(ref);
    const hasTrxref = trxrefParam && /^[A-Za-z0-9_\-]{4,100}$/.test(trxrefParam);
    if (!hasRef && !hasTrxref) return;

    // Use Paystack's trxref for verification; fall back to our order ref
    const trxref = trxrefParam || ref;

    // Clean URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    // Try sessionStorage first, fall back to localStorage (Opay/bank redirects clear sessionStorage)
    const raw = sessionStorage.getItem('pending_order') || localStorage.getItem('pending_order');
    if (!raw) return;
    let order;
    try { order = JSON.parse(raw); } catch { return; }
    if (!order?.id || !Array.isArray(order?.items)) return;
    sessionStorage.removeItem('pending_order');
    localStorage.removeItem('pending_order');
    setPendingRecovery(false);

    setVerifying(true);
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ reference: trxref }),
      }
    )
      .then((r) => r.json())
      .then(async (data) => {
        if (data.paid) {
          const { insertOrder, decrementStock } = await import('./supabase.js');
          const { sendReceiptEmail, sendAdminNewOrderEmail } = await import('./email.js');
          if (order.customer?.id || state.user?.id) {
            await insertOrder(order, state.user?.id).catch(console.error);
          }
          decrementStock(order.items);
          order.items.forEach((item) => dispatch({ type: 'DECREMENT_STOCK', payload: { id: item.id, qty: item.qty } }));
          sendReceiptEmail(order);
          sendAdminNewOrderEmail(order);
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

  // Scroll to top whenever the selected product changes (same-view navigation)
  useEffect(() => {
    if (state.view === 'product-detail') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [state.selectedProduct?.id]);

  // ── URL-based navigation ─────────────────────────────────────────────────────
  // Sync view → URL so sharing and refresh work correctly
  const urlSynced = useRef(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Skip first render — don't overwrite the URL the user arrived on
    if (!urlSynced.current) { urlSynced.current = true; return; }
    const skip = ['auth', 'reset-password'];
    if (skip.includes(state.view)) return;

    const params = new URLSearchParams();
    if (state.view === 'product-detail' && state.selectedProduct?.id) {
      params.set('product', state.selectedProduct.id);
    } else if (state.view !== 'home') {
      params.set('view', state.view);
    }
    const newUrl = params.toString() ? `/?${params}` : '/';
    const currentUrl = window.location.pathname + window.location.search;
    if (newUrl !== currentUrl) window.history.pushState(null, '', newUrl);
  }, [state.view, state.selectedProduct?.id]);

  // Restore view from URL on first load — waits for products to actually be available
  const urlRestored = useRef(false);
  useEffect(() => {
    // Don't mark as done until products are loaded — auth resolves before products,
    // so loading:false can fire with an empty products array (race condition)
    if (state.loading || state.products.length === 0) return;
    if (urlRestored.current) return;
    urlRestored.current = true;
    const params = new URLSearchParams(window.location.search);
    // Don't interfere with payment redirect params
    if (params.has('payment_ref') || params.has('trxref') || params.has('reference')) return;
    const productId = params.get('product');
    const view = params.get('view');
    if (productId) {
      const product = state.products.find((p) => String(p.id) === String(productId));
      if (product) { dispatch({ type: 'SELECT_PRODUCT', payload: product }); return; }
    }
    if (view) {
      const allowed = ['products', 'cart', 'history', 'wishlist', 'checkout'];
      if (allowed.includes(view)) dispatch({ type: 'SET_VIEW', payload: view });
    }
  }, [state.loading, state.products.length]);

  // Handle browser back / forward buttons
  useEffect(() => {
    if (state.loading) return;
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      const view = params.get('view') || 'home';
      if (productId) {
        const product = state.products.find((p) => String(p.id) === String(productId));
        if (product) dispatch({ type: 'SELECT_PRODUCT', payload: product });
        else dispatch({ type: 'SET_VIEW', payload: 'products' });
      } else {
        dispatch({ type: 'SET_VIEW', payload: view });
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [state.products, state.loading]);

  // Scroll reveal — watches for .reveal / .reveal-left / .reveal-right elements
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    const observe = () =>
      document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach((el) => {
        if (!el.classList.contains('revealed')) io.observe(el);
      });
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
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
      case 'wishlist':      return <WishlistPage />;
      default:              return <HomePage />;
    }
  };

  if (verifying) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
        role="status" aria-live="polite" aria-label="Confirming payment">
        <GlobalStyles />
        <div style={{ fontSize: 48 }} aria-hidden="true">⏳</div>
        <p style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--espresso)' }}>Confirming your payment…</p>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Please wait, do not close this page.</p>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)' }} role="status" aria-live="polite" aria-label="Loading store">
        <GlobalStyles />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }} aria-hidden="true">
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
        <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Loading store content…</p>
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <GlobalStyles />
      {/* Skip link for keyboard / screen reader users */}
      <a href="#main-content"
        style={{ position: 'absolute', top: -40, left: 8, background: 'var(--espresso)', color: '#fff', padding: '8px 16px', borderRadius: 4, fontSize: 14, zIndex: 9999, textDecoration: 'none', transition: 'top 0.1s' }}
        onFocus={(e) => { e.currentTarget.style.top = '8px'; }}
        onBlur={(e) => { e.currentTarget.style.top = '-40px'; }}>
        Skip to main content
      </a>
      <header>
        <Navbar />
      </header>
      {pendingRecovery && (
        <div style={{ background: '#fff8e6', borderBottom: '1px solid #f0d080', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
          <span>💳 We found a pending payment — did you complete it?</span>
          <button onClick={recoverPayment}
            style={{ background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Yes, check my payment
          </button>
          <button onClick={() => { localStorage.removeItem('pending_order'); setPendingRecovery(false); }}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--text-light)' }}>
            No, cancel
          </button>
        </div>
      )}
      <main id="main-content">{renderView()}</main>
      {state.view === 'auth' && <AuthModal />}
      {state.view === 'reset-password' && <ResetPasswordModal />}
      <Toast />
      <WhatsAppBubble />
      {state.showRegionModal && <RegionModal onClose={() => dispatch({ type: 'SET_REGION_MODAL', payload: false })} />}
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
