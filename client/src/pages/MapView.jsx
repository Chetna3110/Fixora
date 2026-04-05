import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';

// ── Fix default leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom colored markers based on status
const createIcon = (color) => L.divIcon({
  className: '',
  html: `
    <div style="
      width: 32px; height: 32px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 10px; height: 10px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const statusConfig = {
  'Pending':     { color: '#dc2626', label: '⏳ Pending' },
  'In Progress': { color: '#d97706', label: '🔧 In Progress' },
  'Resolved':    { color: '#059669', label: '✅ Resolved' },
};

const categoryEmoji = {
  'Road': '🛣️',
  'Water': '💧',
  'Electricity': '⚡',
  'Sanitation': '🗑️',
  'Other': '📌',
};

export default function MapView() {
  const [issues, setIssues] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    let result = issues.filter(i => i.location?.lat && i.location?.lng);
    if (statusFilter !== 'All') result = result.filter(i => i.status === statusFilter);
    if (categoryFilter !== 'All') result = result.filter(i => i.category === categoryFilter);
    setFiltered(result);
  }, [issues, statusFilter, categoryFilter]);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  // Find center — average of all issue coords, fallback to India center
  const getCenter = () => {
    const withCoords = issues.filter(i => i.location?.lat && i.location?.lng);
    if (!withCoords.length) return [20.5937, 78.9629];
    const avgLat = withCoords.reduce((s, i) => s + i.location.lat, 0) / withCoords.length;
    const avgLng = withCoords.reduce((s, i) => s + i.location.lng, 0) / withCoords.length;
    return [avgLat, avgLng];
  };

  const pending = issues.filter(i => i.status === 'Pending').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  const cardBg = dark ? 'rgba(17,34,64,0.97)' : 'white';
  const border = dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 62px)' }}>

      {/* ── Top Bar */}
      <div style={{
        background: cardBg, borderBottom: `1px solid ${border}`,
        padding: '14px 24px', display: 'flex',
        alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 100
      }}>

        {/* Title */}
        <div style={{ marginRight: '8px' }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '1.1rem', fontWeight: 800,
            color: 'var(--text)', margin: 0
          }}>🗺️ Live Issue Map</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
            {filtered.length} issues shown
          </p>
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Pending', value: pending, color: '#dc2626', bg: dark ? 'rgba(220,38,38,0.15)' : '#fef2f2' },
            { label: 'In Progress', value: inProgress, color: '#d97706', bg: dark ? 'rgba(217,119,6,0.15)' : '#fffbeb' },
            { label: 'Resolved', value: resolved, color: '#059669', bg: dark ? 'rgba(5,150,105,0.15)' : '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.color}33`,
              borderRadius: '50px', padding: '4px 12px',
              fontSize: '0.78rem', fontWeight: 700, color: s.color,
              display: 'flex', alignItems: 'center', gap: '5px'
            }}>
              {s.value} {s.label}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '8px',
              border: `1.5px solid ${border}`,
              background: cardBg, color: 'var(--text)',
              fontFamily: 'Outfit, sans-serif', fontSize: '0.83rem',
              cursor: 'pointer', outline: 'none'
            }}>
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '8px',
              border: `1.5px solid ${border}`,
              background: cardBg, color: 'var(--text)',
              fontFamily: 'Outfit, sans-serif', fontSize: '0.83rem',
              cursor: 'pointer', outline: 'none'
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

      {/* ── Map + Sidebar layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* MAP */}
        <div style={{ flex: 1, position: 'relative' }}>
          {loading ? (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: dark ? '#0a0f1a' : '#f4f6fb',
              flexDirection: 'column', gap: '12px'
            }}>
              <div style={{ fontSize: '2rem' }}>🗺️</div>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>Loading map...</p>
            </div>
          ) : (
            <MapContainer
              center={getCenter()}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}>

              {/* Tile layer — switches based on theme */}
              <TileLayer
                url={dark
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {filtered.map(issue => {
                const lat = issue.location.lat;
                const lng = issue.location.lng;                const config = statusConfig[issue.status] || statusConfig['Pending'];
                const icon = createIcon(config.color);

                return (
                  <Marker
                    key={issue._id}
                    position={[lat, lng]}
                    icon={icon}
                    eventHandlers={{ click: () => setSelectedIssue(issue) }}>
                    <Popup>
                      <div style={{ fontFamily: 'Outfit, sans-serif', minWidth: '200px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                          {categoryEmoji[issue.category] || '📌'} {issue.title}
                        </div>
                        <div style={{
                          display: 'inline-block',
                          background: config.color + '22',
                          color: config.color,
                          borderRadius: '50px', padding: '2px 10px',
                          fontSize: '0.75rem', fontWeight: 700,
                          marginBottom: '8px'
                        }}>
                          {config.label}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 8px' }}>
                          {issue.description?.slice(0, 80)}...
                        </p>
                        <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                          👤 {issue.reportedBy?.name} · 👍 {issue.upvotes}
                        </div>
                      </div>
                    </Popup>

                    {/* Pulse circle for Pending issues */}
                    {issue.status === 'Pending' && (
                      <Circle
                        center={[lat, lng]}
                        radius={80}
                        pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.1, weight: 1 }}
                      />
                    )}
                  </Marker>
                );
              })}
            </MapContainer>
          )}

          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: '24px', left: '14px', zIndex: 1000,
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: '12px', padding: '12px 16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Legend
            </div>
            {Object.entries(statusConfig).map(([status, cfg]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text)', fontFamily: 'Outfit, sans-serif' }}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SIDEBAR — issue detail */}
        {selectedIssue && (
          <div style={{
            width: '300px', flexShrink: 0,
            background: cardBg, borderLeft: `1px solid ${border}`,
            overflowY: 'auto', padding: '20px',
            animation: 'slideIn 0.25s ease'
          }}>
            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', margin: 0, fontSize: '1rem' }}>
                Issue Details
              </h3>
              <button onClick={() => setSelectedIssue(null)}
                style={{
                  background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                  border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px',
                  cursor: 'pointer', color: 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✕</button>
            </div>

            {/* Image */}
            {selectedIssue.imageUrl && (
              <img src={selectedIssue.imageUrl} alt="Issue"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px', border: `1px solid ${border}` }} />
            )}

            {/* Title + status */}
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ color: 'var(--text)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '6px', fontSize: '0.95rem' }}>
                {categoryEmoji[selectedIssue.category] || '📌'} {selectedIssue.title}
              </h4>
              <span style={{
                display: 'inline-block',
                background: (statusConfig[selectedIssue.status]?.color || '#dc2626') + '22',
                color: statusConfig[selectedIssue.status]?.color || '#dc2626',
                borderRadius: '50px', padding: '3px 12px',
                fontSize: '0.75rem', fontWeight: 700
              }}>
                {statusConfig[selectedIssue.status]?.label}
              </span>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '14px' }}>
              {selectedIssue.description}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { icon: '📁', label: selectedIssue.category },
                { icon: '👤', label: selectedIssue.reportedBy?.name || 'Unknown' },
                { icon: '👍', label: `${selectedIssue.upvotes} upvotes` },
                { icon: '📍', label: selectedIssue.location?.address || 'No address' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  fontSize: '0.82rem', color: 'var(--text-muted)'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Resolution note */}
            {selectedIssue.resolutionNote && (
              <div style={{
                background: dark ? 'rgba(5,150,105,0.12)' : '#f0fdf4',
                border: '1px solid rgba(5,150,105,0.25)',
                borderRadius: '8px', padding: '10px 12px',
                fontSize: '0.82rem', color: dark ? '#6ee7b7' : '#16a34a',
                marginBottom: '14px'
              }}>
                📝 {selectedIssue.resolutionNote}
              </div>
            )}

            {/* Go to dashboard button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem', borderRadius: '8px' }}>
              View in Dashboard →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-content {
          margin: 14px 16px !important;
        }
      `}</style>
    </div>
  );
}