import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Toast } from './Toast';

export function ProfileEditor({ isOpen, onClose }) {
  const user = useSelector((s) => s.auth.user);
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    password: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async () => {
    setToastMessage('');

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setToastType('error');
      setToastMessage('Passwords do not match');
      return;
    }

    if (profileData.newPassword && !profileData.password) {
      setToastType('error');
      setToastMessage('Current password required to change password');
      return;
    }

    setIsSaving(true);
    try {
      const token = (window.localStorage && window.localStorage.getItem('accessToken')) || null;
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          password: profileData.password || undefined,
          newPassword: profileData.newPassword || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setToastType('success');
        setToastMessage('Profile updated successfully');
        setProfileData({ name: data.name, email: data.email, password: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setToastType('error');
        setToastMessage(data.msg || 'Error updating profile');
      }
    } catch (err) {
      setToastType('error');
      setToastMessage('Error updating profile');
      console.error(err);
    }
    setIsSaving(false);
  };

  const handleClose = () => {
    onClose();
    setToastMessage('');
    setProfileData({ 
      name: user?.name || '', 
      email: user?.email || '', 
      password: '', 
      newPassword: '', 
      confirmPassword: '' 
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div style={styles.modalOverlay} onClick={handleClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h3>Edit Profile</h3>
            <button onClick={handleClose} style={styles.closeButton}>✕</button>
          </div>

        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input 
              style={styles.input}
              value={profileData.name} 
              onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
              placeholder="Your name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input 
              style={styles.input}
              value={profileData.email} 
              onChange={e => setProfileData({ ...profileData, email: e.target.value })} 
              placeholder="Your email"
              type="email"
            />
          </div>

          <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

          <div style={styles.formGroup}>
            <label style={styles.label}>Current Password (required to change password)</label>
            <input 
              style={styles.input}
              type="password" 
              value={profileData.password} 
              onChange={e => setProfileData({ ...profileData, password: e.target.value })} 
              placeholder="Current password"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>New Password (optional)</label>
            <input 
              style={styles.input}
              type="password" 
              value={profileData.newPassword} 
              onChange={e => setProfileData({ ...profileData, newPassword: e.target.value })} 
              placeholder="New password"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input 
              style={styles.input}
              type="password" 
              value={profileData.confirmPassword} 
              onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })} 
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleClose} style={styles.cancelButton}>Cancel</button>
          <button onClick={handleUpdateProfile} style={styles.saveButton} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>

    <Toast 
      message={toastMessage} 
      type={toastType}
      onClose={() => setToastMessage('')}
    />
    </>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
  },
  form: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '14px',
  },
  success: {
    padding: '10px',
    backgroundColor: '#efe',
    color: '#3c3',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '14px',
  },
  footer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};
