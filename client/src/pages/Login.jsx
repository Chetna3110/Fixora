import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [lampOn, setLampOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // ── Role-based redirect
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'worker') navigate('/worker');
      else navigate('/dashboard');

    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
    setLoading(false);
  };

  const dark = lampOn;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: dark
        ? 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
        : 'linear-gradient(135deg, #e8edf5 0%, #f4f6fb 100%)',
      transition: 'background 0.6s ease',
      padding: '20px'
    }}>

      {/* Lamp glow */}
      {lampOn && (
        <div style={{
          position: 'fixed', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,200,80,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0, transition: 'opacity 0.6s ease'
        }} />
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: '48px',
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '860px',
        flexWrap: 'wrap', justifyContent: 'center'
      }}>

        {/* LAMP */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setLampOn(!lampOn)}>
          <div style={{
            width: '110px', height: '70px',
            background: lampOn
              ? 'linear-gradient(180deg, #d4a017, #f5c842)'
              : 'linear-gradient(180deg, #c8c8c8, #e8e8e8)',
            borderRadius: '50% 50% 0 0 / 60% 60% 0 0',
            boxShadow: lampOn
              ? '0 0 40px rgba(255,200,80,0.8), 0 0 80px rgba(255,200,80,0.4), 0 8px 20px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.5s ease',
            position: 'relative', display: 'flex',
            alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '6px'
          }}>
            {lampOn && (
              <div style={{
                position: 'absolute', bottom: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: '70px', height: '30px',
                background: 'rgba(255,240,150,0.6)',
                borderRadius: '50%', filter: 'blur(8px)'
              }} />
            )}
          </div>
          <div style={{
            width: '8px', height: '120px',
            background: lampOn
              ? 'linear-gradient(180deg, #b8860b, #8b6914)'
              : 'linear-gradient(180deg, #aaa, #888)',
            borderRadius: '4px', transition: 'all 0.5s ease',
            boxShadow: lampOn ? '0 0 8px rgba(255,200,80,0.3)' : 'none'
          }} />
          <div style={{
            width: '80px', height: '16px',
            background: lampOn
              ? 'linear-gradient(180deg, #b8860b, #7a5c0a)'
              : 'linear-gradient(180deg, #aaa, #777)',
            borderRadius: '8px', transition: 'all 0.5s ease',
            boxShadow: lampOn ? '0 0 20px rgba(255,200,80,0.4)' : '0 2px 6px rgba(0,0,0,0.2)'
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px' }}>
            <div style={{
              width: '1.5px', height: '30px',
              background: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
              transition: 'all 0.4s'
            }} />
            <div style={{
              width: '10px', height: '10px',
              background: lampOn ? '#f5c842' : '#aaa',
              borderRadius: '50%',
              boxShadow: lampOn ? '0 0 8px rgba(255,200,80,0.8)' : 'none',
              transition: 'all 0.4s'
            }} />
          </div>
          <p style={{
            marginTop: '10px', fontSize: '0.75rem',
            color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
            fontFamily: 'Outfit, sans-serif', transition: 'color 0.4s'
          }}>
            {lampOn ? '💡 Click to turn off' : '🌑 Click to turn on'}
          </p>
        </div>

        {/* LOGIN CARD */}
        <div style={{
          background: dark ? 'rgba(30,30,50,0.95)' : 'white',
          borderRadius: '18px', padding: '44px 40px',
          width: '100%', maxWidth: '400px',
          boxShadow: dark
            ? '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,200,80,0.1)'
            : '0 8px 40px rgba(0,0,0,0.1)',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
          transition: 'all 0.5s ease',
          animation: 'slideUp 0.5s ease forwards'
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
              <Logo size={36} />
              <span style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '1.8rem', fontWeight: 800,
                color: dark ? '#f5c842' : '#1a56db',
                transition: 'color 0.5s'
              }}>Fixora</span>
            </div>
            <p style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#6b7280', fontSize: '0.9rem', transition: 'color 0.5s' }}>
              Welcome back! Sign in to continue
            </p>
          </div>

          {/* Role badges — visual hint */}
          <div style={{
            display: 'flex', gap: '8px', justifyContent: 'center',
            marginBottom: '24px', flexWrap: 'wrap'
          }}>
            {[
              { role: 'Admin', icon: '👑', color: '#dc2626', bg: dark ? 'rgba(220,38,38,0.15)' : '#fef2f2', border: 'rgba(220,38,38,0.25)' },
              { role: 'Worker', icon: '🔧', color: '#d97706', bg: dark ? 'rgba(217,119,6,0.15)' : '#fffbeb', border: 'rgba(217,119,6,0.25)' },
              { role: 'User', icon: '👤', color: '#1a56db', bg: dark ? 'rgba(26,86,219,0.15)' : '#eff6ff', border: 'rgba(26,86,219,0.25)' },
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

          {/* Email */}
          <div className="form-group">
            <label style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#111928' }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '11px 14px',
                borderRadius: '8px', outline: 'none',
                fontFamily: 'Outfit, sans-serif', fontSize: '0.92rem',
                border: dark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e5e7eb',
                background: dark ? 'rgba(255,255,255,0.06)' : '#fafafa',
                color: dark ? 'white' : '#111928', transition: 'all 0.5s'
              }}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#111928' }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '11px 14px',
                borderRadius: '8px', outline: 'none',
                fontFamily: 'Outfit, sans-serif', fontSize: '0.92rem',
                border: dark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e5e7eb',
                background: dark ? 'rgba(255,255,255,0.06)' : '#fafafa',
                color: dark ? 'white' : '#111928', transition: 'all 0.5s'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              fontSize: '1rem', marginTop: '8px',
              borderRadius: '10px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontFamily: 'Outfit, sans-serif',
              background: dark
                ? 'linear-gradient(135deg, #f5c842, #e6a817)'
                : 'linear-gradient(135deg, #1a56db, #2563eb)',
              color: dark ? '#1a1a00' : 'white',
              boxShadow: dark
                ? '0 4px 15px rgba(245,200,66,0.4)'
                : '0 4px 12px rgba(26,86,219,0.3)',
              opacity: loading ? 0.75 : 1,
              transition: 'all 0.5s'
            }}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>

          {/* Role redirect info */}
          <div style={{
            marginTop: '16px', padding: '12px 14px',
            background: dark ? 'rgba(255,255,255,0.05)' : '#f8faff',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
            borderRadius: '8px', fontSize: '0.78rem',
            color: dark ? 'rgba(255,255,255,0.4)' : '#6b7280',
            lineHeight: 1.6
          }}>
            👑 Admin → Admin Panel &nbsp;·&nbsp; 🔧 Worker → Worker Dashboard &nbsp;·&nbsp; 👤 User → Dashboard
          </div>

          {message && <p className="alert-error" style={{ marginTop: '12px' }}>{message}</p>}

          <p style={{
            textAlign: 'center', marginTop: '20px',
            color: dark ? 'rgba(255,255,255,0.4)' : '#6b7280',
            fontSize: '0.88rem', transition: 'color 0.5s'
          }}>
            Don't have an account?{' '}
            <span onClick={() => navigate('/register')}
              style={{
                color: dark ? '#f5c842' : '#1a56db',
                cursor: 'pointer', fontWeight: 600, transition: 'color 0.5s'
              }}>
              Create one free
            </span>
          </p>

          <p style={{
            textAlign: 'center', marginTop: '14px', fontSize: '0.78rem',
            color: dark ? 'rgba(255,255,255,0.25)' : '#9ca3af',
            transition: 'color 0.5s'
          }}>
            🔒 Your data is safe and encrypted
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}