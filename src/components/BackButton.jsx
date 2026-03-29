import { useContext } from 'react';
import { AppContext } from '../context.jsx';

export default function BackButton({ fallback = 'home', label = '← Back', style = {} }) {
  const { dispatch } = useContext(AppContext);

  const handleBack = () => {
    // If there's real browser history to go back to, use it
    if (window.history.length > 1) {
      window.history.back();
    } else {
      dispatch({ type: 'SET_VIEW', payload: fallback });
    }
  };

  return (
    <button
      onClick={handleBack}
      style={{
        background: 'none', border: 'none',
        color: 'var(--text-light)', fontSize: 14,
        cursor: 'pointer', display: 'inline-flex',
        alignItems: 'center', gap: 6, padding: '4px 0',
        fontFamily: 'DM Sans, sans-serif',
        ...style,
      }}
    >
      {label}
    </button>
  );
}
