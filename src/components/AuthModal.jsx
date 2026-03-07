import { useContext, useState } from 'react';
import { AppContext } from '../context.jsx';

export default function AuthModal() {
  const { state, dispatch } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const mode = state.authMode;

  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === 'forgot') {
        dispatch({ type: 'SET_TOAST', payload: { msg: 'Reset link sent to your email!', icon: '📧' } });
        dispatch({ type: 'SET_AUTH_MODE', payload: 'login' });
        return;
      }
      const user = {
        name: form.name || form.email.split('@')[0],
        email: form.email,
        isAdmin: form.email.includes('admin'),
      };
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_VIEW', payload: 'home' });
      dispatch({ type: 'SET_TOAST', payload: { msg: `Welcome${mode === 'signup' ? ' to Perrys Hairline' : ' back'}, ${user.name.split(' ')[0]}!`, icon: '✨' } });
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 13, color: 'var(--gold)', marginBottom: 8 }}>✦ Perrys Hairline</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700 }}>
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join the Family' : 'Reset Password'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginTop: 6 }}>
            {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Create your Perrys account' : "We'll send you a reset link"}
          </p>
        </div>
        <div style={{ padding: '24px 32px 32px' }}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input className="input-field" placeholder="Your full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Email Address</label>
            <input className="input-field" type="email" placeholder="yourname@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          {mode !== 'forgot' && (
            <div style={{ marginBottom: mode === 'signup' ? 16 : 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />
            </div>
          )}
          {mode === 'signup' && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Confirm Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
            </div>
          )}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: 'var(--gold)', cursor: 'pointer' }}
                onClick={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'forgot' })}>
                Forgot password?
              </span>
            </div>
          )}
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: '14px', fontSize: 15 }}
            onClick={handle} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-light)' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <span style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'signup' })}>Sign up</span>
              </>
            ) : (
              <>Already have an account?{' '}
                <span style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => dispatch({ type: 'SET_AUTH_MODE', payload: 'login' })}>Sign in</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
