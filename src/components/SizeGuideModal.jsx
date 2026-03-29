import { useState } from 'react';

export default function SizeGuideModal({ onClose, onSelectCapSize, selectedCapSize }) {
  const [pickedCap, setPickedCap] = useState(selectedCapSize || null);

  const lengths = [
    { length: '6"',  cm: '~15cm',  desc: 'Very short / buzz area' },
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
    { length: '32"', cm: '~81cm',  desc: 'Lower shin' },
    { length: '34"', cm: '~86cm',  desc: 'Ankle length' },
    { length: '36"', cm: '~91cm',  desc: 'Floor length' },
  ];

  const capSizes = [
    { size: 'Petite (Small)', inches: '21 – 21.5"', cm: '51 – 54 cm' },
    { size: 'Average (Medium)', inches: '22 – 22.5"', cm: '54 – 57 cm' },
    { size: 'Large', inches: '23 – 23.5"', cm: '57 – 60 cm' },
  ];

  const handleConfirm = () => {
    if (onSelectCapSize && pickedCap) onSelectCapSize(pickedCap);
    onClose();
  };

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

        {/* Cap Size Picker */}
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 16, marginTop: 28, marginBottom: 8, color: 'var(--espresso)' }}>Select Your Cap Size</h3>
        <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 14, lineHeight: 1.6 }}>
          Measure around your head at the hairline with a soft tape measure.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {capSizes.map((cap) => {
            const active = pickedCap === cap.size;
            return (
              <button
                key={cap.size}
                onClick={() => setPickedCap(cap.size)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                  background: active ? 'linear-gradient(90deg,var(--blush),var(--cream))' : 'white',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: active ? 'var(--gold-dark)' : 'var(--text-dark)' }}>{cap.size}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{cap.inches} &nbsp;·&nbsp; {cap.cm}</div>
                </div>
                {active && <span style={{ fontSize: 18, color: 'var(--gold)' }}>✦</span>}
              </button>
            );
          })}
        </div>

        {pickedCap && (
          <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(201,151,58,0.1)', borderRadius: 8, fontSize: 13, color: 'var(--gold-dark)', fontWeight: 600 }}>
            ✓ Selected: {pickedCap}
          </div>
        )}

        <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(201,151,58,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6 }}>
          💡 <strong>Tip:</strong> Most wigs fit Average (Medium) and have adjustable straps. If between sizes, size up for comfort.
        </div>

        <button
          className="btn-primary"
          style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
          onClick={handleConfirm}
        >
          {pickedCap ? `Confirm – ${pickedCap}` : 'Got it!'}
        </button>
      </div>
    </div>
  );
}
