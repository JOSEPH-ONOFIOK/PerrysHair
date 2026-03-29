import { useState } from 'react';

export default function ShareButton({ product }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href; // includes ?product=ID
    const text = `Check out ${product.name} on Perry's Hairline`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={share}
      title="Share this product"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: copied ? '#e8f5ee' : 'var(--warm-white)',
        color: copied ? '#2D7A51' : 'var(--text-mid)',
        border: `1.5px solid ${copied ? '#2D7A51' : 'var(--border)'}`,
        borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer',
        fontWeight: 600, transition: 'all 0.2s',
      }}
    >
      {copied ? '✅ Link Copied!' : '🔗 Share'}
    </button>
  );
}
