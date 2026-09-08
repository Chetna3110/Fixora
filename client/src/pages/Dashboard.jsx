import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../themeContext';
import IssueModal from '../components/IssueModal';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { dark } = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const green = 'var(--gold)';
  const border = 'var(--card-border)';
  const cardBg = 'var(--card)';
  const textColor = 'var(--text)';
  const mutedColor = 'var(--text-muted)';

  useEffect(() => { fetchIssues(); }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/issues`);
      setIssues(res.data);
    } catch (err) { console.log(err); }
  };

  const handleUpvote = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/issues/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchIssues();
    } catch (err) {
      console.log(err.response?.data?.message || 'Upvote error');
    }
  };

  const hasUpvoted = (issue) => issue.upvotedBy?.includes(user?.id);

  const getStatusColor = (status) => {
    if (status === 'Resolved') return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    if (status === 'In Progress') return { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  };

  const filteredIssues = issues.filter(issue => {
    const statusMatch = filter === 'All' || issue.status === filter;
    const categoryMatch = categoryFilter === 'All' || issue.category === categoryFilter;
    const searchMatch = !searchQuery ||
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && categoryMatch && searchMatch;
  });

  const pending = issues.filter(i => i.status === 'Pending').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  const leaderboard = Object.values(
    issues.reduce((acc, issue) => {
      const name = issue.reportedBy?.name || 'Unknown';
      const id = issue.reportedBy?._id || 'unknown';
      if (!acc[id]) acc[id] = { name, count: 0, resolved: 0 };
      acc[id].count++;
      if (issue.status === 'Resolved') acc[id].resolved++;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div>
      <div className="page-container">

        {/* ── Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1f7a4d 0%, #2f9e63 100%)',
          borderRadius: '16px', padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '1px solid rgba(47,158,99,0.25)',
          position: 'relative', overflow: 'hidden', flexWrap: 'wrap', gap: '16px'
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '50%'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontSize: '0.72rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
              marginBottom: '8px', fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif'
            }}>
              Fixora Dashboard
            </p>
            <h2 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '1.7rem', fontWeight: 800,
              color: 'white', marginBottom: '6px'
            }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', fontWeight: 400 }}>
              {issues.length} total issues in your community
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px', padding: '10px 18px',
                color: 'white', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.82rem', fontWeight: 600,
                letterSpacing: '0.03em'
              }}>
              🏆 Leaderboard
            </button>
            <button
              className="btn"
              onClick={() => navigate('/report')}
              style={{
                background: 'white', color: '#1f7a4d',
                border: 'none', borderRadius: '8px',
                padding: '10px 20px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.82rem', fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: 'pointer'
              }}>
              + Report Issue
            </button>
          </div>
        </div>

        {/* ── Mini Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Pending', value: pending, color: '#dc2626' },
            { label: 'In Progress', value: inProgress, color: '#d97706' },
            { label: 'Resolved', value: resolved, color: '#16a34a' },
          ].map(s => (
            <div key={s.label} style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderTop: `3px solid ${s.color}`,
              borderRadius: '12px', padding: '20px',
              textAlign: 'center', transition: 'all 0.4s'
            }}>
              <div style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '2rem', fontWeight: 800,
                color: s.color, lineHeight: 1
              }}>
                {s.value}
              </div>
              <div style={{
                color: mutedColor, fontSize: '0.72rem',
                fontWeight: 600, marginTop: '6px',
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Leaderboard Widget */}
        {showLeaderboard && (
          <div style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: '14px', padding: '24px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '4px', fontWeight: 700 }}>
                  Community
                </p>
                <h3 style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '1.3rem', fontWeight: 800, color: textColor
                }}>
                  🏆 Top Reporters
                </h3>
              </div>
              <button onClick={() => setShowLeaderboard(false)}
                style={{
                  background: 'none', border: `1px solid ${border}`,
                  borderRadius: '6px', width: '28px', height: '28px',
                  cursor: 'pointer', color: mutedColor, fontSize: '0.85rem'
                }}>✕</button>
            </div>

            {leaderboard.length === 0 ? (
              <p style={{ color: mutedColor, textAlign: 'center', padding: '20px' }}>No data yet</p>
            ) : leaderboard.map((person, i) => (
              <div key={person.name} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
                background: i === 0 ? 'var(--section-label-bg)' : 'transparent',
                border: i === 0 ? '1px solid var(--section-label-border)' : '1px solid transparent',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '32px', height: '32px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: i < 3 ? '1.3rem' : '1rem',
                  fontWeight: 700
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>

                <div style={{
                  width: '36px', height: '36px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #2f9e63, #1f7a4d)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem'
                }}>
                  {person.name?.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: i === 0 ? 700 : 500,
                    color: textColor, fontSize: '0.9rem',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    {person.name}
                    {i === 0 && (
                      <span style={{
                        marginLeft: '8px',
                        background: 'var(--section-label-bg)',
                        border: '1px solid var(--section-label-border)',
                        color: 'var(--gold-dark)', fontSize: '0.65rem',
                        padding: '1px 8px', borderRadius: '50px',
                        letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700
                      }}>Top Reporter</span>
                    )}
                  </div>
                  <div style={{ color: mutedColor, fontSize: '0.75rem' }}>
                    ✅ {person.resolved} resolved
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold-dark)', lineHeight: 1
                  }}>
                    {person.count}
                  </div>
                  <div style={{ color: mutedColor, fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                    issues
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filters */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              color: mutedColor, fontSize: '1rem', pointerEvents: 'none'
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search issues by title, description or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px 12px 42px',
                background: cardBg,
                border: `1px solid ${searchQuery ? 'var(--gold)' : border}`,
                borderRadius: '10px',
                color: textColor,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9rem', fontWeight: 400,
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: searchQuery ? '0 0 0 3px rgba(47,158,99,0.1)' : 'none'
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--gold)';
                e.target.style.boxShadow = '0 0 0 3px rgba(47,158,99,0.1)';
              }}
              onBlur={e => {
                if (!searchQuery) {
                  e.target.style.borderColor = border;
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: mutedColor, cursor: 'pointer', fontSize: '1rem'
                }}>✕</button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: mutedColor, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Status:
            </span>
            {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '5px 14px', borderRadius: '50px',
                  border: `1px solid ${filter === f ? 'var(--gold)' : border}`,
                  background: filter === f ? 'var(--section-label-bg)' : 'transparent',
                  color: filter === f ? 'var(--gold-dark)' : mutedColor,
                  fontWeight: filter === f ? 700 : 400,
                  fontSize: '0.82rem', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.2s'
                }}>
                {f}
              </button>
            ))}
            <span style={{ color: mutedColor, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: '8px' }}>
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '5px 12px', borderRadius: '8px',
                border: `1px solid ${border}`,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.82rem', color: textColor,
                background: cardBg, cursor: 'pointer',
                outline: 'none'
              }}>
              <option>All</option>
              <option>Road</option>
              <option>Water</option>
              <option>Electricity</option>
              <option>Sanitation</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* ── Issues Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: '2px', fontWeight: 700 }}>
              Community Issues
            </p>
            <h2 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '1.3rem', fontWeight: 800, color: textColor
            }}>
              {filteredIssues.length} Issue{filteredIssues.length !== 1 ? 's' : ''} Found
            </h2>
          </div>
          <p style={{ color: mutedColor, fontSize: '0.82rem', fontWeight: 400 }}>
            Click any issue to view full details
          </p>
        </div>

        {/* ── Issues Grid */}
        {filteredIssues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No issues found</h3>
            <p>Try changing your filters or be the first to report an issue!</p>
            <button
              onClick={() => navigate('/report')}
              style={{
                marginTop: '16px', background: 'var(--gold)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '10px 24px',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em'
              }}>
              + Report an Issue
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            alignItems: 'start'
          }}>
            {filteredIssues.map(issue => {
              const sc = getStatusColor(issue.status);
              return (
                <div
                  key={issue._id}
                  onClick={() => setSelectedIssue(issue)}
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    boxShadow: 'var(--shadow-card)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(47,158,99,0.14)';
                    e.currentTarget.style.borderColor = 'var(--gold)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    e.currentTarget.style.borderColor = border;
                  }}>

                  {issue.imageUrl ? (
                    <div style={{ position: 'relative' }}>
                      <img src={issue.imageUrl} alt="Issue"
                        style={{
                          width: '100%', height: '180px',
                          objectFit: 'cover', display: 'block'
                        }} />
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: sc.bg,
                        border: `1px solid ${sc.border}`,
                        color: sc.color,
                        backdropFilter: 'blur(8px)',
                        padding: '3px 10px', borderRadius: '50px',
                        fontSize: '0.7rem', fontWeight: 600,
                        letterSpacing: '0.03em'
                      }}>
                        {issue.status}
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      height: '6px',
                      background: `linear-gradient(90deg, ${sc.color}, ${sc.color}88)`
                    }} />
                  )}

                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: '1rem', fontWeight: 700,
                        color: textColor, lineHeight: 1.3, flex: 1
                      }}>
                        {issue.title}
                      </h3>
                      {!issue.imageUrl && (
                        <span style={{
                          background: sc.bg, border: `1px solid ${sc.border}`,
                          color: sc.color, padding: '2px 8px',
                          borderRadius: '50px', fontSize: '0.68rem',
                          fontWeight: 600, flexShrink: 0, letterSpacing: '0.02em'
                        }}>
                          {issue.status}
                        </span>
                      )}
                    </div>

                    <p style={{
                      color: mutedColor, fontSize: '0.83rem',
                      lineHeight: 1.6, marginBottom: '12px',
                      fontWeight: 400,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>
                      {issue.description}
                    </p>

                    {issue.location?.address && (
                      <div style={{
                        fontSize: '0.75rem', color: mutedColor,
                        marginBottom: '12px', display: 'flex',
                        alignItems: 'center', gap: '4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        📍 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {issue.location.address}
                        </span>
                      </div>
                    )}

                    <div style={{ height: '1px', background: border, marginBottom: '12px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: 'var(--tag-bg)',
                          border: '1px solid var(--card-border)',
                          color: 'var(--tag-color)', padding: '2px 8px',
                          borderRadius: '4px', fontSize: '0.7rem',
                          fontWeight: 600, letterSpacing: '0.02em'
                        }}>
                          {issue.category}
                        </span>
                        <span style={{ color: mutedColor, fontSize: '0.75rem' }}>
                          👤 {issue.reportedBy?.name?.split(' ')[0] || 'Unknown'}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          !hasUpvoted(issue) && handleUpvote(issue._id);
                        }}
                        disabled={hasUpvoted(issue)}
                        style={{
                          background: hasUpvoted(issue) ? 'var(--section-label-bg)' : 'transparent',
                          border: `1px solid ${hasUpvoted(issue) ? 'var(--gold)' : border}`,
                          borderRadius: '6px', padding: '4px 10px',
                          color: hasUpvoted(issue) ? 'var(--gold-dark)' : mutedColor,
                          fontSize: '0.75rem', fontWeight: 600,
                          cursor: hasUpvoted(issue) ? 'not-allowed' : 'pointer',
                          fontFamily: 'DM Sans, sans-serif',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'all 0.2s'
                        }}>
                        {hasUpvoted(issue) ? '🔥' : '👍'} {issue.upvotes}
                      </button>
                    </div>

                    <div style={{
                      marginTop: '10px', textAlign: 'right',
                      fontSize: '0.75rem', color: 'var(--gold-dark)',
                      fontWeight: 600, letterSpacing: '0.03em'
                    }}>
                      View Details →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpvote={async (id) => {
            await handleUpvote(id);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/issues`);
            const fresh = res.data.find(i => i._id === id);
            if (fresh) setSelectedIssue(fresh);
          }}
        />
      )}

      <footer className="footer">
        © 2026 <span>Fixora</span>. Built for citizens, by citizens.
      </footer>
    </div>
  );
}