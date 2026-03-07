import { useContext } from 'react';
import { AppContext } from '../context.jsx';
import ProductCard from '../components/ProductCard.jsx';
import HairVisual from '../components/HairVisual.jsx';
import { HAIR_PRODUCTS, fmt } from '../data.js';

const sections = [
  { name: 'Bobs', icon: '✂️', desc: 'Sharp & sophisticated cuts' },
  { name: 'Curly', icon: '🌀', desc: 'Natural curl magic' },
  { name: 'Bouncy', icon: '💫', desc: 'Full volume & life' },
  { name: 'Bone Straight', icon: '⚡', desc: 'Sleek & flawless' },
];

export default function HomePage() {
  const { dispatch } = useContext(AppContext);
  const recent = HAIR_PRODUCTS.slice(0, 4);
  const bestSellers = HAIR_PRODUCTS.filter((p) => p.bestSeller).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--espresso) 0%, var(--brown-mid) 50%, #2d1a08 100%)', minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(201,151,58,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: 20, display: 'inline-block' }}>Premium Hair Collection</span>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
              Crown Yourself<br /><em style={{ color: 'var(--gold-light)' }}>Every Day</em>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Discover Lagos's finest collection of 100% human hair wigs and extensions. From sleek bobs to goddess curls — your perfect hair awaits.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>Shop Collection</button>
              <button className="btn-outline" style={{ fontSize: 15, padding: '14px 32px', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>View Lookbook</button>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
              {[['500+', 'Happy Clients'], ['100%', 'Human Hair'], ['24hr', 'Fast Delivery']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: 'var(--gold-light)' }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(201,151,58,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {HAIR_PRODUCTS.slice(0, 4).map((p) => (
                <div key={p.id} className="card" style={{ background: 'linear-gradient(135deg, rgba(255,249,240,0.08), rgba(255,249,240,0.03))', border: '1px solid rgba(201,151,58,0.2)', cursor: 'pointer' }}
                  onClick={() => dispatch({ type: 'SELECT_PRODUCT', payload: p })}>
                  <HairVisual image={p.image} size={100} style={{ display: 'block', margin: '16px auto 8px' }} />
                  <div style={{ padding: '0 12px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gold-light)', marginTop: 2 }}>{fmt(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Style */}
      <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="section-title">Shop by Style</h2>
          <p className="section-subtitle" style={{ marginTop: 8 }}>Find your perfect hair aesthetic</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {sections.map((s) => (
            <div key={s.name} className="card" style={{ padding: '32px 24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border)' }}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{s.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)' }}>{s.desc}</p>
              <button className="btn-outline" style={{ marginTop: 16, fontSize: 12, padding: '8px 18px' }}>Explore</button>
            </div>
          ))}
        </div>
      </section>

      {/* New In */}
      <section style={{ padding: '40px 24px 60px', background: 'var(--warm-white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="section-title">New In Stock</h2>
              <p className="section-subtitle">Just arrived — get yours before they sell out</p>
            </div>
            <button className="btn-outline" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>View All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
            {recent.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="section-title">Best Sellers</h2>
              <p className="section-subtitle">Customer favourites, loved across Lagos & beyond</p>
            </div>
            <button className="btn-outline" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>Shop All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(28px, 4vw, 42px)', color: 'white', marginBottom: 12 }}>Not sure what to pick?</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 28 }}>Chat with our hair experts for personalised recommendations</p>
        <button className="btn-dark" style={{ fontSize: 15, padding: '14px 36px' }}>Get Expert Advice</button>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--espresso)', color: 'rgba(255,255,255,0.7)', padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 12 }}>✦ Perrys Hairline</div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>Premium human hair collection based in Lagos, Nigeria. Delivering beauty across Nigeria and worldwide.</p>
            </div>
            {[['Quick Links', 'Home', 'Shop', 'Cart', 'Orders'], ['Support', 'FAQ', 'Returns', 'Track Order', 'Contact'], ['Follow Us', 'Instagram', 'TikTok', 'WhatsApp', 'Twitter']].map(([title, ...items]) => (
              <div key={title}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--gold-light)', marginBottom: 12 }}>{title}</div>
                {items.map((i) => <div key={i} style={{ fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>{i}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12 }}>© 2025 Perrys Hairline. All rights reserved.</span>
            <span style={{ fontSize: 12 }}>Built with ❤️ for Lagos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
