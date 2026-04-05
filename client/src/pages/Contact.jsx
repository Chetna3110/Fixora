import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { useTheme } from '../ThemeContext';


export default function Contact() {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dark } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const handleSubmit = async () => {
    if (!form.subject || !form.message) {
      setStatus('error:Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/contact', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('success:Message sent! We will get back to you soon.');
      setForm({ subject: '', message: '' });
    } catch (err) {
      setStatus('error:' + (err.response?.data?.message || 'Something went wrong'));
    }
    setLoading(false);
  };

  const isSuccess = status.startsWith('success:');
  const statusMsg = status.split(':').slice(1).join(':');

  return (
    <div>
      <Navbar user={user} />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1a56db 55%, #2563eb 100%)',
        padding: '60px 48px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '300px', height: '300px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', padding: '5px 16px', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px'
          }}>
            📧 Contact Us
          </div>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '2.4rem', fontWeight: 800,
            color: 'white', marginBottom: '12px', letterSpacing: '-0.5px'
          }}>
            Get in Touch
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7 }}>
            Have a question, suggestion, or need help? Send us a message and our team will respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ maxWidth: '900px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: '28px',
          marginTop: '8px'
        }}>

          {/* Left — Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* User Info Card */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '14px', padding: '22px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <h3 style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                color: 'var(--text)', fontWeight: 700,
                marginBottom: '16px', fontSize: '0.95rem'
              }}>
                👤 Sending as
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: 'linear-gradient(135deg, #1a56db, #2563eb)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1.1rem'
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{user?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {[
              { icon: '⚡', title: 'Quick Response', desc: 'We typically respond within 24 hours on working days' },
              { icon: '🔒', title: 'Safe & Secure', desc: 'Your message is private and only visible to our admin team' },
              { icon: '🐛', title: 'Report a Bug', desc: 'Found something broken? Let us know and we\'ll fix it fast' },
              { icon: '💡', title: 'Suggest a Feature', desc: 'Have an idea to make Fixora better? We\'d love to hear it' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px', padding: '18px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex', gap: '14px', alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  background: dark ? 'rgba(26,86,219,0.2)' : '#eff6ff',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '3px' }}>
                    {item.title}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — Message Form */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px', padding: '32px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h2 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '1.3rem', fontWeight: 800,
              color: 'var(--text)', marginBottom: '6px'
            }}>
              Send a Message
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Fill in the form below and we'll get back to you shortly.
            </p>

            {/* Subject */}
            <div className="form-group">
              <label>Subject</label>
              <select
                className="form-input"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}>
                <option value="">Select a subject...</option>
                <option>🐛 Report a Bug</option>
                <option>💡 Feature Request</option>
                <option>❓ General Question</option>
                <option>⚠️ Issue Not Being Resolved</option>
                <option>👤 Account Problem</option>
                <option>📋 Other</option>
              </select>
            </div>

            {/* Message */}
            <div className="form-group">
              <label>Message</label>
              <textarea
                className="form-input"
                placeholder="Describe your issue or question in detail..."
                rows={7}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ resize: 'vertical', minHeight: '140px' }}
              />
            </div>

            {/* Character count */}
            <div style={{
              textAlign: 'right', fontSize: '0.78rem',
              color: form.message.length > 800 ? '#dc2626' : 'var(--text-faint)',
              marginTop: '-10px', marginBottom: '16px'
            }}>
              {form.message.length}/1000
            </div>

            {/* Status Message */}
            {status && (
              <div style={{
                padding: '12px 16px', borderRadius: '8px',
                marginBottom: '16px', fontWeight: 600, fontSize: '0.88rem',
                background: isSuccess ? '#f0fdf4' : '#fef2f2',
                color: isSuccess ? '#16a34a' : '#dc2626',
                border: `1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}`
              }}>
                {isSuccess ? '✅' : '❌'} {statusMsg}
              </div>
            )}

            {/* Submit */}
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || form.message.length > 1000}
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', borderRadius: '10px' }}>
              {loading ? '⏳ Sending...' : '📤 Send Message'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-faint)' }}>
              🔒 Your message is private and secure
            </p>
          </div>
        </div>
      </div>

      <footer className="footer">
        © 2026 <span>Fixora</span>. Built for citizens, by citizens.
      </footer>
    </div>
  );
}