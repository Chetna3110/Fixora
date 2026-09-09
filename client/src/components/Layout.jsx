import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../themeContext';
import Logo from '../Logo';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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
    { icon: '👤', label: 'My Profile', path: '/profile' },
    { icon: '📧', label: 'Contact', path: '/contact' },
    ...(user?.role === 'admin' ? [{ icon: '⚙️', label: 'Admin Panel', path: '/admin' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  const green = '#2f9e63';
  const greenDark = '#1f7a4d';
  const greenDim = 'rgba(47,158,99,0.15)';
  const greenBorder = 'rgba(47,158,99,0.18)';
  const cardBg = dark ? 'rgba(14,21,18,0.97)' : 'rgba(255,255,255,0.97)';
  const border = dark ? 'rgba(47,158,99,0.2)' : 'rgba(47,158,99,0.15)';
  const textColor = dark ? 'rgba(233,243,238,0.9)' : '#172420';
  const mutedColor = dark ? 'rgba(233,243,238,0.4)' : 'rgba(23,36,32,0.45)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: dark ? 'rgba(14,21,18,0.97)' : 'rgba(255,255,255,0.97)',
        borderBottom: `1px solid ${border}`,
        height: '62px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backdropFilter: 'blur(20px)',
        boxShadow: dark
          ? '0 1px 24px rgba(47,158,99,0.06)'
          : '0 1px 12px rgba(47,158,99,0.06)',
        transition: 'background 0.4s, border-color 0.4s'
      }}>

        {/* Left — hamburger + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: dark ? 'rgba(47,158,99,0.1)' : 'rgba(47,158,99,0.08)',
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
                background: green, borderRadius: '2px'
              }} />
            ))}
          </button>

          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '1.3rem', fontWeight: 800,
              color: greenDark, letterSpacing: '0.01em'
            }}>
            <Logo size={28} />
            Fixora
          </div>
        </div>

        {/* Right — theme toggle + profile dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <button onClick={toggleTheme} style={{
            background: dark ? 'rgba(47,158,99,0.1)' : 'rgba(47,158,99,0.08)',
            border: `1px solid ${border}`,
            borderRadius: '50px', padding: '6px 14px',
            cursor: 'pointer', fontSize: '0.78rem',
            color: greenDark, fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: '6px',
            letterSpacing: '0.02em', transition: 'all 0.3s'
          }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Profile button — click to open dropdown */}
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: dark ? 'rgba(47,158,99,0.1)' : 'rgba(47,158,99,0.08)',
              border: `1px solid ${border}`,
              borderRadius: '50px', padding: '4px 14px 4px 4px',
              transition: 'all 0.3s', cursor: 'pointer'
            }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0,
              background: `linear-gradient(135deg, ${green}, ${greenDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.82rem'
            }}>
              {user?.profileImage
                ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontWeight: 600, fontSize: '0.85rem',
              color: greenDark, fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.01em'
            }}>
              {user?.name?.split(' ')[0]} ▾
            </span>
          </button>

          {/* Dropdown */}
          {profileDropdownOpen && (
            <>
              <div
                onClick={() => setProfileDropdownOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 998 }}
              />
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: cardBg, border: `1px solid ${border}`,
                borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                minWidth: '230px', overflow: 'hidden', zIndex: 999,
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{
                  padding: '16px 18px', borderBottom: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0,
                    background: `linear-gradient(135deg, ${green}, ${greenDark})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1rem'
                  }}>
                    {user?.profileImage
                      ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.name}
                    </div>
                    <div style={{ color: mutedColor, fontSize: '0.76rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </div>
                    <span style={{
                      display: 'inline-block', marginTop: '4px',
                      background: greenDim, color: greenDark,
                      border: `1px solid ${greenBorder}`,
                      fontSize: '0.62rem', fontWeight: 700,
                      padding: '1px 8px', borderRadius: '50px',
                      letterSpacing: '0.06em', textTransform: 'uppercase'
                    }}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { navigate('/profile'); setProfileDropdownOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 18px', background: 'none', border: 'none',
                    fontSize: '0.88rem', color: textColor, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                  👤 View Full Profile
                </button>
                <button
                  onClick={() => { navigate(user?.role === 'worker' ? '/worker' : '/dashboard'); setProfileDropdownOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 18px', background: 'none', border: 'none',
                    fontSize: '0.88rem', color: textColor, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                  📊 My Dashboard
                </button>
                <div style={{ height: '1px', background: border }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '11px 18px', background: 'none', border: 'none',
                    fontSize: '0.88rem', color: '#dc2626', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                  🚪 Logout
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* ── SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1999,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* ── SIDEBAR PANEL ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', width: '270px',
        background: dark ? 'rgba(14,21,18,0.99)' : 'rgba(255,255,255,0.99)',
        borderRight: `1px solid ${border}`,
        zIndex: 2000,
        boxShadow: '4px 0 40px rgba(0,0,0,0.15)',
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
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '1.15rem', fontWeight: 800,
            color: greenDark, letterSpacing: '0.01em'
          }}>
            <Logo size={28} />
            Fixora
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: dark ? 'rgba(47,158,99,0.1)' : 'rgba(47,158,99,0.08)',
              border: `1px solid ${border}`,
              borderRadius: '8px', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '0.9rem', color: mutedColor
            }}>✕</button>
        </div>

        {/* User Card */}
        <div
          onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
          style={{
            margin: '16px', padding: '16px',
            background: dark ? 'rgba(47,158,99,0.08)' : 'rgba(47,158,99,0.06)',
            border: `1px solid ${border}`,
            borderRadius: '12px', cursor: 'pointer'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0,
              background: `linear-gradient(135deg, ${green}, ${greenDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '1rem'
            }}>
              {user?.profileImage
                ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{
                fontWeight: 600, color: textColor,
                fontSize: '0.92rem', fontFamily: 'DM Sans, sans-serif'
              }}>{user?.name}</div>
              <div style={{ color: mutedColor, fontSize: '0.78rem' }}>{user?.email}</div>
              <span style={{
                display: 'inline-block', marginTop: '4px',
                background: greenDim, color: greenDark,
                border: `1px solid ${greenBorder}`,
                fontSize: '0.65rem', fontWeight: 600,
                padding: '1px 8px', borderRadius: '50px',
                letterSpacing: '0.06em', textTransform: 'uppercase'
              }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ padding: '8px 12px', flex: 1 }}>
          <div style={{
            fontSize: '0.65rem', fontWeight: 500,
            color: mutedColor, textTransform: 'uppercase',
            letterSpacing: '0.14em', padding: '4px 8px 12px',
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
                fontWeight: isActive(item.path) ? 600 : 400,
                background: isActive(item.path)
                  ? (dark ? 'rgba(47,158,99,0.14)' : 'rgba(47,158,99,0.08)')
                  : 'transparent',
                color: isActive(item.path) ? greenDark : textColor,
                borderLeft: isActive(item.path)
                  ? `2px solid ${green}`
                  : '2px solid transparent',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(47,158,99,0.06)';
                  e.currentTarget.style.color = greenDark;
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
                  borderRadius: '50%', background: green
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          margin: '0 20px 8px', height: '1px',
          background: `linear-gradient(90deg, ${green}44, transparent)`
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
              fontSize: '0.88rem', fontWeight: 400,
              background: 'transparent', color: '#dc2626',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
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