import { useContext } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from '../components/HairVisual.jsx';
import { fmt } from '../data.js';

export default function CartPage() {
  const { state, dispatch } = useContext(AppContext);
  const { cart } = state;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const service = Math.round(subtotal * 0.025);
  const total = subtotal + service;

  if (cart.length === 0)
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🛍️</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 28, marginBottom: 12 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: 28 }}>Discover our amazing hair collection and treat yourself!</p>
        <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>Shop Now</button>
      </div>
    );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 32 }}>Shopping Cart</h1>
      <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        {/* Items */}
        <div>
          {cart.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: 20, padding: 20, marginBottom: 16 }}>
              <div style={{ background: 'linear-gradient(135deg, var(--blush), var(--cream))', borderRadius: 10, width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HairVisual image={item.image} size={70} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 3 }}>{item.category} • {item.length}</div>
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                    style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: 18, cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)', borderRadius: 6, padding: '4px 8px' }}>
                    <button style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text-mid)', width: 24 }}
                      onClick={() => {
                        if (item.qty > 1) dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, qty: item.qty - 1 } });
                        else dispatch({ type: 'REMOVE_FROM_CART', payload: item.id });
                      }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                    <button style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--text-mid)', width: 24 }}
                      onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, qty: item.qty + 1 } })}>+</button>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>{fmt(item.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 20 }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-light)' }}>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-light)' }}>VAT (2.5%)</span>
                <span style={{ color: 'var(--gold-dark)', fontSize: 12 }}>{fmt(service)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-light)' }}>Delivery</span>
                <span style={{ color: 'var(--success)', fontSize: 12 }}>Calculated at checkout</span>
              </div>
              <div style={{ height: 1, background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold)' }}>{fmt(total)}</span>
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
              onClick={() => {
                if (!state.user) dispatch({ type: 'SET_AUTH_MODE', payload: 'login' });
                else dispatch({ type: 'SET_VIEW', payload: 'checkout' });
              }}>
              Proceed to Checkout
            </button>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>💳</span><span style={{ fontSize: 20 }}>🏦</span><span style={{ fontSize: 20 }}>📱</span>
              <span style={{ fontSize: 11, color: 'var(--text-light)' }}>Paystack • Flutterwave • Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
