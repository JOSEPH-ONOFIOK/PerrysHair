import { useContext } from 'react';
import { AppContext } from '../context.jsx';
import ProductCard from '../components/ProductCard.jsx';
import HairVisual from '../components/HairVisual.jsx';
import { HAIR_PRODUCTS, fmt } from '../data.js';

const BobIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 64 }}>
    <path d="M11 26C11 13 20 4 32 4C44 4 53 13 53 26V41C53 43.2 51.2 45 49 45H15C12.8 45 11 43.2 11 41V26Z" fill="var(--brown-mid)" />
    <ellipse cx="32" cy="38" rx="13" ry="15" fill="var(--blush)" />
    <ellipse cx="27" cy="35" rx="1.8" ry="2.2" fill="var(--espresso)" opacity="0.45" />
    <ellipse cx="37" cy="35" rx="1.8" ry="2.2" fill="var(--espresso)" opacity="0.45" />
    <path d="M28 42Q32 45 36 42" stroke="var(--espresso)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
    <line x1="11" y1="45" x2="53" y2="45" stroke="var(--brown-mid)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const CurlyIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 64 }}>
    <path d="M5 30C5 15 17 3 32 3C47 3 59 15 59 30C59 45 50 58 40 59Q36 61 32 61Q28 61 24 59C14 58 5 45 5 30Z" fill="var(--brown-mid)" />
    <ellipse cx="32" cy="44" rx="12" ry="14" fill="var(--blush)" />
    <path d="M13 22C13 22 17 17 21 22C21 22 25 27 21 31" stroke="var(--blush)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />
    <path d="M43 15C43 15 47 10 51 15C51 15 55 20 51 25" stroke="var(--blush)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />
    <path d="M19 40C19 40 23 36 27 40" stroke="var(--blush)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />
    <path d="M37 40C37 40 41 36 45 40" stroke="var(--blush)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />
  </svg>
);

const BouncyIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 64 }}>
    <ellipse cx="32" cy="22" rx="26" ry="20" fill="var(--brown-mid)" />
    <path d="M6 28C9 36 16 42 16 42C18 46 24 50 32 50C40 50 46 46 48 42C48 42 55 36 58 28" stroke="var(--brown-mid)" strokeWidth="5" strokeLinecap="round" fill="none" />
    <ellipse cx="32" cy="42" rx="12" ry="14" fill="var(--blush)" />
    <ellipse cx="27" cy="40" rx="1.8" ry="2.2" fill="var(--espresso)" opacity="0.45" />
    <ellipse cx="37" cy="40" rx="1.8" ry="2.2" fill="var(--espresso)" opacity="0.45" />
    <path d="M28 47Q32 50 36 47" stroke="var(--espresso)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
  </svg>
);

const BoneStraightIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 64 }}>
    <path d="M20 6L10 62H22L28 26" fill="var(--brown-mid)" />
    <path d="M44 6L54 62H42L36 26" fill="var(--brown-mid)" />
    <path d="M20 6Q32 2 44 6L36 26Q32 22 28 26Z" fill="var(--brown-mid)" />
    <ellipse cx="32" cy="30" rx="13" ry="15" fill="var(--blush)" />
    <ellipse cx="27" cy="27" rx="1.8" ry="2.2" fill="var(--espresso)" opacity="0.45" />
    <ellipse cx="37" cy="27" rx="1.8" ry="2.2" fill="var(--espresso)" opacity="0.45" />
    <path d="M28 35Q32 38 36 35" stroke="var(--espresso)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
    <line x1="31" y1="6" x2="31" y2="26" stroke="var(--blush)" strokeWidth="1.5" opacity="0.5" />
  </svg>
);

const sections = [
  { name: 'Bobs', icon: <BobIcon />, desc: 'Sharp & sophisticated cuts' },
  { name: 'Curly', icon: <CurlyIcon />, desc: 'Natural curl magic' },
  { name: 'Bouncy', icon: <BouncyIcon />, desc: 'Full volume & life' },
  { name: 'Bone Straight', icon: <BoneStraightIcon />, desc: 'Sleek & flawless' },
];

