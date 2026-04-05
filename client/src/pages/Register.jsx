import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import CityBackground from '../CityBackground';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setMessage('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      setMessage('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
    setLoading(false);
  };

  const roles = [
    {
      key: 'user',
      label: 'Citizen',
    },
    {
      key: 'worker',
      label: 'Worker',
    },
    {
      key: 'admin',
      label: 'Admin',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'transparent' }}>
      <CityBackground />

      <div style={{
        position: 'relative', zIndex: 10,
        background: 'white', borderRadius: '16px',
        padding: '44px 40px', width: '100%', maxWidth: '440px',
        margin: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        animation: 'slideUp 0.5s ease forwards', border: '1px solid #e5e7eb'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <Logo size={38} />
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#1a56db' }}>
              Fixora
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Create your free account today</p>
        </div>

        {/* Name */}
        <div className="form-group">
          <label>Full Name</label>
          <input className="form-input" placeholder="John Doe"
            value={form.name}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email Address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters"
            value={form.password}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>

        {/* Role Selector */}
        <div className="form-group">
          <label>I am a</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '6px' }}>
            {roles.map(r => (
              <button key={r.key} onClick={() => setForm({ ...form, role: r.key })}
                style={{
                  padding: '14px 8px', borderRadius: '12px',
                  border: '2px solid',
                  borderColor: form.role === r.key ? '#1a56db' : '#e5e7eb',
                  background: form.role === r.key ? '#eff6ff' : 'white',
                  color: form.role === r.key ? '#1a56db' : '#6b7280',
                  fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '5px'
                }}>
                <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{r.label}</span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 400,
                  color: form.role === r.key ? '#3b82f6' : '#9ca3af',
                  lineHeight: 1.3, textAlign: 'center'
                }}>
                  {r.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected role info */}
        <div style={{
          padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
          background: form.role === 'admin' ? '#fef2f2' : form.role === 'worker' ? '#fffbeb' : '#eff6ff',
          border: `1px solid ${form.role === 'admin' ? 'rgba(220,38,38,0.2)' : form.role === 'worker' ? 'rgba(217,119,6,0.2)' : 'rgba(26,86,219,0.2)'}`,
          fontSize: '0.8rem',
          color: form.role === 'admin' ? '#dc2626' : form.role === 'worker' ? '#d97706' : '#1a56db',
          fontWeight: 500
        }}>
          {form.role === 'admin' && 'Admin: Full access — manage issues, workers, and messages'}
          {form.role === 'worker' && ' Worker: Get assigned to issues and update their progress'}
          {form.role === 'user' && ' Citizen: Report issues, upvote, comment and track your city'}
        </div>

        <button className="btn btn-primary" onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '4px', borderRadius: '10px', opacity: loading ? 0.75 : 1 }}>
          {loading ? '⏳ Creating...' : 'Create Account →'}
        </button>

        {message && (
          <p className={message.includes('created') ? 'alert-success' : 'alert-error'} style={{ marginTop: '12px' }}>
            {message}
          </p>
        )}

        <p className="form-link" style={{ marginTop: '20px' }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Sign in</span>
        </p>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: '#9ca3af' }}>
          🔒 Your data is safe and encrypted
        </p>
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