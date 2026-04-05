import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
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

  const gold = '#c9a96e';
  const border = dark ? 'rgba(201,169,110,0.15)' : 'rgba(201,169,110,0.25)';
  const cardBg = dark ? 'rgba(26,22,14,0.95)' : '#ffffff';
  const textColor = dark ? 'rgba(255,255,255,0.88)' : '#1a1208';
  const mutedColor = dark ? 'rgba(255,255,255,0.38)' : 'rgba(26,18,8,0.45)';

  useEffect(() => { fetchIssues(); }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data);
    } catch (err) { console.log(err); }
  };

  const handleUpvote = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/issues/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchIssues();
    } catch (err) {
      console.log(err.response?.data?.message || 'Upvote error');
    }
  };

  const hasUpvoted = (issue) => issue.upvotedBy?.includes(user?.id);

  const getStatusColor = (status) => {
    if (status === 'Resolved') return { color: '#6ec99a', bg: 'rgba(110,201,154,0.12)', border: 'rgba(110,201,154,0.25)' };
    if (status === 'In Progress') return { color: gold, bg: 'rgba(201,169,110,0.12)', border: 'rgba(201,169,110,0.25)' };
    return { color: '#e07070', bg: 'rgba(224,112,112,0.12)', border: 'rgba(224,112,112,0.25)' };
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

  // Leaderboard — top reporters by issue count
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
          background: dark
            ? 'linear-gradient(135deg, #1a1208 0%, #2d2010 100%)'
            : 'linear-gradient(135deg, #2d2010 0%, #1a1208 100%)',
          borderRadius: '16px', padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: `1px solid rgba(201,169,110,0.2)`,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px',
            background: 'rgba(201,169,110,0.06)',
            borderRadius: '50%'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontSize: '0.72rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: gold,
              marginBottom: '8px', fontWeight: 400,
              fontFamily: 'DM Sans, sans-serif'
            }}>
              Fixora Dashboard
            </p>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.8rem', fontWeight: 300,
              color: 'white', marginBottom: '6px'
            }}>
              Welcome back, <em style={{ fontStyle: 'italic', color: gold }}>{user?.name?.split(' ')[0]}</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', fontWeight: 300 }}>
              {issues.length} total issues in your community
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              style={{
                background: 'rgba(201,169,110,0.15)',
                border: `1px solid rgba(201,169,110,0.3)`,
                borderRadius: '8px', padding: '10px 18px',
                color: gold, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.82rem', fontWeight: 500,
                letterSpacing: '0.05em'
              }}>
              🏆 Leaderboard
            </button>
            <button
              className="btn"
              onClick={() => navigate('/report')}
              style={{
                background: gold, color: '#0d0d0f',
                border: 'none', borderRadius: '8px',
                padding: '10px 20px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.82rem', fontWeight: 500,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                cursor: 'pointer'
              }}>
              + Report Issue
            </button>
          </div>
        </div>

        {/* ── Mini Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Pending', value: pending, color: '#e07070' },
            { label: 'In Progress', value: inProgress, color: gold },
            { label: 'Resolved', value: resolved, color: '#6ec99a' },
          ].map(s => (
            <div key={s.label} style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderTop: `2px solid ${s.color}`,
              borderRadius: '12px', padding: '20px',
              textAlign: 'center', transition: 'all 0.4s'
            }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2.2rem', fontWeight: 600,
                color: s.color, lineHeight: 1
              }}>
                {s.value}
              </div>
              <div style={{
                color: mutedColor, fontSize: '0.72rem',
                fontWeight: 400, marginTop: '6px',
                textTransform: 'uppercase', letterSpacing: '0.1em'
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
            boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(201,169,110,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, marginBottom: '4px' }}>
                  Community
                </p>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.4rem', fontWeight: 400, color: textColor
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
                background: i === 0
                  ? (dark ? 'rgba(201,169,110,0.1)' : 'rgba(201,169,110,0.08)')
                  : 'transparent',
                border: i === 0 ? `1px solid rgba(201,169,110,0.2)` : '1px solid transparent',
                transition: 'all 0.2s'
              }}>
                {/* Rank */}
                <div style={{
                  width: '32px', height: '32px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: i < 3 ? '1.3rem' : '1rem',
                  fontWeight: 600
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${gold}, #a8833a)`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0d0d0f', fontWeight: 700, fontSize: '0.9rem'
                }}>
                  {person.name?.charAt(0).toUpperCase()}
                </div>

                {/* Name */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: i === 0 ? 600 : 400,
                    color: textColor, fontSize: '0.9rem',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    {person.name}
                    {i === 0 && (
                      <span style={{
                        marginLeft: '8px',
                        background: 'rgba(201,169,110,0.15)',
                        border: '1px solid rgba(201,169,110,0.3)',
                        color: gold, fontSize: '0.65rem',
                        padding: '1px 8px', borderRadius: '50px',
                        letterSpacing: '0.08em', textTransform: 'uppercase'
                      }}>Top Reporter</span>
                    )}
                  </div>
                  <div style={{ color: mutedColor, fontSize: '0.75rem' }}>
                    ✅ {person.resolved} resolved
                  </div>
                </div>

                {/* Count */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.4rem', fontWeight: 600, color: gold, lineHeight: 1
                  }}>
                    {person.count}
                  </div>
                  <div style={{ color: mutedColor, fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                    issues
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filters */}
        <div style={{ marginBottom: '20px' }}>
          {/* Search Bar */}
          <div style={{
            position: 'relative', marginBottom: '16px'
          }}>
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
                border: `1px solid ${searchQuery ? gold : border}`,
                borderRadius: '10px',
                color: textColor,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9rem', fontWeight: 300,
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: searchQuery ? `0 0 0 3px rgba(201,169,110,0.08)` : 'none'
              }}
              onFocus={e => {
                e.target.style.borderColor = gold;
                e.target.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.08)';
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

          {/* Filters row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: mutedColor, fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Status:
            </span>
            {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '5px 14px', borderRadius: '50px',
                  border: `1px solid ${filter === f ? gold : border}`,
                  background: filter === f ? 'rgba(201,169,110,0.12)' : 'transparent',
                  color: filter === f ? gold : mutedColor,
                  fontWeight: filter === f ? 500 : 300,
                  fontSize: '0.82rem', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.2s'
                }}>
                {f}
              </button>
            ))}
            <span style={{ color: mutedColor, fontSize: '0.72rem', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: '8px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: gold, marginBottom: '2px' }}>
              Community Issues
            </p>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.4rem', fontWeight: 400, color: textColor
            }}>
              {filteredIssues.length} Issue{filteredIssues.length !== 1 ? 's' : ''} Found
            </h2>
          </div>
          <p style={{ color: mutedColor, fontSize: '0.82rem', fontWeight: 300 }}>
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
                marginTop: '16px', background: gold, color: '#0d0d0f',
                border: 'none', borderRadius: '8px', padding: '10px 24px',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
                fontWeight: 500, cursor: 'pointer', letterSpacing: '0.05em'
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
                    boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(201,169,110,0.06)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = dark
                      ? '0 8px 32px rgba(0,0,0,0.3)'
                      : '0 8px 28px rgba(201,169,110,0.14)';
                    e.currentTarget.style.borderColor = gold;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = dark
                      ? '0 2px 12px rgba(0,0,0,0.2)'
                      : '0 2px 12px rgba(201,169,110,0.06)';
                    e.currentTarget.style.borderColor = border;
                  }}>

                  {/* Image */}
                  {issue.imageUrl ? (
                    <div style={{ position: 'relative' }}>
                      <img src={issue.imageUrl} alt="Issue"
                        style={{
                          width: '100%', height: '180px',
                          objectFit: 'cover', display: 'block'
                        }} />
                      {/* Status badge over image */}
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: sc.bg,
                        border: `1px solid ${sc.border}`,
                        color: sc.color,
                        backdropFilter: 'blur(8px)',
                        padding: '3px 10px', borderRadius: '50px',
                        fontSize: '0.7rem', fontWeight: 500,
                        letterSpacing: '0.05em'
                      }}>
                        {issue.status}
                      </span>
                    </div>
                  ) : (
                    /* No image — colored top bar */
                    <div style={{
                      height: '6px',
                      background: `linear-gradient(90deg, ${sc.color}, ${sc.color}88)`
                    }} />
                  )}

                  {/* Card Content */}
                  <div style={{ padding: '16px' }}>
                    {/* Title + status (if no image) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '1.05rem', fontWeight: 600,
                        color: textColor, lineHeight: 1.3, flex: 1
                      }}>
                        {issue.title}
                      </h3>
                      {!issue.imageUrl && (
                        <span style={{
                          background: sc.bg, border: `1px solid ${sc.border}`,
                          color: sc.color, padding: '2px 8px',
                          borderRadius: '50px', fontSize: '0.68rem',
                          fontWeight: 500, flexShrink: 0, letterSpacing: '0.04em'
                        }}>
                          {issue.status}
                        </span>
                      )}
                    </div>

                    <p style={{
                      color: mutedColor, fontSize: '0.83rem',
                      lineHeight: 1.6, marginBottom: '12px',
                      fontWeight: 300,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>
                      {issue.description}
                    </p>

                    {/* Location */}
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

                    {/* Divider */}
                    <div style={{ height: '1px', background: border, marginBottom: '12px' }} />

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Category */}
                        <span style={{
                          background: 'rgba(201,169,110,0.1)',
                          border: `1px solid rgba(201,169,110,0.2)`,
                          color: gold, padding: '2px 8px',
                          borderRadius: '4px', fontSize: '0.7rem',
                          fontWeight: 500, letterSpacing: '0.03em'
                        }}>
                          {issue.category}
                        </span>
                        <span style={{ color: mutedColor, fontSize: '0.75rem' }}>
                          👤 {issue.reportedBy?.name?.split(' ')[0] || 'Unknown'}
                        </span>
                      </div>

                      {/* Upvote */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          !hasUpvoted(issue) && handleUpvote(issue._id);
                        }}
                        disabled={hasUpvoted(issue)}
                        style={{
                          background: hasUpvoted(issue)
                            ? 'rgba(201,169,110,0.12)'
                            : 'transparent',
                          border: `1px solid ${hasUpvoted(issue) ? gold : border}`,
                          borderRadius: '6px', padding: '4px 10px',
                          color: hasUpvoted(issue) ? gold : mutedColor,
                          fontSize: '0.75rem', fontWeight: 500,
                          cursor: hasUpvoted(issue) ? 'not-allowed' : 'pointer',
                          fontFamily: 'DM Sans, sans-serif',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'all 0.2s'
                        }}>
                        {hasUpvoted(issue) ? '🔥' : '👍'} {issue.upvotes}
                      </button>
                    </div>

                    {/* View details */}
                    <div style={{
                      marginTop: '10px', textAlign: 'right',
                      fontSize: '0.75rem', color: gold,
                      fontWeight: 400, letterSpacing: '0.05em'
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

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpvote={async (id) => {
            await handleUpvote(id);
            const res = await axios.get('http://localhost:5000/api/issues');
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