import { useContext } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from './HairVisual.jsx';
import { fmt } from '../data.js';

export default function ProductCard({ product, compact = false }) {
  const { dispatch } = useContext(AppContext);

  return (
    <div
      className="card"
      style={{ cursor: 'pointer' }}
      onClick={() => dispatch({ type: 'SELECT_PRODUCT', payload: product })}
    >
      {/* Image area */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blush) 0%, var(--cream) 100%)',
        padding: compact ? '20px' : '32px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative',
      }}>
        <HairVisual image={product.image} size={compact ? 120 : 160} />
        {product.bestSeller && (
          <span className="badge badge-gold" style={{ position: 'absolute', top: 12, left: 12 }}>Best Seller</span>
        )}
        {!product.inStock && (
          <span className="badge badge-red" style={{ position: 'absolute', top: 12, right: 12 }}>Sold Out</span>
        )}
        {product.originalPrice && product.inStock && (
          <span className="badge" style={{ background: '#E8F5EE', color: '#2D7A51', position: 'absolute', top: 12, right: 12 }}>Sale</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: compact ? '14px 16px' : '18px 20px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{product.category}</div>
        <div style={{ fontFamily: 'Playfair Display', fontSize: compact ? 16 : 18, fontWeight: 700, color: 'var(--espresso)', marginBottom: 6 }}>{product.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 8 }}>{product.length} • {product.color}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: compact ? 15 : 17, color: 'var(--gold)' }}>{fmt(product.price)}</span>
            {product.originalPrice && (
              <span style={{ fontSize: 12, color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: 6 }}>{fmt(product.originalPrice)}</span>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>★ {product.rating} ({product.reviews})</span>
        </div>
        {!compact && (
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
            onClick={(e) => {
              e.stopPropagation();
              if (product.inStock) {
                dispatch({ type: 'ADD_TO_CART', payload: product });
                dispatch({ type: 'SET_TOAST', payload: { msg: `${product.name} added to cart!`, icon: '🛍️' } });
              }
            }}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  );
}
