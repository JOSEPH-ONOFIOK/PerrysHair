import { useContext } from 'react';
import { AppContext } from '../context.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function WishlistPage() {
  const { state, dispatch } = useContext(AppContext);
  const { wishlist } = state;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">My Wishlist</h1>
        <p className="section-subtitle" style={{ marginTop: 6 }}>
          {wishlist.length > 0 ? `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved` : 'Your wishlist is empty'}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🤍</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 8 }}>Nothing saved yet</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>Browse our collection and tap the heart to save your favourites.</p>
          <button className="btn-primary" style={{ padding: '13px 32px' }}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>
            Browse Shop
          </button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <button
              onClick={() => {
                wishlist.forEach((p) => dispatch({ type: 'ADD_TO_CART', payload: p }));
                dispatch({ type: 'SET_TOAST', payload: { msg: 'All wishlist items added to cart!', icon: '🛍️' } });
              }}
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: 14 }}
            >
              Add All to Cart
            </button>
          </div>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 24 }}>
            {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
