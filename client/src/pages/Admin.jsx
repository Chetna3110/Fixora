import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Admin() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('issues');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { dark } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchIssues();
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchIssues = async () => {
    const res = await axios.get('http://localhost:5000/api/issues');
    setIssues(res.data);
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/contact', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.log('Messages error:', err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) { console.log('Users error:', err); }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await axios.put(
        `http://localhost:5000/api/issues/${selectedIssue._id}/status`,
        { status: newStatus, resolutionNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Issue updated successfully!');
      setSelectedIssue(null);
      setResolutionNote('');
      setNewStatus('');
      fetchIssues();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error updating issue');
      setTimeout(() => setMessage(''), 3000);
    }
    setUpdating(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/contact/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
    } catch (err) { console.log('Mark read error:', err); }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err) { console.log('Delete error:', err); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/auth/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      setMessage(`Role updated to ${newRole}!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error updating role');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAssignWorker = async (issueId, workerId, workerName) => {
    try {
      await axios.put(`http://localhost:5000/api/issues/${issueId}/assign-worker`,
        { workerId, workerName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchIssues();
      setMessage(`Issue assigned to ${workerName}!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error assigning worker');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getBadgeClass = (status) => {
    if (status === 'Resolved') return 'badge badge-resolved';
    if (status === 'In Progress') return 'badge badge-progress';
    return 'badge badge-pending';
  };

  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const pending = issues.filter(i => i.status === 'Pending').length;
  const unreadCount = messages.filter(m => !m.read).length;
  const workers = users.filter(u => u.role === 'worker');

  const filteredIssues = issues.filter(i =>
    filterStatus === 'All' ? true : i.status === filterStatus
  );

  return (
    <div>
      <div className="page-container">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '1.8rem', fontWeight: 800,
            color: 'var(--text)', marginBottom: '6px'
          }}>
            ⚙️ Admin Panel
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage issues · View messages · Manage workers
          </p>
        </div>

        {message && (
          <div className="alert-success" style={{ marginBottom: '20px' }}>
            ✅ {message}
          </div>
        )}

        {/* Analytics */}
        <div className="analytics-grid">
          {[
            { label: 'Total Issues', value: total, color: '#1a56db', icon: '📋' },
            { label: 'Pending', value: pending, color: '#dc2626', icon: '⏳' },
            { label: 'In Progress', value: inProgress, color: '#d97706', icon: '🔧' },
            { label: 'Resolved', value: resolved, color: '#059669', icon: '✅' },
          ].map(card => (
            <div key={card.label} className="analytics-card"
              style={{ borderTop: `4px solid ${card.color}` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{card.icon}</div>
              <h2>{card.value}</h2>
              <p>{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { key: 'issues', label: '📋 Issues', count: filteredIssues.length },
            { key: 'messages', label: '📧 Messages', count: unreadCount },
            { key: 'workers', label: '👷 Workers', count: workers.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 22px', borderRadius: '8px',
                border: '1.5px solid',
                borderColor: activeTab === tab.key ? '#1a56db' : 'var(--card-border)',
                background: activeTab === tab.key ? '#1a56db' : 'var(--card)',
                color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}>
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#1a56db',
                  color: 'white', borderRadius: '50px',
                  padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── ISSUES TAB ── */}
        {activeTab === 'issues' && (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  style={{
                    padding: '6px 18px', borderRadius: '50px',
                    border: '1.5px solid',
                    borderColor: filterStatus === f ? '#1a56db' : 'var(--card-border)',
                    background: filterStatus === f ? (dark ? 'rgba(26,86,219,0.3)' : '#eff6ff') : 'var(--card)',
                    color: filterStatus === f ? (dark ? '#93c5fd' : '#1a56db') : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '0.85rem',
                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s'
                  }}>
                  {f} {f !== 'All' && `(${issues.filter(i => i.status === f).length})`}
                </button>
              ))}
            </div>

            {filteredIssues.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No issues found</h3>
                <p>No issues match the selected filter</p>
              </div>
            ) : filteredIssues.map(issue => (
              <div key={issue._id} className="issue-card">
                <div className="issue-card-header">
                  <div style={{ flex: 1 }}>
                    <h3>{issue.title}</h3>
                    <p style={{ marginBottom: '8px' }}>{issue.description}</p>
                    <div className="issue-meta">
                      <span className="tag">📁 {issue.category}</span>
                      <span>👤 {issue.reportedBy?.name || 'Unknown'}</span>
                      <span>✉️ {issue.reportedBy?.email || 'N/A'}</span>
                      <span>👍 {issue.upvotes} upvotes</span>
                      <span>🕒 {formatDate(issue.createdAt)}</span>
                    </div>

                    {/* Assigned Worker */}
                    {issue.assignedWorkerName && (
                      <div style={{
                        marginTop: '8px',
                        background: dark ? 'rgba(217,119,6,0.12)' : '#fffbeb',
                        border: '1px solid rgba(217,119,6,0.25)',
                        borderRadius: '8px', padding: '8px 14px',
                        fontSize: '0.83rem', color: dark ? '#fcd34d' : '#b45309',
                        fontWeight: 500
                      }}>
                        🔧 Assigned to: <strong>{issue.assignedWorkerName}</strong>
                      </div>
                    )}

                    {/* Progress Note */}
                    {issue.progressNote && (
                      <div style={{
                        marginTop: '8px',
                        background: dark ? 'rgba(26,86,219,0.12)' : '#eff6ff',
                        border: '1px solid rgba(26,86,219,0.2)',
                        borderRadius: '8px', padding: '8px 14px',
                        fontSize: '0.83rem', color: dark ? '#93c5fd' : '#1a56db'
                      }}>
                        📊 Progress: {issue.progressNote}
                      </div>
                    )}

                    {issue.location?.address && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        📍 {issue.location.address}
                      </div>
                    )}

                    {issue.resolutionNote && (
                      <div style={{
                        marginTop: '12px',
                        background: dark ? 'rgba(5,150,105,0.15)' : '#f0fdf4',
                        border: '1px solid rgba(5,150,105,0.3)',
                        borderRadius: '8px', padding: '10px 14px',
                        fontSize: '0.88rem',
                        color: dark ? '#6ee7b7' : '#16a34a'
                      }}>
                        📝 <strong>Resolution Note:</strong> {issue.resolutionNote}
                        {issue.resolvedAt && (
                          <span style={{ marginLeft: '10px', opacity: 0.7 }}>
                            — {formatDate(issue.resolvedAt)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', marginLeft: '20px' }}>
                    <span className={getBadgeClass(issue.status)}>{issue.status}</span>
                    {issue.imageUrl && (
                      <img src={issue.imageUrl} alt="Issue"
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--card-border)' }} />
                    )}
                    <button
                      onClick={() => { setSelectedIssue(issue); setNewStatus(issue.status); setResolutionNote(issue.resolutionNote || ''); }}
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                      🔧 Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && (
          <div>
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No messages yet</h3>
                <p>Messages from citizens will appear here</p>
              </div>
            ) : messages.map(msg => (
              <div key={msg._id} style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderLeft: `4px solid ${msg.read ? 'var(--card-border)' : '#1a56db'}`,
                borderRadius: '12px', padding: '20px', marginBottom: '12px',
                boxShadow: 'var(--shadow-card)', opacity: msg.read ? 0.75 : 1, transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px',
                      background: 'linear-gradient(135deg, #1a56db, #2563eb)',
                      borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '1rem'
                    }}>
                      {msg.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.92rem' }}>{msg.name}</span>
                        {!msg.read && (
                          <span style={{ background: '#1a56db', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '50px' }}>NEW</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{msg.email}</div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                    🕒 {formatDate(msg.createdAt)}
                  </span>
                </div>
                <div style={{
                  background: dark ? 'rgba(26,86,219,0.12)' : '#eff6ff',
                  border: `1px solid ${dark ? 'rgba(26,86,219,0.25)' : '#bfdbfe'}`,
                  borderRadius: '8px', padding: '8px 14px', marginBottom: '12px',
                  fontWeight: 700, fontSize: '0.88rem', color: dark ? '#93c5fd' : '#1a56db'
                }}>
                  📌 {msg.subject}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '16px' }}>
                  {msg.message}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!msg.read && (
                    <button onClick={() => handleMarkRead(msg._id)}
                      className="btn btn-success" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
                      ✅ Mark as Read
                    </button>
                  )}
                  <button onClick={() => handleDeleteMessage(msg._id)}
                    className="btn btn-danger" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── WORKERS TAB ── */}
        {activeTab === 'workers' && (
          <div>

            {/* All Users — Role Management */}
            <div style={{ marginBottom: '36px' }}>
              <h3 style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)',
                fontSize: '1rem', fontWeight: 800, marginBottom: '6px'
              }}>👥 All Users</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Promote citizens to workers so they can be assigned issues.
              </p>

              {users.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No users found</h3>
                </div>
              ) : users.map(u => (
                <div key={u._id} style={{
                  background: 'var(--card)', border: '1px solid var(--card-border)',
                  borderRadius: '12px', padding: '16px 20px', marginBottom: '10px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: u.role === 'admin'
                      ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
                      : u.role === 'worker'
                      ? 'linear-gradient(135deg,#d97706,#b45309)'
                      : 'linear-gradient(135deg,#1a56db,#2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.95rem'
                  }}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.92rem' }}>{u.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '50px',
                      fontSize: '0.75rem', fontWeight: 700,
                      background: u.role === 'admin' ? '#fef2f2' : u.role === 'worker' ? '#fffbeb' : '#eff6ff',
                      color: u.role === 'admin' ? '#dc2626' : u.role === 'worker' ? '#d97706' : '#1a56db'
                    }}>
                      {u.role === 'admin' ? '👑 Admin' : u.role === 'worker' ? '🔧 Worker' : '👤 User'}
                    </span>
                    {/* Don't allow changing your own role */}
                    {u._id !== user?.id && u.role !== 'admin' && (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px',
                          border: '1.5px solid var(--card-border)',
                          background: 'var(--card)', color: 'var(--text)',
                          fontFamily: 'Outfit, sans-serif', fontSize: '0.83rem',
                          cursor: 'pointer', outline: 'none'
                        }}>
                        <option value="user">👤 User</option>
                        <option value="worker">🔧 Worker</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Assign Workers to Issues */}
            <div>
              <h3 style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)',
                fontSize: '1rem', fontWeight: 800, marginBottom: '6px'
              }}>🔧 Assign Workers to Issues</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Assign workers to open issues so they can update progress.
              </p>

              {workers.length === 0 ? (
                <div style={{
                  background: dark ? 'rgba(217,119,6,0.1)' : '#fffbeb',
                  border: '1px solid rgba(217,119,6,0.25)',
                  borderRadius: '10px', padding: '16px 20px',
                  color: dark ? '#fcd34d' : '#b45309',
                  fontSize: '0.88rem', fontWeight: 500
                }}>
                  ⚠️ No workers yet. Promote some users to Worker role above first.
                </div>
              ) : issues.filter(i => i.status !== 'Resolved').length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎉</div>
                  <h3>All issues resolved!</h3>
                  <p>No open issues to assign</p>
                </div>
              ) : (
                issues.filter(i => i.status !== 'Resolved').map(issue => (
                  <div key={issue._id} style={{
                    background: 'var(--card)', border: '1px solid var(--card-border)',
                    borderRadius: '12px', padding: '16px 20px', marginBottom: '10px',
                    boxShadow: 'var(--shadow-card)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '6px', fontSize: '0.95rem' }}>
                          {issue.title}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="tag" style={{ fontSize: '0.75rem' }}>📁 {issue.category}</span>
                          <span className={getBadgeClass(issue.status)}>{issue.status}</span>
                          {issue.assignedWorkerName ? (
                            <span style={{
                              fontSize: '0.8rem', color: dark ? '#fcd34d' : '#b45309',
                              fontWeight: 600, background: dark ? 'rgba(217,119,6,0.12)' : '#fffbeb',
                              padding: '2px 10px', borderRadius: '50px',
                              border: '1px solid rgba(217,119,6,0.2)'
                            }}>
                              🔧 {issue.assignedWorkerName}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                      <select
                        value={issue.assignedWorker?._id || issue.assignedWorker || ''}
                        onChange={e => {
                          const selected = workers.find(w => w._id === e.target.value);
                          if (selected) handleAssignWorker(issue._id, selected._id, selected.name);
                        }}
                        style={{
                          padding: '8px 14px', borderRadius: '8px',
                          border: '1.5px solid var(--card-border)',
                          background: 'var(--card)', color: 'var(--text)',
                          fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                          cursor: 'pointer', outline: 'none', minWidth: '180px'
                        }}>
                        <option value="">Assign worker...</option>
                        {workers.map(w => (
                          <option key={w._id} value={w._id}>🔧 {w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {selectedIssue && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', padding: '20px'
        }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--card-border)',
            borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '6px' }}>
              Update Issue Status
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
              {selectedIssue.title}
            </p>
            <div className="form-group">
              <label>New Status</label>
              <select className="form-input" value={newStatus}
                onChange={e => setNewStatus(e.target.value)}>
                <option value="Pending">⏳ Pending</option>
                <option value="In Progress">🔧 In Progress</option>
                <option value="Resolved">✅ Resolved</option>
              </select>
            </div>
            <div className="form-group">
              <label>Resolution Note {newStatus === 'Resolved' ? '(Required)' : '(Optional)'}</label>
              <textarea className="form-input"
                placeholder="e.g. Pothole filled by municipal team. Road repaired on 28 Feb 2026."
                rows={3} value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="btn btn-primary" onClick={handleUpdateStatus}
                disabled={updating} style={{ flex: 1, padding: '12px' }}>
                {updating ? '⏳ Updating...' : '✅ Update Issue'}
              </button>
              <button className="btn btn-ghost" onClick={() => setSelectedIssue(null)}
                style={{ flex: 1, padding: '12px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        © 2026 <span>Fixora</span>. Admin Panel.
      </footer>
    </div>
  );
}