export default function HomePage() {
  const { dispatch } = useContext(AppContext);
  const recent = HAIR_PRODUCTS.slice(0, 4);
  const bestSellers = HAIR_PRODUCTS.filter((p) => p.bestSeller).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--espresso) 0%, var(--brown-mid) 50%, #2d1a08 100%)', minHeight: '80vh', display: 'flex', alignItems: 'center', padding: 'clamp(40px,8vw,80px) clamp(16px,5vw,24px)', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-orb" style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,151,58,0.18) 0%, transparent 70%)', top: '50%', left: '60%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span className="badge badge-gold hero-badge" style={{ marginBottom: 20, display: 'inline-block' }}>Premium Hair Collection</span>
            <h1 className="hero-title" style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
              Crown Yourself<br /><em className="text-shimmer">Every Day</em>
            </h1>
            <p className="hero-desc" style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Discover Lagos's finest collection of 100% human hair wigs and extensions. From sleek bobs to goddess curls your perfect hair awaits.
            </p>
            <div className="hero-cta-btns hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>Shop Collection</button>
              <button className="btn-outline" style={{ fontSize: 15, padding: '14px 32px', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>View Lookbook</button>
            </div>
            <div className="hero-stats" style={{ display: 'flex', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
              {[['20,000+', 'Happy Clients'], ['100%', 'Human Hair'], ['Easy Tracking', 'Order Status']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: 'var(--gold-light)' }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hide-mobile hero-products" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
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
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="section-title">Shop by Style</h2>
          <p className="section-subtitle" style={{ marginTop: 8 }}>Find your perfect hair aesthetic</p>
        </div>
        <div className="style-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {sections.map((s, i) => (
            <div key={s.name} className={`card card-glow reveal stagger-${i + 1}`} style={{ padding: '32px 24px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border)' }}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>
              <div className="float-anim" style={{ fontSize: 36, marginBottom: 12, display: 'inline-block', animationDelay: `${i * 0.4}s` }}>{s.icon}</div>
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
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="section-title">New In Stock</h2>
              <p className="section-subtitle">Just arrived — get yours before they sell out</p>
            </div>
            <button className="btn-outline" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>View All</button>
          </div>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
            {recent.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="section-title">Best Sellers</h2>
              <p className="section-subtitle">Customer favourites, loved across Lagos & beyond</p>
            </div>
            <button className="btn-outline" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'products' })}>Shop All</button>
          </div>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(28px, 4vw, 42px)', color: 'white', marginBottom: 12 }}>Not sure what to pick?</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 28 }}>Chat with our hair experts for personalised recommendations</p>
        <a href="https://api.whatsapp.com/send/?phone=2349025373225&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button className="btn-dark" style={{ fontSize: 15, padding: '14px 36px' }}>Get Expert Advice</button>
        </a>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--espresso)', color: 'rgba(255,255,255,0.7)', padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 12 }}>✦ Perrys Hairline</div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>Premium human hair collection based in Lagos, Nigeria. Delivering beauty across Nigeria and worldwide.</p>
            </div>
            {[['Quick Links', 'Home', 'Shop', 'Cart', 'Orders'], ['Support', 'FAQ', 'Returns', 'Track Order', 'Contact']].map(([title, ...items]) => (
              <div key={title}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--gold-light)', marginBottom: 12 }}>{title}</div>
                {items.map((i) => <div key={i} style={{ fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>{i}</div>)}
              </div>
            ))}
            <div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--gold-light)', marginBottom: 12 }}>Follow Us</div>
              <a href="https://www.instagram.com/perrys_hairline" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, marginBottom: 8, display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                Instagram
              </a>
              <a href="https://www.tiktok.com/@perrys_hairline" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, marginBottom: 8, display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                TikTok
              </a>
              <a href="https://api.whatsapp.com/send/?phone=2349025373225&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, marginBottom: 8, display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                WhatsApp
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12 }}>© 2025 Perrys Hairline. All rights reserved.</span>
            <span style={{ fontSize: 12 }}>Built by Dextercodes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
