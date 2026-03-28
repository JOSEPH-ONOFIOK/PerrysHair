import { useState } from 'react';
import { useCurrency } from '../hooks/useCurrency.js';

export const REGIONS = [
  { flag: '🇳🇬', country: 'Nigeria',       code: 'NGN', symbol: '₦',   label: 'Nigerian Naira' },
  { flag: '🇺🇸', country: 'United States', code: 'USD', symbol: '$',   label: 'US Dollar' },
  { flag: '🇬🇧', country: 'United Kingdom',code: 'GBP', symbol: '£',   label: 'British Pound' },
  { flag: '🇪🇺', country: 'Europe',        code: 'EUR', symbol: '€',   label: 'Euro' },
  { flag: '🇬🇭', country: 'Ghana',         code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi' },
  { flag: '🇿🇦', country: 'South Africa',  code: 'ZAR', symbol: 'R',   label: 'South African Rand' },
  { flag: '🇨🇦', country: 'Canada',        code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { flag: '🇦🇺', country: 'Australia',     code: 'AUD', symbol: 'A$',  label: 'Australian Dollar' },
];

export default function RegionModal({ onClose }) {
  const { setCurrency } = useCurrency();
  const [selected, setSelected] = useState(null);

  const confirm = () => {
    if (!selected) return;
    setCurrency(selected);
    try { localStorage.setItem('perrys_currency', JSON.stringify(selected)); } catch {}
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: 32,
        maxWidth: 480, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        animation: 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌍</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, margin: '0 0 6px' }}>Select Your Region</h2>
          <p style={{ fontSize: 14, color: 'var(--text-light)', margin: 0 }}>
            Prices will be shown in your local currency
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {REGIONS.map((r) => (
            <button
              key={r.code}
              onClick={() => setSelected(r)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${selected?.code === r.code ? 'var(--gold)' : 'var(--border)'}`,
                background: selected?.code === r.code ? 'rgba(201,151,58,0.06)' : 'white',
                transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseEnter={(e) => { if (selected?.code !== r.code) e.currentTarget.style.borderColor = 'var(--blush-dark)'; }}
              onMouseLeave={(e) => { if (selected?.code !== r.code) e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>{r.flag}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--espresso)' }}>{r.country}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{r.symbol} {r.code}</div>
              </div>
              {selected?.code === r.code && (
                <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: 14 }}>✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={confirm}
          disabled={!selected}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, opacity: selected ? 1 : 0.5 }}
        >
          {selected ? `Continue with ${selected.symbol} ${selected.code}` : 'Select a region'}
        </button>

        <button
          onClick={() => {
            const ngn = REGIONS[0];
            setCurrency(ngn);
            try { localStorage.setItem('perrys_currency', JSON.stringify(ngn)); } catch {}
            onClose();
          }}
          style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', fontSize: 13, color: 'var(--text-light)', cursor: 'pointer', padding: 8 }}
        >
          Skip — show prices in ₦ NGN
        </button>
      </div>
      <style>{`@keyframes scaleIn { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
    </div>
  );
}
