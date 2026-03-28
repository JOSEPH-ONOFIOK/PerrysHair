export default function SizeGuideModal({ onClose }) {
  const lengths = [
    { length: '8"',  cm: '~20cm',  desc: 'Above chin / pixie area' },
    { length: '10"', cm: '~25cm',  desc: 'Chin length' },
    { length: '12"', cm: '~30cm',  desc: 'Collar bone' },
    { length: '14"', cm: '~35cm',  desc: 'Bust / chest level' },
    { length: '16"', cm: '~40cm',  desc: 'Below bust' },
    { length: '18"', cm: '~45cm',  desc: 'Mid-waist' },
    { length: '20"', cm: '~50cm',  desc: 'Waist' },
    { length: '22"', cm: '~55cm',  desc: 'Just below waist' },
    { length: '24"', cm: '~60cm',  desc: 'Hip bone level' },
    { length: '26"', cm: '~65cm',  desc: 'Above knee' },
    { length: '28"', cm: '~70cm',  desc: 'Knee length' },
    { length: '30"', cm: '~76cm',  desc: 'Below knee' },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, margin: 0 }}>Hair Length Guide</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-light)', lineHeight: 1 }}>×</button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20, lineHeight: 1.6 }}>
          Hair lengths are measured when the hair is straight. Wavy and curly styles may appear shorter due to their natural pattern.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--blush)' }}>
              {['Length', 'Approx cm', 'On Body'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--espresso)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lengths.map((row, i) => (
              <tr key={row.length} style={{ background: i % 2 === 0 ? 'white' : 'var(--warm-white)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--gold)' }}>{row.length}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-mid)' }}>{row.cm}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-dark)' }}>{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(201,151,58,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>
          💡 <strong>Tip:</strong> When in doubt, size up — longer hair can always be trimmed, but shorter cannot be extended without a closure.
        </div>

        <button className="btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }} onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}
