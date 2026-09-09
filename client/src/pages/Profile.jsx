import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const token = localStorage.getItem('token');

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/issues`);
      setIssues(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const myIssues = issues.filter(i =>
    i.reportedBy?._id === user?.id || i.reportedBy === user?.id
  );
  const totalReported = myIssues.length;
  const totalResolved = myIssues.filter(i => i.status === 'Resolved').length;
  const totalPending = myIssues.filter(i => i.status !== 'Resolved').length;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return user?.profileImage || '';
    setUploading(true);
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    setUploading(false);
    return data.secure_url;
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMsg('');
    try {
      let profileImage = user?.profileImage || '';
      if (imageFile) {
        profileImage = await uploadImageToCloudinary();
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        { name, bio, profileImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, name: res.data.name, bio: res.data.bio, profileImage: res.data.profileImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setImageFile(null);
      setEditing(false);
      setMsg('success:Profile updated successfully!');
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Something went wrong'));
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPwMsg('error:Please fill in both fields');
      return;
    }
    setPwSaving(true);
    setPwMsg('');
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwMsg('success:Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordForm(false), 1500);
    } catch (err) {
      setPwMsg('error:' + (err.response?.data?.message || 'Something went wrong'));
    }
    setPwSaving(false);
  };

  const isSuccess = msg.startsWith('success:');
  const msgText = msg.split(':').slice(1).join(':');
  const isPwSuccess = pwMsg.startsWith('success:');
  const pwMsgText = pwMsg.split(':').slice(1).join(':');

  return (
    <div className="page-container" style={{ maxWidth: '820px' }}>

      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1f7a4d 0%, #2f9e63 100%)',
        borderRadius: '16px', padding: '36px 32px',
        marginBottom: '24px', color: 'white',
        display: 'flex', alignItems: 'center', gap: '24px',
        flexWrap: 'wrap', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px',
          width: '200px', height: '200px',
          background: 'rgba(255,255,255,0.06)', borderRadius: '50%'
        }} />

        {/* Avatar */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', fontWeight: 800
          }}>
            {imagePreview
              ? <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user?.name?.charAt(0).toUpperCase()}
          </div>
          {editing && (
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'white', borderRadius: '50%',
              width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              📷
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: '200px' }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
            {user?.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', marginBottom: '6px' }}>{user?.email}</p>
          <span style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
            padding: '3px 12px', borderRadius: '50px', fontSize: '0.72rem',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {user?.role}
          </span>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          style={{
            background: 'white', color: '#1f7a4d',
            border: 'none', borderRadius: '8px',
            padding: '10px 18px', fontWeight: 700,
            fontSize: '0.85rem', cursor: 'pointer',
            position: 'relative', zIndex: 1
          }}>
          {editing ? 'Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Issues Reported', value: totalReported, color: '#2f9e63' },
          { label: 'Resolved', value: totalResolved, color: '#16a34a' },
          { label: 'Pending', value: totalPending, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--card)', border: '1px solid var(--card-border)',
            borderTop: `3px solid ${s.color}`, borderRadius: '12px',
            padding: '18px', textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.7rem', fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginTop: '4px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Editable / view bio + name */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--card-border)',
        borderRadius: '14px', padding: '24px', marginBottom: '20px'
      }}>
        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
          About
        </h3>

        {editing ? (
          <>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Tell your community a bit about yourself..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            {msg && (
              <p className={isSuccess ? 'alert-success' : 'alert-error'} style={{ marginBottom: '12px' }}>
                {msgText}
              </p>
            )}
            <button
              className="btn btn-primary"
              onClick={handleSaveProfile}
              disabled={saving || uploading}
              style={{ padding: '10px 22px' }}>
              {saving || uploading ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {user?.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
          </p>
        )}
      </div>

      {/* Password change */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--card-border)',
        borderRadius: '14px', padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPasswordForm ? '16px' : '0' }}>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
            🔒 Password
          </h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            style={{
              background: 'var(--section-label-bg)', border: '1px solid var(--section-label-border)',
              color: 'var(--gold-dark)', borderRadius: '8px', padding: '7px 14px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
            }}>
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <>
            <div className="form-group">
              <label>Current Password</label>
              <input
                className="form-input" type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                className="form-input" type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            {pwMsg && (
              <p className={isPwSuccess ? 'alert-success' : 'alert-error'} style={{ marginBottom: '12px' }}>
                {pwMsgText}
              </p>
            )}
            <button
              className="btn btn-primary"
              onClick={handleChangePassword}
              disabled={pwSaving}
              style={{ padding: '10px 22px' }}>
              {pwSaving ? '⏳ Updating...' : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}