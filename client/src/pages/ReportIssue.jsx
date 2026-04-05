import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Logo from '../Logo';
import { useTheme } from '../ThemeContext';


// Fix default marker icon bug in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ setLocation, setAddress }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } catch {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    }
  });
  return null;
}

export default function ReportIssue() {
  const [form, setForm] = useState({ title: '', description: '', category: 'Road' });
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();

  const getLiveLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        setMapCenter([lat, lng]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch {
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
        setLocLoading(false);
      },
      () => {
        alert('Location access denied. Please allow location access in your browser.');
        setLocLoading(false);
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!image) return null;
    setImageLoading(true);
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    setImageLoading(false);
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!location) {
      setMessage('Please select your location first!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage();
      }
      await axios.post('http://localhost:5000/api/issues', {
        ...form,
        imageUrl,
        location: { lat: location.lat, lng: location.lng, address }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Issue reported successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div>
      {/* ✅ Fixed: Proper Fixora navbar with Logo and correct branding */}
      <nav className="navbar">
        <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
          Back
        </button>
      </nav>

      <div className="form-container" style={{ maxWidth: '650px' }}>
        <h2>📝 Report an Issue</h2>

        <div className="form-group">
          <label>Issue Title</label>
          <input className="form-input"
            placeholder="e.g. Large pothole on MG Road"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea className="form-input"
            placeholder="Describe the issue in detail..."
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select className="form-input" value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>Road</option>
            <option>Water</option>
            <option>Electricity</option>
            <option>Sanitation</option>
            <option>Other</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>📷 Upload Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-input"
            style={{ padding: '8px' }}
          />
          {imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #1a56db' }}
              />
            </div>
          )}
        </div>

        {/* Location Section */}
        <div className="form-group">
          <label>📍 Location</label>
          <button className="btn btn-primary"
            onClick={getLiveLocation}
            disabled={locLoading}
            style={{ width: '100%', marginBottom: '10px' }}>
            {locLoading ? '⏳ Getting your location...' : '📍 Use My Live Location'}
          </button>

          {address && (
            <div style={{ backgroundColor: '#eaf2fb', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '0.9rem', color: '#1a3c5e' }}>
              📌 {address}
            </div>
          )}

          <MapContainer
            center={mapCenter}
            zoom={location ? 15 : 5}
            style={{ height: '350px', width: '100%', borderRadius: '10px' }}
            key={mapCenter.toString()}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            <LocationPicker setLocation={setLocation} setAddress={setAddress} />
            {location && <Marker position={[location.lat, location.lng]} />}
          </MapContainer>

          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
            💡 Click "Use My Live Location" OR click anywhere on the map to drop a pin
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit}
          disabled={imageLoading}
          style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }}>
          {imageLoading ? '⏳ Uploading image...' : '🚀 Submit Issue'}
        </button>

        {message && (
          <p className={message.includes('success') ? 'alert-success' : 'alert-error'}>
            {message}
          </p>
        )}
      </div>
        
      <footer className="footer">© 2026 <span>Fixora</span>. All rights reserved.</footer>
    </div>
  );
}