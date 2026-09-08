import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'worker') navigate('/worker');
      else navigate('/dashboard');

    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#ffffff'
    }}>

      {/* LEFT — Branding panel */}
      <div style={{
        flex: '1 1 45%',
        background: 'linear-gradient(160deg, #1f7a4d 0%, #2f9e63 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px', color: 'white',
        position: 'relative', overflow: 'hidden',
        minHeight: '340px'
      }}
      className="auth-side-panel">
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '320px', height: '320px',
          background: 'rgba(255,255,255,0.06)', borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-60px',
          width: '260px', height: '260px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <Logo size={36} />
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.5rem', fontWeight: 800 }}>Fixora</span>
          </div>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '2.1rem', fontWeight: 800,
            lineHeight: 1.2, marginBottom: '16px'
          }}>
            Welcome back to your civic dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '36px' }}>
            Sign in to track reported issues, follow their progress, and stay connected with your community.
          </p>

          {[
            { icon: '📊', text: 'Real-time issue tracking' },
            { icon: '🗺️', text: 'Live citywide map view' },
            { icon: '🔔', text: 'Instant status notifications' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '34px', height: '34px', flexShrink: 0,
                background: 'rgba(255,255,255,0.15)', borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
              }}>{f.icon}</div>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div style={{
        flex: '1 1 55%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '1.6rem', fontWeight: 800, color: '#172420', marginBottom: '6px'
            }}>
              Sign in
            </h2>
            <p style={{ color: '#64766c', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <span onClick={() => navigate('/register')} style={{ color: '#2f9e63', fontWeight: 600, cursor: 'pointer' }}>
                Create one free
              </span>
            </p>
          </div>

          {/* Role badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              { role: 'Admin', icon: '👑', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
              { role: 'Worker', icon: '🔧', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              { role: 'Citizen', icon: '👤', color: '#2f9e63', bg: '#eefaf3', border: '#cdeedb' },
            ].map(r => (
              <div key={r.role} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: r.bg, border: `1px solid ${r.border}`,
                borderRadius: '50px', padding: '4px 12px',
                fontSize: '0.75rem', fontWeight: 600, color: r.color
              }}>
                {r.icon} {r.role}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '8px', borderRadius: '10px' }}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>

          <div style={{
            marginTop: '16px', padding: '12px 14px',
            background: '#f8faf9', border: '1px solid #e6ece8',
            borderRadius: '8px', fontSize: '0.78rem',
            color: '#64766c', lineHeight: 1.6
          }}>
            👑 Admin → Admin Panel &nbsp;·&nbsp; 🔧 Worker → Worker Dashboard &nbsp;·&nbsp; 👤 Citizen → Dashboard
          </div>

          {message && <p className="alert-error" style={{ marginTop: '12px' }}>{message}</p>}

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: '#9aa8a1' }}>
            🔒 Your data is safe and encrypted
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .auth-side-panel { display: none; }
        }
      `}</style>
    </div>
  );
}