const TESTIMONIALS = [
  { name: 'Adaeze O.', location: 'Lagos', rating: 5, text: "I ordered the Super Double Drawn and it arrived the same day! The hair is so full and silky — I've been getting compliments everywhere.", avatar: '👩🏾' },
  { name: 'Funke A.', location: 'Abuja', rating: 5, text: "Perry's is my go-to for all my hair needs. The quality is unmatched and the customer service is 10/10. Already on my 3rd order!", avatar: '👩🏾‍🦱' },
  { name: 'Chioma N.', location: 'Port Harcourt', rating: 5, text: "The Bone Straight hair looks exactly like the photos. Zero shedding after 3 weeks of wearing it. Highly recommend!", avatar: '👩🏿' },
  { name: 'Blessing E.', location: 'Enugu', rating: 5, text: "Fast delivery to Enugu, great packaging, and the hair is absolutely gorgeous. You won't regret shopping here!", avatar: '👩🏾‍🦲' },
  { name: 'Temi F.', location: 'Ibadan', rating: 5, text: "Single Donor raw hair — absolutely premium! It blends so naturally. I've tried many vendors but Perry's stands out.", avatar: '👩🏽' },
  { name: 'Ngozi K.', location: 'Lagos', rating: 5, text: "The Indonesia hair is stunning. Soft, tangle-free, and lasts so long. Worth every penny — this is real quality!", avatar: '👩🏿‍🦱' },
];

export default function SocialProofSection() {
  return (
    <section style={{ padding: '60px 24px', background: 'var(--cream)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="section-title reveal">What Our Customers Say</h2>
          <p className="section-subtitle reveal" style={{ marginTop: 8 }}>
            Join thousands of women who trust Perry's Hairline
          </p>
          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { num: '20,000+', label: 'Happy Customers' },
              { num: '4.9★',   label: 'Average Rating' },
              { num: '100%',   label: 'Human Hair' },
              { num: '48hrs after hair is ready',    label: 'Lagos Delivery' },
            ].map(({ num, label }) => (
              <div key={label} className="reveal" style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>{num}</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="card reveal"
              style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ display: 'flex', gap: 2, color: '#f4b942', fontSize: 16 }}>
                {'★'.repeat(t.rating)}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                <span style={{ fontSize: 28 }}>{t.avatar}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--espresso)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
