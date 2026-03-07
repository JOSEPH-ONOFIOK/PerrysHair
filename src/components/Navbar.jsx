import { useContext } from 'react';
import { AppContext } from '../context.jsx';

export default function Navbar() {
  const { state, dispatch } = useContext(AppContext);
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)', padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <div
          style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 900, color: 'var(--espresso)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
        >
          <span style={{ fontSize: 20 }}>✦</span> Perrys Hairline
        </div>

        {/* Nav links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[['home', 'Home'], ['products', 'Shop']].map(([v, l]) => (
            <button key={v} className={`nav-link${state.view === v ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: v })}>{l}</button>
          ))}
          {state.user?.isAdmin && (
            <button className={`nav-link${state.view === 'admin' ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin' })}>Admin</button>
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {state.user ? (
            <>
              <span className="hide-mobile" style={{ fontSize: 13, color: 'var(--text-mid)' }}>Hi, {state.user.name.split(' ')[0]}</span>
              <button className="nav-link" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'history' })}>Orders</button>
              <button className="nav-link" onClick={() => dispatch({ type: 'LOGOUT' })}>Logout</button>
            </>
          ) : (
            <button className="btn-outline" style={{ padding: '8px 18px', fontSize: 13 }}
              onClick={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'login' })}>Sign In</button>
          )}
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'cart' })}
            style={{ position: 'relative', background: 'var(--espresso)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}
          >
            🛍️ <span className="hide-mobile">Cart</span>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--gold)', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
