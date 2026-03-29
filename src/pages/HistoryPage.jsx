import { useContext } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from '../components/HairVisual.jsx';
import BackButton from '../components/BackButton.jsx';



export default function HistoryPage() {
  const { state, dispatch } = useContext(AppContext);
  const { fmtPrice } = useCurrency();
  const { orders } = state;

  if (!state.user)
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 12 }}>Sign in to view your orders</h2>
        <button className="btn-primary" style={{ padding: '13px 32px' }}
          onClick={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'login' })}>Sign In</button>
      </div>
    );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <BackButton fallback="home" label="← Back" style={{ marginBottom: 16 }} />
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 30, marginBottom: 8 }}>Order History</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 32 }}>Track and manage all your Perrys Hairline orders</p>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p style={{ color: 'var(--text-light)' }}>No orders yet. Time to shop!</p>
          <button className="btn-primary" style={{ marginTop: 20 }}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>Shop Now</button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="card" style={{ padding: 22, marginBottom: 16, cursor: 'pointer' }}
            onClick={() => dispatch({ type: 'SELECT_ORDER', payload: order })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{order.id}</div>
                <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>
                  {order.date} • {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </div>
              </div>
              <span className={`badge ${order.status >= 5 ? 'badge-green' : 'badge-gold'}`}>{ORDER_STATUSES[order.status]}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {order.items.slice(0, 3).map((i) => (
                <div key={i.id} style={{ background: 'var(--blush)', borderRadius: 6, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HairVisual image={i.image} size={34} />
                </div>
              ))}
              <div style={{ flex: 1, textAlign: 'right' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--gold)' }}>{fmtPrice(order.total)}</span>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>View Details →</div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(order.status / (ORDER_STATUSES.length - 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
