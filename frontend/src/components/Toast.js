import { useEffect } from 'react';

export function Toast({ message, type = 'success', duration = 3000, onClose }) {
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const backgroundColor = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1';
  const color = type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460';
  const borderColor = type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb';

  return (
    <div style={styles.toastContainer}>
      <div
        style={{
          ...styles.toast,
          backgroundColor,
          color,
          borderColor,
        }}
      >
        <div style={styles.toastContent}>
          <span style={styles.toastIcon}>
            {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          style={styles.toastClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const styles = {
  toastContainer: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 2000,
    maxWidth: '400px',
  },
  toast: {
    padding: '16px',
    borderRadius: '4px',
    border: '1px solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  toastContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  toastIcon: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  toastClose: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    opacity: 0.7,
    marginLeft: '10px',
  },
};
