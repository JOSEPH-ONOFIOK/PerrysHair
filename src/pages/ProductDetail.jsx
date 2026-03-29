import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context.jsx';
import HairVisual from '../components/HairVisual.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ShareButton from '../components/ShareButton.jsx';
import SizeGuideModal from '../components/SizeGuideModal.jsx';
import { useCurrency } from '../hooks/useCurrency.js';
import BackButton from '../components/BackButton.jsx';
import { fetchReviews, upsertReview, subscribeToStockNotification } from '../supabase.js';

function Stars({ rating, size = 16, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 2 }} role={interactive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          tabIndex={interactive ? 0 : -1}
          role={interactive ? 'radio' : undefined}
          aria-label={`${i} star`}
          aria-checked={interactive ? i === rating : undefined}
          style={{
            fontSize: size, cursor: interactive ? 'pointer' : 'default',
            color: i <= (hovered || rating) ? 'var(--gold)' : '#ddd',
            transition: 'color 0.1s',
          }}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(i)}
          onKeyDown={(e) => {
            if (!interactive) return;
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRate?.(i); }
            if (e.key === 'ArrowRight') { e.preventDefault(); onRate?.(Math.min(5, i + 1)); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); onRate?.(Math.max(1, i - 1)); }
          }}
        >★</span>
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { state, dispatch } = useContext(AppContext);
  const { fmtPrice } = useCurrency();
  const p = state.selectedProduct;
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [notified, setNotified] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [capSize, setCapSize] = useState(null);

  const related = p
    ? state.products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3)
    : [];

  useEffect(() => {
    if (!p) return;
    dispatch({ type: 'ADD_RECENTLY_VIEWED', payload: p });
    setReviews([]);
    setMyRating(0);
    setMyReview('');
    setSubmitted(false);
    setReviewsLoading(true);
    fetchReviews(p.id).then((data) => {
      setReviews(data);
      setReviewsLoading(false);
      if (state.user?.id) {
        const mine = data.find((r) => r.user_id === state.user.id);
        if (mine) { setMyRating(mine.rating); setMyReview(mine.review || ''); setSubmitted(true); }
      }
    }).catch(() => setReviewsLoading(false));
  }, [p?.id]);

  if (!p) return null;

  // Use live product from state so rating updates instantly
  const product = state.products.find((x) => x.id === p.id) || p;

  async function handleNotifyMe() {
    if (!state.user) { dispatch({ type: 'SET_AUTH_MODE', payload: 'login' }); return; }
    setNotifying(true);
    try {
      await subscribeToStockNotification(state.user.id, product.id, state.user.email);
      setNotified(true);
      dispatch({ type: 'SET_TOAST', payload: { msg: "We'll email you when it's back in stock!", icon: '🔔' } });
    } catch {
      dispatch({ type: 'SET_TOAST', payload: { msg: 'Could not save notification', icon: '❌' } });
    }
    setNotifying(false);
  }

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
      <BackButton fallback="products" label="← Back to Shop" style={{ marginBottom: 24 }} />

      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,5vw,48px)', alignItems: 'start' }}>
        {/* Image */}
        <div>
          <div
            onClick={() => setLightbox(true)}
            style={{ background: 'linear-gradient(135deg, var(--blush), var(--cream))', borderRadius: 16, padding: 'clamp(24px,5vw,48px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', cursor: 'zoom-in', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <HairVisual image={product.image} size={240} />
            {product.bestSeller && <span className="badge badge-gold" style={{ position: 'absolute', top: 16, left: 16 }}>Best Seller</span>}
            {!product.bestSeller && product.sellingFast && <span className="badge" style={{ background: '#fff0f0', color: '#c0392b', position: 'absolute', top: 16, left: 16 }}>Selling Fast 🔥</span>}
            <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.35)', color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 11, pointerEvents: 'none' }}>🔍 Click to preview</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {[
              ['Length', product.length],
              ['Color', product.color],
              product.texture ? ['Texture', product.texture] : ['Cap Size', 'Medium'],
            ].map(([k, v]) => (
              <div key={k} style={{ flex: 1, background: 'white', borderRadius: 8, padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{v}</div>
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
            <span style={{ fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 700, color: 'var(--gold)' }}>{fmtPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span style={{ fontSize: 16, color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: 10 }}>{fmtPrice(product.originalPrice)}</span>
                <span className="badge" style={{ background: '#E8F5EE', color: '#2D7A51', marginLeft: 10 }}>Save {fmtPrice(product.originalPrice - product.price)}</span>
              </>
            )}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-mid)', marginBottom: product.qualityTags?.length ? 16 : 28 }}>{product.description}</p>

          {product.qualityTags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {product.qualityTags.map((tag) => (
                <span key={tag} style={{ fontSize: 12, fontWeight: 600, color: '#2D7A51', background: '#E8F5EE', border: '1px solid #b7dfca', borderRadius: 20, padding: '4px 12px' }}>✓ {tag}</span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <ShareButton product={product} />
            <button
              onClick={() => setSizeGuide(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: capSize ? 'linear-gradient(90deg,var(--blush),var(--cream))' : 'var(--warm-white)', color: capSize ? 'var(--gold-dark)' : 'var(--text-mid)', border: `1.5px solid ${capSize ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              📏 {capSize ? `Cap: ${capSize}` : 'Size Guide'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ flex: 1, minWidth: 140, justifyContent: 'center', padding: '15px', fontSize: 15, background: product.inStock ? undefined : 'var(--text-light)' }}
              onClick={() => {
                dispatch({ type: 'ADD_TO_CART', payload: product });
                dispatch({ type: 'SET_TOAST', payload: { msg: product.inStock ? 'Added to cart!' : 'Saved — checkout when it restocks!', icon: product.inStock ? '🛍️' : '🔔' } });
              }}>
              {product.inStock ? '🛍️ Add to Cart' : '🛍️ Save to Cart'}
            </button>
            <button className="btn-dark" style={{ padding: '15px 24px', opacity: product.inStock ? 1 : 0.5, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
              disabled={!product.inStock}
              onClick={() => {
                dispatch({ type: 'ADD_TO_CART', payload: product });
                dispatch({ type: 'SET_VIEW', payload: 'checkout' });
              }}>
              Buy Now
            </button>
          </div>
          {!product.inStock && (
            <button
              onClick={handleNotifyMe}
              disabled={notified || notifying}
              style={{ width: '100%', marginBottom: 16, padding: '12px', background: notified ? '#E8F5EE' : 'var(--warm-white)', border: `1.5px solid ${notified ? '#2D7A51' : 'var(--border)'}`, borderRadius: 8, color: notified ? '#2D7A51' : 'var(--text-mid)', fontWeight: 600, fontSize: 14, cursor: notified ? 'default' : 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' }}
            >
              {notified ? '✅ You\'ll be notified when it\'s back!' : notifying ? 'Saving...' : '🔔 Notify me when back in stock'}
            </button>
          )}
          <a
            href={`https://api.whatsapp.com/send/?phone=2349025373225&text=${encodeURIComponent(`Hi, I'd like to ask about... ${product.name}`)}&type=phone_number&app_absent=0`}
            target="_blank"
            rel="noopener noreferrer"
            className="wa-pulse"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', background: '#25D366', color: 'white', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none', marginBottom: 28, boxSizing: 'border-box' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contact for more enquiry
          </a>

          <div style={{ background: 'var(--warm-white)', borderRadius: 10, padding: 20, border: '1px solid var(--border)' }}>
            {[
              ['🚀', 'Fast Delivery', '2 working days after hair is ready'],
              ['🔄', 'Easy Returns', '48Hrs hassle-free returns'],
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
        {reviewsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
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

      {/* Full-screen Image Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', animation: 'fadeIn 0.2s ease' }}
        >
          <button
            onClick={() => setLightbox(false)}
            style={{ position: 'fixed', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: 44, height: 44, fontSize: 22, cursor: 'pointer', lineHeight: 1, zIndex: 1001 }}
          >×</button>
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            {product.image?.startsWith('http') ? (
              <img
                src={product.image}
                alt={product.name}
                style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
              />
            ) : (
              <div style={{ background: 'linear-gradient(135deg, var(--blush), var(--cream))', borderRadius: 20, padding: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HairVisual image={product.image} size={420} />
              </div>
            )}
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes scaleIn { from { transform: scale(0.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          `}</style>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 24 }}>You Might Also Love</h2>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {related.map((x) => <ProductCard key={x.id} product={x} compact />)}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {state.recentlyViewed.filter((x) => x.id !== product.id).length > 0 && (
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 24 }}>Recently Viewed</h2>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {state.recentlyViewed.filter((x) => x.id !== product.id).slice(0, 4).map((x) => (
              <ProductCard key={x.id} product={state.products.find((p) => p.id === x.id) || x} compact />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuide && <SizeGuideModal onClose={() => setSizeGuide(false)} selectedCapSize={capSize} onSelectCapSize={setCapSize} />}
    </div>
  );
}
