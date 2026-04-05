import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function IssueModal({ issue, onClose, onUpvote }) {
  const { dark } = useTheme();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(issue.comments || []);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const getBadgeStyle = (status) => {
    if (status === 'Resolved') return { background: '#f0fdf4', color: '#16a34a' };
    if (status === 'In Progress') return { background: '#fffbeb', color: '#d97706' };
    return { background: '#fef2f2', color: '#dc2626' };
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/issues/${issue._id}/comments`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data.comments);
      setComment('');
    } catch (err) {
      console.log('Comment error:', err);
    }
    setSubmitting(false);
  };

  const hasUpvoted = issue.upvotedBy?.includes(user?.id);

  const cardBg = dark ? 'rgba(17,34,64,0.98)' : 'white';
  const textColor = dark ? '#f1f5f9' : '#111928';
  const mutedColor = dark ? 'rgba(255,255,255,0.5)' : '#6b7280';
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#f9fafb';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease'
      }}>

      {/* Modal Box */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: cardBg,
          borderRadius: '18px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          border: `1px solid ${borderColor}`,
          animation: 'slideUp 0.3s ease',
          position: 'relative'
        }}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky', top: '16px',
            float: 'right', marginRight: '16px',
            width: '34px', height: '34px',
            borderRadius: '50%',
            background: dark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
            border: `1px solid ${borderColor}`,
            color: textColor, fontSize: '1rem',
            cursor: 'pointer', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>

        {/* Full Image */}
        {issue.imageUrl && (
          <div style={{ borderRadius: '18px 18px 0 0', overflow: 'hidden' }}>
            <img
              src={issue.imageUrl}
              alt="Issue"
              style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '28px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
            <h2 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '1.4rem', fontWeight: 800,
              color: textColor, flex: 1
            }}>
              {issue.title}
            </h2>
            <span style={{
              padding: '5px 14px', borderRadius: '50px',
              fontSize: '0.8rem', fontWeight: 700,
              flexShrink: 0,
              ...getBadgeStyle(issue.status)
            }}>
              {issue.status}
            </span>
          </div>

          {/* Description */}
          <p style={{ color: mutedColor, lineHeight: 1.7, marginBottom: '20px', fontSize: '0.95rem' }}>
            {issue.description}
          </p>

          {/* Meta Info */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '12px', marginBottom: '20px'
          }}>
            {[
              { label: 'Category', value: `📁 ${issue.category}` },
              { label: 'Reported by', value: `👤 ${issue.reportedBy?.name || 'Unknown'}` },
              { label: 'Date', value: `🕒 ${new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` },
              { label: 'Upvotes', value: `👍 ${issue.upvotes} upvote${issue.upvotes !== 1 ? 's' : ''}` },
            ].map(item => (
              <div key={item.label} style={{
                background: dark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                border: `1px solid ${borderColor}`,
                borderRadius: '10px', padding: '12px 16px'
              }}>
                <div style={{ color: mutedColor, fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.label}
                </div>
                <div style={{ color: textColor, fontWeight: 600, fontSize: '0.9rem' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Location Address */}
          {issue.location?.address && (
            <div style={{
              background: dark ? 'rgba(26,86,219,0.12)' : '#eff6ff',
              border: `1px solid ${dark ? 'rgba(26,86,219,0.25)' : '#bfdbfe'}`,
              borderRadius: '10px', padding: '12px 16px',
              marginBottom: '20px', fontSize: '0.9rem',
              color: dark ? '#93c5fd' : '#1a56db', fontWeight: 500
            }}>
              📍 {issue.location.address}
            </div>
          )}

          {/* Map */}
          {issue.location?.lat && issue.location?.lng && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: textColor, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '10px', fontSize: '0.95rem' }}>
                📍 Location on Map
              </h4>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                <MapContainer
                  center={[issue.location.lat, issue.location.lng]}
                  zoom={15}
                  style={{ height: '220px', width: '100%' }}
                  zoomControl={false}
                  scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[issue.location.lat, issue.location.lng]} />
                </MapContainer>
              </div>
            </div>
          )}

          {/* Resolution Note */}
          {issue.resolutionNote && (
            <div style={{
              background: dark ? 'rgba(5,150,105,0.12)' : '#f0fdf4',
              border: '1px solid rgba(5,150,105,0.3)',
              borderRadius: '10px', padding: '14px 16px',
              marginBottom: '24px'
            }}>
              <div style={{ fontWeight: 700, color: dark ? '#6ee7b7' : '#16a34a', marginBottom: '4px', fontSize: '0.85rem' }}>
                ✅ Resolution Note
              </div>
              <div style={{ color: dark ? '#6ee7b7' : '#16a34a', fontSize: '0.9rem' }}>
                {issue.resolutionNote}
              </div>
            </div>
          )}

          {/* Upvote Button */}
          <button
            onClick={() => !hasUpvoted && onUpvote(issue._id)}
            disabled={hasUpvoted}
            style={{
              width: '100%', padding: '12px',
              borderRadius: '10px', border: 'none',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, fontSize: '0.95rem',
              cursor: hasUpvoted ? 'not-allowed' : 'pointer',
              marginBottom: '28px',
              background: hasUpvoted
                ? (dark ? 'rgba(26,86,219,0.2)' : '#eff6ff')
                : 'linear-gradient(135deg, #1a56db, #2563eb)',
              color: hasUpvoted ? '#1a56db' : 'white',
              border: hasUpvoted ? '1.5px solid #bfdbfe' : 'none',
              opacity: hasUpvoted ? 0.8 : 1,
              transition: 'all 0.2s'
            }}>
            {hasUpvoted ? '✅ You upvoted this issue' : `👍 Upvote this Issue (${issue.upvotes})`}
          </button>

          {/* Divider */}
          <div style={{ height: '1px', background: borderColor, marginBottom: '24px' }} />

          {/* Comments */}
          <div>
            <h4 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: textColor, marginBottom: '16px', fontSize: '1rem', fontWeight: 700
            }}>
              💬 Comments ({comments.length})
            </h4>

            {/* Comment Input */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '36px', height: '36px', flexShrink: 0,
                background: '#1a56db', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '0.85rem'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  placeholder="Add a comment..."
                  style={{
                    flex: 1, padding: '10px 14px',
                    borderRadius: '50px',
                    border: `1.5px solid ${borderColor}`,
                    background: inputBg,
                    color: textColor,
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.88rem', outline: 'none'
                  }}
                />
                <button
                  onClick={handleComment}
                  disabled={submitting || !comment.trim()}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '50px', border: 'none',
                    background: '#1a56db', color: 'white',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600, fontSize: '0.85rem',
                    cursor: 'pointer', flexShrink: 0,
                    opacity: (!comment.trim() || submitting) ? 0.6 : 1
                  }}>
                  Post
                </button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: mutedColor, fontSize: '0.9rem' }}>
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px', flexShrink: 0,
                      background: `hsl(${(c.userName?.charCodeAt(0) || 65) * 5}, 60%, 45%)`,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.82rem'
                    }}>
                      {c.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{
                      flex: 1,
                      background: dark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                      border: `1px solid ${borderColor}`,
                      borderRadius: '12px 12px 12px 4px',
                      padding: '10px 14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: textColor }}>
                          {c.userName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: mutedColor }}>
                          {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p style={{ color: mutedColor, fontSize: '0.88rem', lineHeight: 1.5 }}>
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}