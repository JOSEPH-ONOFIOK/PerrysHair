import { useContext } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from '../components/HairVisual.jsx';
import { ORDER_STATUSES } from '../data.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function OrderTracking() {
  const { state, dispatch } = useContext(AppContext);
  const { fmtPrice } = useCurrency();
  const order = state.selectedOrder;
  if (!order) return null;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'history' })}>
        ← Back to Orders
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700 }}>Order #{order.id}</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 14, marginTop: 4 }}>
            Placed on {order.date} • {order.delivery === 'lagos' ? 'Lagos Delivery' : order.delivery === 'nigeria' ? 'Nigeria Delivery' : 'International (DHL)'}
          </p>
        </div>
        <span className={`badge ${order.status >= 5 ? 'badge-green' : 'badge-gold'}`}>{ORDER_STATUSES[order.status]}</span>
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17, marginBottom: 24 }}>Live Order Progress</h3>
        <div className="order-timeline">
          {ORDER_STATUSES.map((s, i) => (
            <div key={s} className={`order-step${i <= order.status ? ' done' : ''}`}>
              <div className={`step-dot${i < order.status ? ' done' : i === order.status ? ' active' : ''}`}>
                {i < order.status ? '✓' : i + 1}
              </div>
              <div className="step-info">
                <div style={{ fontWeight: 600, fontSize: 14, color: i <= order.status ? 'var(--text-dark)' : 'var(--text-light)' }}>{s}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                  {i === 0 ? order.date : i <= order.status ? 'Completed' : 'Pending'}
                  {i === order.status && ' • In Progress'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {order.tracking && (
          <div style={{ marginTop: 20, background: 'var(--warm-white)', borderRadius: 8, padding: 14, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Tracking Number</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{order.tracking}</div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17, marginBottom: 16 }}>Items in this Order</h3>
        {order.items.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
            <div style={{ background: 'var(--blush)', borderRadius: 8, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HairVisual image={item.image} size={44} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{item.category} • {item.length}</div>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{fmtPrice(item.price * (item.qty || 1))}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, paddingTop: 4 }}>
          <span>Total Paid</span>
          <span style={{ color: 'var(--gold)' }}>{fmtPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
