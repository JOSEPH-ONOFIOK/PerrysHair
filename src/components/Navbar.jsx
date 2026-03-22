import { useContext, useState } from 'react';
import { AppContext } from '../context.jsx';
import { signOut } from '../supabase.js';

export default function Navbar() {
  const { state, dispatch } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);

  const navigate = (view) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    setMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(253,240,245,0.96)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)', padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <button
          style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 900, color: 'var(--espresso)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0 }}
          onClick={() => navigate('home')}
          aria-label="Perry's Hairline – go to home"
        >
          <span aria-hidden="true" style={{ fontSize: 20 }}>✦</span> Perrys Hairline
        </button>

        {/* Desktop nav links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[['home', 'Home'], ['products', 'Shop']].map(([v, l]) => (
            <button key={v} className={`nav-link${state.view === v ? ' active' : ''}`}
              onClick={() => navigate(v)}>{l}</button>
          ))}
          {state.user?.isAdmin && (
            <button className={`nav-link${state.view === 'admin' ? ' active' : ''}`}
              onClick={() => navigate('admin')}>Admin</button>
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Desktop user info */}
          <span className="hide-mobile" style={{ fontSize: 13, color: 'var(--text-mid)' }}>
            {state.user ? `Hi, ${state.user.name.split(' ')[0]}` : ''}
          </span>

          {/* Desktop auth buttons */}
          {state.user ? (
            <>
              <button className="nav-link hide-mobile" onClick={() => navigate('history')}>Orders</button>
              <button className="nav-link hide-mobile" onClick={handleSignOut}>Logout</button>
            </>
          ) : (
            <button className="btn-outline hide-mobile" style={{ padding: '8px 18px', fontSize: 13 }}
              onClick={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'login' })}>Sign In</button>
          )}

          {/* Cart button */}
          <button
            onClick={() => navigate('cart')}
            aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}` : 'Cart'}
            style={{ position: 'relative', background: 'var(--espresso)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}
          >
            <span aria-hidden="true">🛍️</span> <span className="hide-mobile">Cart</span>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--gold)', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger button — mobile only */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: 'var(--espresso)', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'var(--gold)' : 'var(--espresso)', borderRadius: 2, transition: 'transform 0.2s, opacity 0.2s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: 'var(--espresso)', borderRadius: 2, transition: 'opacity 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'var(--gold)' : 'var(--espresso)', borderRadius: 2, transition: 'transform 0.2s, opacity 0.2s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div id="mobile-nav" role="navigation" aria-label="Mobile navigation" className="mobile-nav open" style={{ position: 'absolute', top: 64, left: 0, right: 0, background: 'rgba(253,240,245,0.98)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', padding: '12px 20px 20px', flexDirection: 'column', gap: 2, zIndex: 99 }}>
          {state.user && (
            <div style={{ padding: '10px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 4 }}>
              Hi, {state.user.name.split(' ')[0]}
            </div>
          )}
          <button className={`nav-link${state.view === 'home' ? ' active' : ''}`} style={{ textAlign: 'left', padding: '13px 16px', fontSize: 15, borderRadius: 8, width: '100%' }} onClick={() => navigate('home')}>Home</button>
          <button className={`nav-link${state.view === 'products' ? ' active' : ''}`} style={{ textAlign: 'left', padding: '13px 16px', fontSize: 15, borderRadius: 8, width: '100%' }} onClick={() => navigate('products')}>Shop</button>
          {state.user && (
            <button className={`nav-link${state.view === 'history' ? ' active' : ''}`} style={{ textAlign: 'left', padding: '13px 16px', fontSize: 15, borderRadius: 8, width: '100%' }} onClick={() => navigate('history')}>My Orders</button>
          )}
          {state.user?.isAdmin && (
            <button className={`nav-link${state.view === 'admin' ? ' active' : ''}`} style={{ textAlign: 'left', padding: '13px 16px', fontSize: 15, borderRadius: 8, width: '100%' }} onClick={() => navigate('admin')}>Admin</button>
          )}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          {state.user ? (
            <button className="nav-link" style={{ textAlign: 'left', padding: '13px 16px', fontSize: 15, borderRadius: 8, width: '100%', color: 'var(--error)' }} onClick={handleSignOut}>Logout</button>
          ) : (
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              onClick={() => { dispatch({ type: 'SET_AUTH_MODE', payload: 'login' }); setMenuOpen(false); }}>Sign In</button>
          )}
        </div>
      )}
    </nav>
  );
}
