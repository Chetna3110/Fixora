import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { useTheme } from '../ThemeContext';


const ICONS = ['🏰', '🛡️', '⚔️', '🌊', '🔥', '🌿', '⚡', '🏗️', '🚦', '🌍'];
const CATEGORIES = ['General', 'Road', 'Water', 'Electricity', 'Sanitation'];

export default function Guilds() {
  const [guilds, setGuilds] = useState([]);
  const [myGuild, setMyGuild] = useState(null);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all | mine | create
  const [guildTab, setGuildTab] = useState('about'); // about | members | chat | issues
  const [createForm, setCreateForm] = useState({ name: '', description: '', category: 'General', icon: '🏰' });
  const [chatMsg, setChatMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();
  const { dark } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchGuilds();
    fetchIssues();
  }, []);

  const fetchGuilds = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/guilds');
      setGuilds(res.data);
      const mine = res.data.find(g =>
        g.members?.some(m => m._id === user?.id) ||
        g.leader?._id === user?.id
      );
      if (mine) setMyGuild(mine);
    } catch (err) { console.log(err); }
  };

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data);
    } catch (err) { console.log(err); }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.description) {
      setMsg('error:Please fill all fields'); return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/guilds', createForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('success:Guild created successfully!');
      setCreateForm({ name: '', description: '', category: 'General', icon: '🏰' });
      fetchGuilds();
      setActiveTab('all');
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error creating guild'));
    }
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleApply = async (guildId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/guilds/${guildId}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('success:' + res.data.message);
      fetchGuilds();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error'));
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleRequest = async (guildId, userId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/guilds/${guildId}/requests/${userId}`,
        { action }, { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGuilds();
      if (selectedGuild) {
        const res = await axios.get(`http://localhost:5000/api/guilds/${guildId}`);
        setSelectedGuild(res.data);
      }
    } catch (err) { console.log(err); }
  };

  const handleChat = async () => {
    if (!chatMsg.trim() || !selectedGuild) return;
    try {
      await axios.post(`http://localhost:5000/api/guilds/${selectedGuild._id}/chat`,
        { text: chatMsg }, { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMsg('');
      const res = await axios.get(`http://localhost:5000/api/guilds/${selectedGuild._id}`);
      setSelectedGuild(res.data);
    } catch (err) { console.log(err); }
  };

  const handleAssignIssue = async (issueId) => {
    try {
      await axios.put(`http://localhost:5000/api/guilds/${selectedGuild._id}/assign-issue/${issueId}`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('success:Issue assigned to guild!');
      fetchIssues();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error'));
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleLeave = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/guilds/${selectedGuild._id}/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('success:Left guild');
      setSelectedGuild(null);
      setMyGuild(null);
      fetchGuilds();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error'));
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const isLeader = (guild) => guild?.leader?._id === user?.id;
  const isMember = (guild) => guild?.members?.some(m => m._id === user?.id) || isLeader(guild);
  const isPending = (guild) => guild?.pendingRequests?.some(r => r._id === user?.id || r === user?.id);

  const cardBg = dark ? 'rgba(17,34,64,0.95)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';

  const getRankIcon = (i) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
  };

  return (
    <div>
      

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1a56db 55%, #2563eb 100%)',
        padding: '60px 48px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', padding: '5px 16px', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px'
          }}>🏰 Volunteer Guilds</div>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '2.4rem',
            fontWeight: 800, color: 'white', marginBottom: '12px'
          }}>Join a Guild. Make a Difference.</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '500px', lineHeight: 1.7, marginBottom: '24px' }}>
            Guilds are volunteer groups focused on specific civic issues. Join one, collaborate, and help resolve problems in your city faster.
          </p>
          {myGuild && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '10px', padding: '10px 18px', color: 'white', fontSize: '0.9rem'
            }}>
              <span style={{ fontSize: '1.4rem' }}>{myGuild.icon}</span>
              <div>
                <div style={{ fontWeight: 700 }}>Your Guild: {myGuild.name}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>{myGuild.members?.length} members · {myGuild.resolvedCount} resolved</div>
              </div>
              <button onClick={() => { setSelectedGuild(myGuild); setActiveTab('detail'); }}
                style={{ background: 'white', color: '#1a56db', border: 'none', borderRadius: '7px', padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                View →
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="page-container">
        {/* Status message */}
        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
            fontWeight: 600, fontSize: '0.88rem',
            background: msg.startsWith('success:') ? '#f0fdf4' : '#fef2f2',
            color: msg.startsWith('success:') ? '#16a34a' : '#dc2626',
            border: `1px solid ${msg.startsWith('success:') ? '#bbf7d0' : '#fecaca'}`
          }}>
            {msg.startsWith('success:') ? '✅' : '❌'} {msg.split(':').slice(1).join(':')}
          </div>
        )}

        {/* Main Tabs */}
        {activeTab !== 'detail' && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
            {[
              { key: 'all', label: '🏰 All Guilds' },
              { key: 'leaderboard', label: '🏆 Leaderboard' },
              { key: 'create', label: '➕ Create Guild' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 22px', borderRadius: '8px', border: '1.5px solid',
                  borderColor: activeTab === tab.key ? '#1a56db' : 'var(--card-border)',
                  background: activeTab === tab.key ? '#1a56db' : 'var(--card)',
                  color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s'
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ── ALL GUILDS ── */}
        {activeTab === 'all' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
            {guilds.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-icon">🏰</div>
                <h3>No guilds yet</h3>
                <p>Be the first to create a guild!</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('create')}>
                  ➕ Create First Guild
                </button>
              </div>
            ) : guilds.map((guild, i) => (
              <div key={guild._id} style={{
                background: cardBg, border: `1px solid ${border}`,
                borderRadius: '14px', padding: '24px',
                boxShadow: 'var(--shadow-card)', transition: 'all 0.2s',
                cursor: 'pointer', position: 'relative', overflow: 'hidden'
              }}
                onClick={() => { setSelectedGuild(guild); setActiveTab('detail'); setGuildTab('about'); }}>
                {/* Top accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #1a56db, #2563eb)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '12px',
                      background: dark ? 'rgba(26,86,219,0.2)' : '#eff6ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.8rem'
                    }}>{guild.icon}</div>
                    <div>
                      <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: 'var(--text)', fontSize: '1rem' }}>{guild.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📁 {guild.category}
                      </div>
                    </div>
                  </div>
                  {isMember(guild) && (
                    <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '50px' }}>
                      ✅ Joined
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '16px',
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {guild.description}
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                  {[
                    { label: 'Members', value: guild.members?.length || 0, icon: '👥' },
                    { label: 'Resolved', value: guild.resolvedCount, icon: '✅' },
                  ].map(s => (
                    <div key={s.label} style={{
                      flex: 1, background: dark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                      border: `1px solid ${border}`, borderRadius: '8px', padding: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {s.icon} {s.value}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                {guild.badges?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {guild.badges.map((b, i) => (
                      <span key={i} title={b.name} style={{
                        background: dark ? 'rgba(255,200,0,0.15)' : '#fffbeb',
                        border: '1px solid rgba(255,200,0,0.3)',
                        borderRadius: '50px', padding: '3px 10px',
                        fontSize: '0.78rem', fontWeight: 600, color: '#d97706'
                      }}>
                        {b.icon} {b.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Leader */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  👑 Leader: <strong style={{ color: 'var(--text)' }}>{guild.leader?.name}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {activeTab === 'leaderboard' && (
          <div>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: 'var(--text)', marginBottom: '20px' }}>
              🏆 Guild Leaderboard
            </h2>
            {guilds.map((guild, i) => (
              <div key={guild._id} style={{
                background: cardBg, border: `1px solid ${border}`,
                borderLeft: `4px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#1a56db'}`,
                borderRadius: '12px', padding: '18px 22px',
                marginBottom: '12px', display: 'flex',
                alignItems: 'center', gap: '16px',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
                onClick={() => { setSelectedGuild(guild); setActiveTab('detail'); setGuildTab('about'); }}>
                <div style={{ fontSize: '1.6rem', minWidth: '40px', textAlign: 'center' }}>
                  {getRankIcon(i)}
                </div>
                <div style={{ fontSize: '1.8rem' }}>{guild.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                    {guild.name}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>👥 {guild.members?.length} members</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📁 {guild.category}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>👑 {guild.leader?.name}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1a56db' }}>
                    {guild.resolvedCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>resolved</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CREATE GUILD ── */}
        {activeTab === 'create' && (
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-card)' }}>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                ➕ Create a Guild
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
                Start your own volunteer group and recruit citizens to make a difference.
              </p>

              {/* Icon Picker */}
              <div className="form-group">
                <label>Guild Icon</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setCreateForm({ ...createForm, icon: ic })}
                      style={{
                        width: '44px', height: '44px', borderRadius: '10px', border: '2px solid',
                        borderColor: createForm.icon === ic ? '#1a56db' : border,
                        background: createForm.icon === ic ? (dark ? 'rgba(26,86,219,0.2)' : '#eff6ff') : 'var(--card)',
                        fontSize: '1.4rem', cursor: 'pointer', transition: 'all 0.2s'
                      }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Guild Name</label>
                <input className="form-input" placeholder="e.g. Road Warriors"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select className="form-input" value={createForm.category}
                  onChange={e => setCreateForm({ ...createForm, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={3}
                  placeholder="What is your guild's mission? What issues will you focus on?"
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>

              <button className="btn btn-primary" onClick={handleCreate} disabled={loading}
                style={{ width: '100%', padding: '13px', fontSize: '0.95rem', borderRadius: '10px' }}>
                {loading ? '⏳ Creating...' : '🏰 Create Guild'}
              </button>
            </div>
          </div>
        )}

        {/* ── GUILD DETAIL ── */}
        {activeTab === 'detail' && selectedGuild && (
          <div>
            {/* Back */}
            <button onClick={() => setActiveTab('all')} style={{
              background: 'none', border: 'none', color: '#1a56db',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px',
              fontFamily: 'Outfit, sans-serif'
            }}>
              ← Back to Guilds
            </button>

            {/* Guild Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f, #1a56db)',
              borderRadius: '16px', padding: '28px 32px',
              marginBottom: '24px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '3rem' }}>{selectedGuild.icon}</div>
                <div>
                  <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'white', fontWeight: 800, fontSize: '1.6rem', marginBottom: '4px' }}>
                    {selectedGuild.name}
                  </h2>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
                    📁 {selectedGuild.category} · 👥 {selectedGuild.members?.length} members · ✅ {selectedGuild.resolvedCount} resolved
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {!isMember(selectedGuild) && !isPending(selectedGuild) && (
                  <button onClick={() => handleApply(selectedGuild._id)}
                    className="btn btn-white"
                    style={{ fontWeight: 700 }}>
                    📨 Apply to Join
                  </button>
                )}
                {isPending(selectedGuild) && (
                  <span style={{
                    background: 'rgba(255,255,255,0.15)', color: 'white',
                    padding: '10px 18px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600
                  }}>⏳ Application Pending</span>
                )}
                {isMember(selectedGuild) && !isLeader(selectedGuild) && (
                  <button onClick={handleLeave}
                    style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'Outfit, sans-serif' }}>
                    🚪 Leave Guild
                  </button>
                )}
              </div>
            </div>

            {/* Badges */}
            {selectedGuild.badges?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {selectedGuild.badges.map((b, i) => (
                  <div key={i} style={{
                    background: dark ? 'rgba(255,200,0,0.12)' : '#fffbeb',
                    border: '1px solid rgba(255,200,0,0.3)',
                    borderRadius: '50px', padding: '6px 14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.82rem', fontWeight: 600, color: '#d97706'
                  }}>
                    {b.icon} {b.name}
                  </div>
                ))}
              </div>
            )}

            {/* Detail Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {[
                { key: 'about', label: 'ℹ️ About' },
                { key: 'members', label: `👥 Members (${selectedGuild.members?.length})` },
                ...(isLeader(selectedGuild) ? [{ key: 'requests', label: `📨 Requests (${selectedGuild.pendingRequests?.length || 0})` }] : []),
                ...(isMember(selectedGuild) ? [{ key: 'chat', label: '💬 Chat' }] : []),
                ...(isMember(selectedGuild) ? [{ key: 'issues', label: '📋 Assign Issues' }] : []),
              ].map(tab => (
                <button key={tab.key} onClick={() => setGuildTab(tab.key)}
                  style={{
                    padding: '8px 18px', borderRadius: '8px', border: '1.5px solid',
                    borderColor: guildTab === tab.key ? '#1a56db' : 'var(--card-border)',
                    background: guildTab === tab.key ? '#1a56db' : 'var(--card)',
                    color: guildTab === tab.key ? 'white' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s'
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* About Tab */}
            {guildTab === 'about' && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', marginBottom: '12px' }}>About this Guild</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '20px' }}>
                  {selectedGuild.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Leader', value: `👑 ${selectedGuild.leader?.name}` },
                    { label: 'Category', value: `📁 ${selectedGuild.category}` },
                    { label: 'Members', value: `👥 ${selectedGuild.members?.length}` },
                    { label: 'Issues Resolved', value: `✅ ${selectedGuild.resolvedCount}` },
                    { label: 'Created', value: `🕒 ${new Date(selectedGuild.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: dark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                      border: `1px solid ${border}`, borderRadius: '10px', padding: '14px'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members Tab */}
            {guildTab === 'members' && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', marginBottom: '16px' }}>
                  👥 Members ({selectedGuild.members?.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedGuild.members?.map(member => (
                    <div key={member._id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '10px',
                      background: dark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                      border: `1px solid ${border}`
                    }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: `hsl(${(member.name?.charCodeAt(0) || 65) * 5}, 55%, 45%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.9rem'
                      }}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                      {selectedGuild.leader?._id === member._id && (
                        <span style={{ background: '#fffbeb', color: '#d97706', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '50px', border: '1px solid rgba(217,119,6,0.2)' }}>
                          👑 Leader
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requests Tab (leader only) */}
            {guildTab === 'requests' && isLeader(selectedGuild) && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', marginBottom: '16px' }}>
                  📨 Join Requests ({selectedGuild.pendingRequests?.length || 0})
                </h3>
                {!selectedGuild.pendingRequests?.length ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No pending requests
                  </div>
                ) : selectedGuild.pendingRequests.map(req => (
                  <div key={req._id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '10px', marginBottom: '10px',
                    background: dark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                    border: `1px solid ${border}`
                  }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: '#1a56db', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white', fontWeight: 700
                    }}>
                      {req.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{req.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleRequest(selectedGuild._id, req._id, 'approve')}
                        className="btn btn-success" style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
                        ✅ Approve
                      </button>
                      <button onClick={() => handleRequest(selectedGuild._id, req._id, 'reject')}
                        className="btn btn-danger" style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Tab */}
            {guildTab === 'chat' && isMember(selectedGuild) && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${border}` }}>
                  <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', margin: 0 }}>
                    💬 Guild Chat
                  </h3>
                </div>
                {/* Messages */}
                <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!selectedGuild.chat?.length ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : selectedGuild.chat.map((c, i) => {
                    const isMe = c.user === user?.id || c.userName === user?.name;
                    return (
                      <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${(c.userName?.charCodeAt(0) || 65) * 5}, 55%, 45%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.8rem'
                        }}>
                          {c.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ maxWidth: '70%' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textAlign: isMe ? 'right' : 'left' }}>
                            {isMe ? 'You' : c.userName}
                          </div>
                          <div style={{
                            background: isMe ? '#1a56db' : (dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'),
                            color: isMe ? 'white' : 'var(--text)',
                            borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            padding: '10px 14px', fontSize: '0.88rem', lineHeight: 1.5
                          }}>
                            {c.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Input */}
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${border}`, display: 'flex', gap: '10px' }}>
                  <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                    placeholder="Type a message..."
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: '50px',
                      border: `1.5px solid ${border}`, background: 'var(--input-bg)',
                      color: 'var(--text)', fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', outline: 'none'
                    }} />
                  <button onClick={handleChat}
                    style={{
                      background: '#1a56db', color: 'white', border: 'none',
                      borderRadius: '50px', padding: '10px 20px',
                      fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif'
                    }}>
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Assign Issues Tab */}
            {guildTab === 'issues' && isMember(selectedGuild) && (
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', marginBottom: '6px' }}>
                  📋 Assign Issues to Guild
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Assign unresolved community issues to your guild to work on them together.
                </p>
                {issues.filter(i => i.status !== 'Resolved').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No open issues to assign
                  </div>
                ) : issues.filter(i => i.status !== 'Resolved').map(issue => (
                  <div key={issue._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', borderRadius: '10px', marginBottom: '10px',
                    background: dark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                    border: `1px solid ${border}`, gap: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem', marginBottom: '4px' }}>
                        {issue.title}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="tag" style={{ fontSize: '0.75rem' }}>📁 {issue.category}</span>
                        {issue.assignedGuildName && (
                          <span style={{ fontSize: '0.75rem', color: '#1a56db', fontWeight: 600 }}>
                            🏰 {issue.assignedGuildName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleAssignIssue(issue._id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '7px 14px', flexShrink: 0 }}>
                      {issue.assignedGuild === selectedGuild._id ? '✅ Assigned' : 'Assign →'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="footer">
        © 2026 <span>Fixora</span>. Built for citizens, by citizens.
      </footer>
    </div>
  );
}