import { useState, useEffect } from 'react';

export function TaskModal({ task, onClose, onSave, isOpen, teamMembers, userRole, allUsers }) {
  const [formData, setFormData] = useState(task || { title: '', description: '', assigned_to: '', team: '' });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        team: task.team || ''
      });
    } else if (isOpen && !task) {
      setFormData({ title: '', description: '', assigned_to: '', team: '' });
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.msg || 'Error saving task');
    }
    setIsSaving(false);
  };

  const handleClose = () => {
    setFormData(task || { title: '', description: '', assigned_to: '', team: '' });
    setError('');
    onClose();
  };

  // Filter to only show team leads for team dropdown (admin only)
  const teamLeads = allUsers ? allUsers.filter(user => user.role === 'teamlead') : [];
  
  // Filter employees based on selected team lead (admin only)
  let employees = teamMembers ? teamMembers.filter(member => member.role === 'employee') : [];
  
  if (userRole === 'admin' && formData.team) {
    // If a team is selected, only show employees under that team
    employees = employees.filter(emp => emp.team === formData.team);
  } else if (userRole === 'admin') {
    // If no team is selected for admin, show no employees (require team selection first)
    employees = [];
  }

  return (
    <div style={styles.modalOverlay} onClick={handleClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3>{task?.id ? 'Edit Task' : 'Create Task'}</h3>
          <button onClick={handleClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input 
              style={styles.input}
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              placeholder="Task title"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea 
              style={{ ...styles.input, minHeight: '100px', fontFamily: 'inherit' }}
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Task description"
            />
          </div>

          {userRole === 'admin' && teamLeads && teamLeads.length > 0 && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Team Lead</label>
              <select 
                style={styles.input}
                value={formData.team || ''} 
                onChange={e => {
                  const selectedTeamLeadId = e.target.value ? parseInt(e.target.value, 10) : '';
                  const selectedTeamLead = teamLeads.find(lead => lead.id === selectedTeamLeadId);
                  setFormData({ ...formData, team: selectedTeamLead ? selectedTeamLead.team : '', assigned_to: '' });
                }}
              >
                <option value="">Select Team Lead</option>
                {teamLeads.map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name}</option>
                ))}
              </select>
            </div>
          )}

          {employees && employees.length > 0 && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Assign To {userRole === 'admin' && !formData.team && <span style={{ color: '#999', fontSize: '12px' }}>(Select team lead first)</span>}</label>
              <select 
                style={styles.input}
                value={formData.assigned_to || ''} 
                onChange={e => setFormData({ ...formData, assigned_to: e.target.value ? parseInt(e.target.value, 10) : '' })}
                disabled={userRole === 'admin' && !formData.team}
              >
                <option value="">Unassigned</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.footer}>
          <button onClick={handleClose} style={styles.cancelButton}>Cancel</button>
          <button onClick={handleSave} style={styles.saveButton} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserModal({ user, onClose, onSave, isOpen }) {
  const [formData, setFormData] = useState(user || { name: '', email: '', role: 'employee' });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.msg || 'Error saving user');
    }
    setIsSaving(false);
  };

  const handleClose = () => {
    setFormData(user || { name: '', email: '', role: 'employee' });
    setError('');
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={handleClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3>{user?.id ? 'Edit User' : 'Create User'}</h3>
          <button onClick={handleClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name *</label>
            <input 
              style={styles.input}
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="User name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input 
              style={styles.input}
              type="email"
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              placeholder="User email"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select 
              style={styles.input}
              value={formData.role} 
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="teamlead">Team Lead</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.footer}>
          <button onClick={handleClose} style={styles.cancelButton}>Cancel</button>
          <button onClick={handleSave} style={styles.saveButton} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
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
    zIndex: 999,
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
