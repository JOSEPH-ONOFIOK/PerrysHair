import { useContext } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from '../components/HairVisual.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { HAIR_PRODUCTS, fmt } from '../data.js';

export default function ProductDetail() {
  const { state, dispatch } = useContext(AppContext);
  const p = state.selectedProduct;
  if (!p) return null;

  const related = HAIR_PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>
        ← Back to Shop
      </button>

      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        {/* Image */}
        <div>
          <div style={{ background: 'linear-gradient(135deg, var(--blush), var(--cream))', borderRadius: 16, padding: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <HairVisual image={p.image} size={240} />
            {p.bestSeller && <span className="badge badge-gold" style={{ position: 'absolute', top: 16, left: 16 }}>Best Seller</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {['Length', 'Color', 'Cap Size'].map((k, i) => (
              <div key={k} style={{ flex: 1, background: 'white', borderRadius: 8, padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{i === 0 ? p.length : i === 1 ? p.color : 'Medium'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{p.category}</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>{p.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ color: 'var(--gold)', fontSize: 16 }}>{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.ceil(p.rating))}</span>
            <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{p.rating} ({p.reviews} reviews)</span>
          </div>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 700, color: 'var(--gold)' }}>{fmt(p.price)}</span>
            {p.originalPrice && (
              <>
                <span style={{ fontSize: 16, color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: 10 }}>{fmt(p.originalPrice)}</span>
                <span className="badge" style={{ background: '#E8F5EE', color: '#2D7A51', marginLeft: 10 }}>Save {fmt(p.originalPrice - p.price)}</span>
              </>
            )}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-mid)', marginBottom: 28 }}>{p.description}</p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '15px', fontSize: 15 }}
              disabled={!p.inStock}
              onClick={() => {
                dispatch({ type: 'ADD_TO_CART', payload: p });
                dispatch({ type: 'SET_TOAST', payload: { msg: 'Added to cart!', icon: '🛍️' } });
              }}>
              {p.inStock ? '🛍️ Add to Cart' : 'Out of Stock'}
            </button>
            <button className="btn-dark" style={{ padding: '15px 24px' }}
              onClick={() => {
                dispatch({ type: 'ADD_TO_CART', payload: p });
                dispatch({ type: 'SET_VIEW', payload: 'checkout' });
              }}>
              Buy Now
            </button>
          </div>

          <div style={{ background: 'var(--warm-white)', borderRadius: 10, padding: 20, border: '1px solid var(--border)' }}>
            {[
              ['🚀', 'Fast Delivery', 'Lagos: Same Day | Nigeria: 1-3 days'],
              ['🔄', 'Easy Returns', '7-day hassle-free returns'],
              ['✅', 'Authentic Hair', '100% human hair guarantee'],
              ['📦', 'Secure Packaging', 'Every order professionally packed'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 24 }}>You Might Also Love</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {related.map((p) => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </div>
      )}
    </div>
  );
}
