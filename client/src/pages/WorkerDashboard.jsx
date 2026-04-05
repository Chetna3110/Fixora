import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

export default function WorkerDashboard() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [progressNote, setProgressNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');
  const { dark } = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      // Only show issues assigned to this worker
      const mine = res.data.filter(i =>
        i.assignedWorker?._id === user?.id ||
        i.assignedWorker === user?.id
      );
      setIssues(mine);
    } catch (err) { console.log(err); }
  };

  const handleUpdate = async () => {
    if (!selectedIssue) return;
    setUpdating(true);
    try {
      await axios.put(
        `http://localhost:5000/api/issues/${selectedIssue._id}/status`,
        { status: 'In Progress', progressNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('✅ Progress updated!');
      setSelectedIssue(null);
      setProgressNote('');
      fetchIssues();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'));
    }
    setUpdating(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const cardBg = dark ? 'rgba(17,34,64,0.95)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';

  return (
    <div>
      <div className="page-container">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #1a56db)',
          borderRadius: '16px', padding: '28px 32px',
          marginBottom: '28px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              🔧 Worker Dashboard
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.92rem' }}>
              {issues.length} issue{issues.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '10px', padding: '10px 18px',
            color: 'white', textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {issues.filter(i => i.status === 'In Progress').length}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>In Progress</div>
          </div>
        </div>

        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
            fontWeight: 600, fontSize: '0.88rem',
            background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
            color: msg.startsWith('✅') ? '#16a34a' : '#dc2626',
            border: `1px solid ${msg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`
          }}>{msg}</div>
        )}

        {issues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No issues assigned yet</h3>
            <p>Admin will assign issues to you. Check back later!</p>
          </div>
        ) : (
          issues.map(issue => (
            <div key={issue._id} className="issue-card">
              <div className="issue-card-header">
                <div style={{ flex: 1 }}>
                  <h3>{issue.title}</h3>
                  <p style={{ marginBottom: '10px' }}>{issue.description}</p>

                  <div className="issue-meta" style={{ marginBottom: '10px' }}>
                    <span className="tag">📁 {issue.category}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      👤 {issue.reportedBy?.name}
                    </span>
                    {issue.location?.address && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        📍 {issue.location.address}
                      </span>
                    )}
                  </div>

                  {/* Progress Note */}
                  {issue.progressNote && (
                    <div style={{
                      background: dark ? 'rgba(26,86,219,0.12)' : '#eff6ff',
                      border: '1px solid rgba(26,86,219,0.2)',
                      borderRadius: '8px', padding: '10px 14px',
                      fontSize: '0.85rem', color: dark ? '#93c5fd' : '#1a56db',
                      marginBottom: '8px'
                    }}>
                      🔧 <strong>Progress:</strong> {issue.progressNote}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', marginLeft: '20px' }}>
                  <span className={`badge badge-${issue.status === 'Resolved' ? 'resolved' : issue.status === 'In Progress' ? 'progress' : 'pending'}`}>
                    {issue.status}
                  </span>

                  {issue.imageUrl && (
                    <img src={issue.imageUrl} alt="Issue"
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${border}` }} />
                  )}

                  {issue.status !== 'Resolved' && (
                    <button
                      onClick={() => { setSelectedIssue(issue); setProgressNote(issue.progressNote || ''); }}
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                      🔧 Update Progress
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Modal */}
      {selectedIssue && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', padding: '20px'
        }}>
          <div style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
          }}>
            <h3 style={{ color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '6px' }}>
              🔧 Update Progress
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
              {selectedIssue.title}
            </p>

            <div style={{
              background: dark ? 'rgba(26,86,219,0.12)' : '#eff6ff',
              border: '1px solid rgba(26,86,219,0.2)',
              borderRadius: '8px', padding: '10px 14px',
              marginBottom: '16px', fontSize: '0.85rem', color: dark ? '#93c5fd' : '#1a56db'
            }}>
              ℹ️ Status will be set to <strong>In Progress</strong>. Only admin can resolve issues.
            </div>

            <div className="form-group">
              <label>Progress Note</label>
              <textarea className="form-input" rows={4}
                placeholder="Describe what work has been done or is being done..."
                value={progressNote}
                onChange={e => setProgressNote(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="btn btn-primary" onClick={handleUpdate}
                disabled={updating} style={{ flex: 1, padding: '12px' }}>
                {updating ? '⏳ Updating...' : '✅ Submit Progress'}
              </button>
              <button className="btn btn-ghost" onClick={() => setSelectedIssue(null)}
                style={{ flex: 1, padding: '12px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}