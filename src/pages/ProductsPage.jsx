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
  const [page, setPage] = useState(1);
  const PER_PAGE = 14;

  // Sync when shopFilter changes (e.g. navigating from home style cards)
  useLayoutEffect(() => {
    if (state.shopFilter && state.shopFilter !== cat) {
      setCat(state.shopFilter);
      setPage(1);
      dispatch({ type: 'SET_SHOP_FILTER', payload: 'All' });
    }
  }, [state.shopFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [cat, sort, search]);

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));
  const sortOptions = [
    { value: 'default', label: 'Sort By' },
    { value: 'best',   label: '⭐ Best Sellers' },
    { value: 'low',    label: '↑ Price: Low → High' },
    { value: 'high',   label: '↓ Price: High → Low' },
    { value: 'rating', label: '★ Top Rated' },
  ];

  let allProds = state.products.filter(
    (p) =>
      (cat === 'All' || p.category === cat) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );
  if (sort === 'best') allProds = allProds.filter((p) => p.bestSeller);
  else if (sort === 'low') allProds = [...allProds].sort((a, b) => a.price - b.price);
  else if (sort === 'high') allProds = [...allProds].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') allProds = [...allProds].sort((a, b) => b.rating - a.rating);

  const totalPages = Math.ceil(allProds.length / PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const prods = allProds.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

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

      <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
        {allProds.length} product{allProds.length !== 1 ? 's' : ''} found{cat !== 'All' ? ` in ${cat}` : ''}
        {totalPages > 1 && <span style={{ marginLeft: 8 }}>· Page {safePage} of {totalPages}</span>}
      </div>

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 24 }}>
        {prods.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            disabled={safePage === 1}
            style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'white', color: safePage === 1 ? 'var(--text-light)' : 'var(--text-dark)', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, opacity: safePage === 1 ? 0.5 : 1 }}
          >← Prev</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              style={{ width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${n === safePage ? 'var(--gold)' : 'var(--border)'}`, background: n === safePage ? 'var(--gold)' : 'white', color: n === safePage ? 'white' : 'var(--text-dark)', cursor: 'pointer', fontWeight: n === safePage ? 700 : 400, fontSize: 14, transition: 'all 0.15s' }}
            >{n}</button>
          ))}

          <button
            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            disabled={safePage === totalPages}
            style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'white', color: safePage === totalPages ? 'var(--text-light)' : 'var(--text-dark)', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, opacity: safePage === totalPages ? 0.5 : 1 }}
          >Next →</button>
        </div>
      )}

      {allProds.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20 }}>No results found</h3>
          <p style={{ marginTop: 8 }}>Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
