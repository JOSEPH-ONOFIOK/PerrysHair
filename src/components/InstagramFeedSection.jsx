// Placeholder Instagram grid — replace POSTS with real images from your Supabase bucket
const POSTS = [
  { id: 1, emoji: '💆🏾‍♀️', caption: 'Bone Straight Goals', likes: 312 },
  { id: 2, emoji: '🌟',     caption: 'Super Double Drawn',  likes: 489 },
  { id: 3, emoji: '💫',     caption: 'Raw Donor Hair',      likes: 277 },
  { id: 4, emoji: '👸🏾',   caption: 'Indonesia Silk',      likes: 540 },
  { id: 5, emoji: '✨',     caption: 'Curly Glam',          likes: 203 },
  { id: 6, emoji: '🔥',     caption: 'Fresh Install',       likes: 418 },
];

const IG_HANDLE = '@perrys_hairline';
const IG_URL = 'https://www.instagram.com/perrys_hairline/';

export default function InstagramFeedSection() {
  return (
    <section style={{ padding: '60px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 className="section-title reveal">As Seen On Instagram</h2>
          <p className="section-subtitle reveal" style={{ marginTop: 8 }}>
            Follow us{' '}
            <a href={IG_URL} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none' }}>
              {IG_HANDLE}
            </a>{' '}
            for daily hair inspo
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {POSTS.map((post) => (
            <a
              key={post.id}
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal"
              style={{
                display: 'block', aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--blush), var(--cream))',
                textDecoration: 'none', position: 'relative',
              }}
            >
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 40 }}>{post.emoji}</span>
                <span style={{ fontSize: 11, color: 'var(--text-mid)', fontWeight: 600, textAlign: 'center', padding: '0 8px' }}>{post.caption}</span>
              </div>
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
              >
                <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>❤️ {post.likes}</span>
                <span style={{ color: 'white', fontSize: 11 }}>View on Instagram</span>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <a href={IG_URL} target="_blank" rel="noopener noreferrer"
            className="btn-outline reveal"
            style={{ display: 'inline-flex', padding: '12px 28px', fontWeight: 700, textDecoration: 'none', borderRadius: 8 }}>
            Follow on Instagram ↗
          </a>
        </div>
      </div>
    </section>
  );
}
