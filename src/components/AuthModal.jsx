import { useContext, useState } from 'react';
import { AppContext } from '../context.jsx';
import { signIn, signUp, supabase } from '../supabase.js';
import { sendWelcomeEmail } from '../email.js';

export default function AuthModal() {
  const { state, dispatch } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const mode = state.authMode;

  const handle = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'forgot') {
        // Generate reset link via Supabase, then send via our Nodemailer
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin });
        if (resetErr) throw new Error(resetErr.message);
        dispatch({ type: 'SET_TOAST', payload: { msg: 'Reset link sent to your email!', icon: '📧' } });
        dispatch({ type: 'SET_AUTH_MODE', payload: 'login' });
      } else if (mode === 'signup') {
        if (form.password !== form.confirm) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const data = await signUp(form.email, form.password, form.name);
        if (data.session) {
          // Email confirmation is OFF — user is logged in immediately
          sendWelcomeEmail(form.name, form.email); // fire-and-forget
          dispatch({ type: 'SET_VIEW', payload: 'home' });
          dispatch({ type: 'SET_TOAST', payload: { msg: `Welcome to Perrys Hairline${form.name ? ', ' + form.name : ''}!`, icon: '🌸' } });
        } else {
          // Email confirmation is ON — show check inbox screen
          localStorage.setItem('perrys_awaiting_confirm', '1');
          dispatch({ type: 'SET_AUTH_MODE', payload: 'confirm-sent' });
        }
      } else {
        await signIn(form.email, form.password);
        // Auth listener in context.jsx handles SET_USER
        dispatch({ type: 'SET_VIEW', payload: 'home' });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (mode === 'confirm-sent') {
    return (
      <div className="modal-overlay" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📧</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Check your inbox</h2>
          <p style={{ color: 'var(--text-light)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
            We sent a confirmation link to
          </p>
          <p style={{ fontWeight: 700, color: 'var(--espresso)', fontSize: 15, marginBottom: 20 }}>{form.email}</p>
          <p style={{ color: 'var(--text-light)', fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
            Click the link in your email to complete your registration. Check your spam folder if you don't see it.
          </p>
          <button className="btn-primary" style={{ justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 0, fontSize: 16 }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}
          {mode === 'signup' && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 0, fontSize: 16 }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
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
          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #f5c6cb', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c0392b', marginBottom: 12 }}>
              {error}
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
