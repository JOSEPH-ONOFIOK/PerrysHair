import { useContext, useState } from 'react';
import { AppContext } from '../context.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES } from '../data.js';

export default function ProductsPage() {
  const { state } = useContext(AppContext);
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');

  let prods = state.products.filter(
    (p) =>
      (cat === 'All' || p.category === cat) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );
  if (sort === 'best') prods = prods.filter((p) => p.bestSeller);
  else if (sort === 'low') prods = [...prods].sort((a, b) => a.price - b.price);
  else if (sort === 'high') prods = [...prods].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') prods = [...prods].sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Our Collection</h1>
        <p className="section-subtitle" style={{ marginTop: 6 }}>Premium human hair, handpicked for you</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        <input
          className="input-field"
          placeholder="🔍 Search hair styles..."
          style={{ maxWidth: 220 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map((c) => (
            <button key={c} className={`tab-btn${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <select className="input-field" style={{ maxWidth: 180 }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sort By</option>
          <option value="best">Best Sellers</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>{prods.length} products found</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 24 }}>
        {prods.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {prods.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20 }}>No results found</h3>
          <p style={{ marginTop: 8 }}>Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
