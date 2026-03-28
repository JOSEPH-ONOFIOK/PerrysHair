import { useContext, useState } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from './HairVisual.jsx';
import { fmt } from '../data.js';

export default function ProductCard({ product, compact = false }) {
  const { dispatch } = useContext(AppContext);
  const [clicking, setClicking] = useState(false);

  const handleClick = () => {
    setClicking(true);
    setTimeout(() => setClicking(false), 250);
    dispatch({ type: 'SELECT_PRODUCT', payload: product });
  };

  return (
    <div
      className={`card card-glow${clicking ? ' card-click' : ''}`}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
      onClick={handleClick}
    >
      {/* Image area — fixed height */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blush) 0%, var(--cream) 100%)',
        height: compact ? 140 : 200,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative', flexShrink: 0,
      }}>
        <HairVisual image={product.image} size={compact ? 100 : 140} />
        {product.bestSeller && (
          <span className="badge badge-gold" style={{ position: 'absolute', top: 10, left: 10, fontSize: 10 }}>Best Seller</span>
        )}
        {!product.bestSeller && product.sellingFast && (
          <span className="badge" style={{ background: '#fff0f0', color: '#c0392b', position: 'absolute', top: 10, left: 10, fontSize: 10 }}>Selling Fast</span>
        )}
        {!product.inStock && (
          <span className="badge badge-red" style={{ position: 'absolute', top: 10, right: 10, fontSize: 10 }}>Out of Stock</span>
        )}
        {product.inStock && product.stock <= 5 && (
          <span className="badge" style={{ background: '#FFF3CD', color: '#856404', position: 'absolute', top: 10, right: 10, fontSize: 10 }}>Only {product.stock} left</span>
        )}
        {product.originalPrice && product.inStock && product.stock > 5 && (
          <span className="badge" style={{ background: '#E8F5EE', color: '#2D7A51', position: 'absolute', top: 10, right: 10, fontSize: 10 }}>Sale</span>
        )}
      </div>

      {/* Info — fills remaining height, pushes button to bottom */}
      <div style={{ padding: compact ? '12px 14px' : '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{product.category}</div>
        <div style={{
          fontFamily: 'Playfair Display', fontSize: compact ? 14 : 16, fontWeight: 700,
          color: 'var(--espresso)', marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          lineHeight: 1.3, minHeight: compact ? '2.6em' : '2.6em',
        }}>{product.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.length} • {product.color}</div>

        {/* Price + rating pushed to bottom */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: compact ? 0 : 10 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: compact ? 14 : 16, color: 'var(--gold)' }}>{fmt(product.price)}</span>
              {product.originalPrice && (
                <span style={{ fontSize: 11, color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: 5 }}>{fmt(product.originalPrice)}</span>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-light)' }}>★ {product.rating} ({product.reviews})</span>
          </div>
          {!compact && (
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', background: product.inStock ? undefined : 'var(--text-light)' }}
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'ADD_TO_CART', payload: product });
                dispatch({ type: 'SET_TOAST', payload: { msg: product.inStock ? `${product.name} added to cart!` : `${product.name} saved — we'll notify you when it's back!`, icon: product.inStock ? '🛍️' : '🔔' } });
              }}
            >
              {product.inStock ? 'Add to Cart' : 'Save for Later'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
