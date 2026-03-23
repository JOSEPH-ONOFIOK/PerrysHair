import { useContext, useState } from 'react';
import { AppContext } from '../context.jsx';
import { supabase } from '../supabase.js';

export default function ResetPasswordModal() {
  const { dispatch } = useContext(AppContext);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password: form.password });
    setLoading(false);

    if (err) { setError(err.message); return; }

    dispatch({ type: 'SET_TOAST', payload: { msg: 'Password updated! You can now sign in.', icon: '✅' } });
    dispatch({ type: 'SET_VIEW', payload: 'home' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 13, color: 'var(--gold)', marginBottom: 8 }}>✦ Perrys Hairline</div>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700 }}>Set New Password</h2>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginTop: 6 }}>Choose a strong password for your account</p>
        </div>
        <div style={{ padding: '24px 32px 32px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 0, fontSize: 16 }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 0, fontSize: 16 }}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #f5c6cb', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c0392b', marginBottom: 12, marginTop: 12 }}>
              {error}
            </div>
          )}
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '14px', fontSize: 15 }}
            onClick={handle} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
