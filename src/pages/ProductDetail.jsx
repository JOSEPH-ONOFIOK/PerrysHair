import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from '../components/HairVisual.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { fmt } from '../data.js';
import { fetchReviews, upsertReview } from '../supabase.js';

function Stars({ rating, size = 16, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            fontSize: size, cursor: interactive ? 'pointer' : 'default',
            color: s <= (hovered || rating) ? 'var(--gold)' : '#ddd',
            transition: 'color 0.1s',
          }}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(s)}
        >★</span>
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { state, dispatch } = useContext(AppContext);
  const p = state.selectedProduct;
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const related = p
    ? state.products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3)
    : [];

  useEffect(() => {
    if (!p) return;
    setReviews([]);
    setMyRating(0);
    setMyReview('');
    setSubmitted(false);
    fetchReviews(p.id).then((data) => {
      setReviews(data);
      if (state.user?.id) {
        const mine = data.find((r) => r.user_id === state.user.id);
        if (mine) { setMyRating(mine.rating); setMyReview(mine.review || ''); setSubmitted(true); }
      }
    });
  }, [p?.id]);

  if (!p) return null;

  // Use live product from state so rating updates instantly
  const product = state.products.find((x) => x.id === p.id) || p;

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!myRating) return;
    setSubmitting(true);
    try {
      const result = await upsertReview(state.user.id, product.id, myRating, myReview, state.user.name);
      dispatch({ type: 'UPDATE_PRODUCT_RATING', payload: { id: product.id, avg: result.avg, count: result.count } });
      const updated = await fetchReviews(product.id);
      setReviews(updated);
      setSubmitted(true);
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Review submitted!', icon: '⭐' } });
    } catch {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Failed to submit review', icon: '❌' } });
    }
    setSubmitting(false);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>
        ← Back to Shop
      </button>

      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,5vw,48px)', alignItems: 'start' }}>
        {/* Image */}
        <div>
          <div style={{ background: 'linear-gradient(135deg, var(--blush), var(--cream))', borderRadius: 16, padding: 'clamp(24px,5vw,48px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <HairVisual image={product.image} size={240} />
            {product.bestSeller && <span className="badge badge-gold" style={{ position: 'absolute', top: 16, left: 16 }}>Best Seller</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {['Length', 'Color', 'Cap Size'].map((k, i) => (
              <div key={k} style={{ flex: 1, background: 'white', borderRadius: 8, padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{i === 0 ? product.length : i === 1 ? product.color : 'Medium'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{product.category}</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Stars rating={product.rating} size={18} />
            <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{product.rating > 0 ? product.rating.toFixed(1) : 'No ratings yet'} {product.reviews > 0 ? `(${product.reviews} review${product.reviews !== 1 ? 's' : ''})` : ''}</span>
          </div>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 700, color: 'var(--gold)' }}>{fmt(product.price)}</span>
            {product.originalPrice && (
              <>
                <span style={{ fontSize: 16, color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: 10 }}>{fmt(product.originalPrice)}</span>
                <span className="badge" style={{ background: '#E8F5EE', color: '#2D7A51', marginLeft: 10 }}>Save {fmt(product.originalPrice - product.price)}</span>
              </>
            )}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-mid)', marginBottom: 28 }}>{product.description}</p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '15px', fontSize: 15 }}
              disabled={!product.inStock}
              onClick={() => {
                dispatch({ type: 'ADD_TO_CART', payload: product });
                dispatch({ type: 'SET_TOAST', payload: { msg: 'Added to cart!', icon: '🛍️' } });
              }}>
              {product.inStock ? '🛍️ Add to Cart' : 'Out of Stock'}
            </button>
            <button className="btn-dark" style={{ padding: '15px 24px' }}
              onClick={() => {
                dispatch({ type: 'ADD_TO_CART', payload: product });
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

      {/* Reviews section */}
      <div style={{ marginTop: 60 }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 24 }}>
          Reviews {reviews.length > 0 && <span style={{ fontSize: 16, color: 'var(--text-light)', fontFamily: 'sans-serif', fontWeight: 400 }}>({reviews.length})</span>}
        </h2>

        {/* Write a review */}
        {state.user ? (
          <div className="card" style={{ padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              {submitted ? 'Your Review' : 'Write a Review'}
            </h3>
            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 6 }}>Your rating</div>
                <Stars rating={myRating} size={28} interactive onRate={setMyRating} />
              </div>
              <textarea
                className="input-field"
                placeholder="Share your experience with this product (optional)..."
                value={myReview}
                onChange={(e) => setMyReview(e.target.value)}
                rows={3}
                style={{ resize: 'vertical', marginBottom: 12 }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={!myRating || submitting}
                style={{ opacity: !myRating || submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Submitting...' : submitted ? 'Update Review' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 28, fontSize: 14, color: 'var(--text-mid)' }}>
            <button className="btn-outline" style={{ fontSize: 13, padding: '8px 18px' }}
              onClick={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'login' })}>
              Sign in
            </button>
            <span style={{ marginLeft: 10 }}>to leave a review</span>
          </div>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.reviewer_name || 'Verified Buyer'}</div>
                    <Stars rating={r.rating} size={14} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {r.review && <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 24 }}>You Might Also Love</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {related.map((x) => <ProductCard key={x.id} product={x} compact />)}
          </div>
        </div>
      )}
    </div>
  );
}
