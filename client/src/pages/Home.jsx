import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../Logo';
import { useTheme } from '../ThemeContext';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { dark, toggleTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Logo size={34} />
          Fixora
        </div>
        <div className="navbar-links">
          {/* 🌙 Theme Toggle */}
          <button onClick={toggleTheme} style={{
            background: dark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
            border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb',
            borderRadius: '50px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: dark ? 'rgba(255,255,255,0.85)' : '#374151',
            fontFamily: 'Outfit, sans-serif',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.3s'
          }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>

          {user ? (
            <>
              <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
              <button className="nav-link" onClick={() => navigate('/report')}>Report Issue</button>
              {user.role === 'admin' && (
                <button className="nav-link" onClick={() => navigate('/admin')}>Admin Panel</button>
              )}
              <div className="profile-dropdown">
                <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  {user.name.split(' ')[0]} ▾
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--card-border)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{user.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user.email}</div>
                      <div style={{ marginTop: '4px' }}>
                        <span className="badge" style={{ background: '#eff6ff', color: '#1a56db', fontSize: '0.75rem' }}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button className="dropdown-item" onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}>📊 My Dashboard</button>
                    <button className="dropdown-item" onClick={() => { navigate('/report'); setDropdownOpen(false); }}>📝 Report Issue</button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Sign Up Free</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">🏆 Civic Tech Platform of the Year</div>
          <h1>Your City.<br />Your Voice.<br />Your Fix.</h1>
          <p>Report local issues, track their resolution, and hold authorities accountable. Together we build better cities.</p>
          <div className="hero-buttons">
            {user ? (
              <>
                <button className="btn btn-white btn-lg" onClick={() => navigate('/report')}>📝 Report an Issue</button>
                <button className="btn btn-white-outline btn-lg" onClick={() => navigate('/dashboard')}>View Dashboard</button>
              </>
            ) : (
              <>
                <button className="btn btn-white btn-lg" onClick={() => navigate('/register')}>Get Started — Free</button>
                <button className="btn btn-white-outline btn-lg" onClick={() => navigate('/login')}>Login to Dashboard</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        {[
          { value: '12,400+', label: 'Issues Reported' },
          { value: '9,800+', label: 'Issues Resolved' },
          { value: '34,000+', label: 'Active Citizens' },
          { value: '98%', label: 'Satisfaction Rate' },
        ].map(s => (
          <div className="stat-item" key={s.label}>
            <h2>{s.value}</h2>
            <p>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="features">
        <div className="section-label">HOW IT WORKS</div>
        <h2>Simple. Transparent. Effective.</h2>
        <p className="features-subtitle">Everything you need to make your city better</p>
        <div className="features-grid">
          {[
            { icon: '📸', title: 'Report an Issue', desc: 'Upload a photo, select a category, and pin the exact location on the map in under 60 seconds.' },
            { icon: '📊', title: 'Track Progress', desc: 'Get real-time updates as authorities acknowledge and resolve your reported issues.' },
            { icon: '👍', title: 'Community Upvotes', desc: 'Support issues reported by others to help prioritize what your community cares about most.' },
            { icon: '🗺️', title: 'Live Map View', desc: 'See all reported issues in your area on an interactive real-time map.' },
            { icon: '🔔', title: 'Instant Notifications', desc: 'Receive notifications the moment your issue status changes or gets resolved.' },
            { icon: '⚙️', title: 'Admin Dashboard', desc: 'Authorities get powerful tools to manage, prioritize and resolve issues efficiently.' },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
        © 2026 <span>Fixora</span>. Built for citizens, by citizens. All rights reserved.
         <br></br><button className="nav-link" onClick={() => navigate('/contact')}>Contact us</button>

      </footer>
    </div>
  );
}