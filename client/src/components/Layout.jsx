import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import Logo from '../Logo';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { icon: '📊', label: 'Dashboard', path: user?.role === 'worker' ? '/worker' : '/dashboard' },
    { icon: '🗺️', label: 'Live Map', path: '/map' },
    { icon: '📝', label: 'Report Issue', path: '/report' },
    { icon: '🏰', label: 'Guilds', path: '/guilds' },
    { icon: '📧', label: 'Contact', path: '/contact' },
    ...(user?.role === 'admin' ? [{ icon: '⚙️', label: 'Admin Panel', path: '/admin' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  const gold = '#c9a96e';
  const goldDim = 'rgba(201,169,110,0.2)';
  const goldBorder = 'rgba(201,169,110,0.18)';
  const cardBg = dark ? 'rgba(13,13,15,0.97)' : 'rgba(255,250,240,0.97)';
  const border = dark ? 'rgba(201,169,110,0.15)' : 'rgba(201,169,110,0.25)';
  const textColor = dark ? 'rgba(255,255,255,0.88)' : '#1a1208';
  const mutedColor = dark ? 'rgba(255,255,255,0.38)' : 'rgba(26,18,8,0.45)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: dark ? 'rgba(13,13,15,0.97)' : 'rgba(255,250,240,0.97)',
        borderBottom: `1px solid ${border}`,
        height: '62px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backdropFilter: 'blur(20px)',
        boxShadow: dark
          ? '0 1px 24px rgba(201,169,110,0.06)'
          : '0 1px 12px rgba(201,169,110,0.1)',
        transition: 'background 0.4s, border-color 0.4s'
      }}>

        {/* Left — hamburger + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: dark ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.1)',
              border: `1px solid ${border}`,
              borderRadius: '8px',
              width: '38px', height: '38px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '5px', cursor: 'pointer', padding: '8px',
              transition: 'all 0.2s'
            }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '18px', height: '1.5px',
                background: gold, borderRadius: '2px'
              }} />
            ))}
          </button>

          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              cursor: 'pointer',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.4rem', fontWeight: 600,
              color: gold, letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
            <Logo size={28} />
            Fixora
          </div>
        </div>

        {/* Right — theme toggle + profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={toggleTheme} style={{
            background: dark ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.1)',
            border: `1px solid ${border}`,
            borderRadius: '50px', padding: '6px 14px',
            cursor: 'pointer', fontSize: '0.78rem',
            color: gold, fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: '6px',
            letterSpacing: '0.05em', transition: 'all 0.3s'
          }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: dark ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.1)',
            border: `1px solid ${border}`,
            borderRadius: '50px', padding: '4px 14px 4px 4px',
            transition: 'all 0.3s'
          }}>
            <div style={{
              width: '30px', height: '30px',
              background: `linear-gradient(135deg, ${gold}, #a8833a)`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0d0d0f', fontWeight: 700, fontSize: '0.82rem'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontWeight: 500, fontSize: '0.85rem',
              color: gold, fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.03em'
            }}>
              {user?.name?.split(' ')[0]}
            </span>
          </div>
        </div>
      </nav>

      {/* ── SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* ── SIDEBAR PANEL ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', width: '270px',
        background: dark ? 'rgba(13,13,15,0.99)' : 'rgba(255,250,240,0.99)',
        borderRight: `1px solid ${border}`,
        zIndex: 2000,
        boxShadow: '4px 0 40px rgba(0,0,0,0.3)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        backdropFilter: 'blur(20px)'
      }}>

        {/* Sidebar Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          {/* Logo + name */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.25rem', fontWeight: 600,
            color: gold, letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            <Logo size={28} />
            Fixora
          </div>

          {/* Close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: dark ? 'rgba(201,169,110,0.08)' : 'rgba(201,169,110,0.1)',
              border: `1px solid ${border}`,
              borderRadius: '8px', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '0.9rem', color: mutedColor
            }}>✕</button>
        </div>

        {/* User Card */}
        <div style={{
          margin: '16px', padding: '16px',
          background: dark ? 'rgba(201,169,110,0.06)' : 'rgba(201,169,110,0.08)',
          border: `1px solid ${border}`,
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px',
              background: `linear-gradient(135deg, ${gold}, #a8833a)`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0d0d0f', fontWeight: 700, fontSize: '1rem'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{
                fontWeight: 600, color: textColor,
                fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif'
              }}>{user?.name}</div>
              <div style={{ color: mutedColor, fontSize: '0.78rem' }}>{user?.email}</div>
              <span style={{
                display: 'inline-block', marginTop: '4px',
                background: goldDim, color: gold,
                border: `1px solid ${goldBorder}`,
                fontSize: '0.65rem', fontWeight: 500,
                padding: '1px 8px', borderRadius: '50px',
                letterSpacing: '0.08em', textTransform: 'uppercase'
              }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ padding: '8px 12px', flex: 1 }}>
          <div style={{
            fontSize: '0.65rem', fontWeight: 400,
            color: mutedColor, textTransform: 'uppercase',
            letterSpacing: '0.18em', padding: '4px 8px 12px',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            Navigation
          </div>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                marginBottom: '3px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem',
                fontWeight: isActive(item.path) ? 500 : 300,
                background: isActive(item.path)
                  ? (dark ? 'rgba(201,169,110,0.12)' : 'rgba(201,169,110,0.1)')
                  : 'transparent',
                color: isActive(item.path) ? gold : textColor,
                borderLeft: isActive(item.path)
                  ? `2px solid ${gold}`
                  : '2px solid transparent',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(201,169,110,0.06)';
                  e.currentTarget.style.color = gold;
                }
              }}
              onMouseLeave={e => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = textColor;
                }
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
              {isActive(item.path) && (
                <span style={{
                  marginLeft: 'auto',
                  width: '5px', height: '5px',
                  borderRadius: '50%', background: gold
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Gold divider */}
        <div style={{
          margin: '0 20px 8px', height: '1px',
          background: `linear-gradient(90deg, ${gold}44, transparent)`
        }} />

        {/* Bottom — logout */}
        <div style={{ padding: '8px 12px 20px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 14px', borderRadius: '10px',
              border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.88rem', fontWeight: 300,
              background: 'transparent', color: '#e07070',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,112,112,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '1rem' }}>🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}