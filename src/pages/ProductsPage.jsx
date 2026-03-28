import { useContext, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { AppContext } from '../context.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES } from '../data.js';

function StyledSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 180 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', padding: '11px 16px', background: 'white',
          border: `1.5px solid ${open ? 'var(--gold)' : 'var(--border)'}`,
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', fontSize: 14, color: value ? 'var(--text-dark)' : 'var(--text-light)',
          fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(201,151,58,0.15)' : 'none',
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--gold)', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
          background: 'white', border: '1.5px solid var(--border)', borderRadius: 10,
          boxShadow: '0 8px 32px rgba(180,60,100,0.13)', overflow: 'hidden',
          animation: 'dropdownIn 0.15s ease',
        }}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                width: '100%', padding: '10px 16px', background: o.value === value ? 'linear-gradient(90deg,var(--blush),var(--cream))' : 'white',
                border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14,
                color: o.value === value ? 'var(--gold-dark)' : 'var(--text-dark)',
                fontWeight: o.value === value ? 700 : 400,
                fontFamily: 'DM Sans, sans-serif',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.background = 'var(--warm-white)'; }}
              onMouseLeave={e => { if (o.value !== value) e.currentTarget.style.background = 'white'; }}
            >
              {o.value === value && <span style={{ marginRight: 8, color: 'var(--gold)' }}>✦</span>}
              {o.label}
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes dropdownIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}

export default function ProductsPage() {
  const { state, dispatch } = useContext(AppContext);
  const [cat, setCat] = useState(state.shopFilter || 'All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');

  // Sync when shopFilter changes (e.g. navigating from home style cards)
  useLayoutEffect(() => {
    if (state.shopFilter && state.shopFilter !== cat) {
      setCat(state.shopFilter);
      dispatch({ type: 'SET_SHOP_FILTER', payload: 'All' }); // reset after reading
    }
  }, [state.shopFilter]);

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));
  const sortOptions = [
    { value: 'default', label: 'Sort By' },
    { value: 'best',   label: '⭐ Best Sellers' },
    { value: 'low',    label: '↑ Price: Low → High' },
    { value: 'high',   label: '↓ Price: High → Low' },
    { value: 'rating', label: '★ Top Rated' },
  ];

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
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 260 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none' }}>🔍</span>
          <input
            className="input-field"
            placeholder="Search hair styles..."
            style={{ paddingLeft: 38 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <StyledSelect value={cat} onChange={setCat} options={categoryOptions} placeholder="All Categories" />
        <StyledSelect value={sort} onChange={setSort} options={sortOptions} placeholder="Sort By" />
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>{prods.length} product{prods.length !== 1 ? 's' : ''} found{cat !== 'All' ? ` in ${cat}` : ''}</div>

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 24 }}>
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
