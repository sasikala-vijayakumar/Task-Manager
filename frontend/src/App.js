import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadFromStorage, logout as logoutAction } from './store/slices/authSlice';
import { ProfileEditor } from './components/ProfileEditor';
import { LoginPage } from './components/LoginPage';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { TeamleadDashboard } from './components/TeamleadDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { headerStyles } from './styles/dashboardStyles';

function Header({ user, onLogout, onProfileClick }) {
  return (
    <div style={headerStyles.header}>
      <h1 style={headerStyles.title}>Task Manager</h1>
      <div style={headerStyles.userSection}>
        <div style={headerStyles.userInfo}>
          <div style={headerStyles.userName}>{user?.name}</div>
          <div style={headerStyles.userRole}>{user?.role}</div>
        </div>
        <button 
          onClick={onProfileClick} 
          style={headerStyles.iconButton}
          title="Edit profile"
        >
          👤
        </button>
        <button 
          onClick={() => window.location.reload()}
          style={headerStyles.iconButton}
          title="Reload"
        >
          🔄
        </button>
        <button 
          onClick={onLogout}
          style={headerStyles.logoutButton}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function DashboardRouter({ user }) {
  if (user.role === 'employee') {
    return <EmployeeDashboard />;
  }
  if (user.role === 'teamlead') {
    return <TeamleadDashboard />;
  }
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }
  return <div>Unknown role</div>;
}

export default function App() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  useEffect(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  const onLogout = () => {
    dispatch(logoutAction());
  };

  if (auth.status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!auth.user) {
    return <LoginPage />;
  }

  return (
    <div>
      <Header 
        user={auth.user}
        onLogout={onLogout}
        onProfileClick={() => setProfileEditorOpen(true)}
      />
      <DashboardRouter user={auth.user} />
      <ProfileEditor 
        isOpen={profileEditorOpen}
        onClose={() => setProfileEditorOpen(false)}
      />
    </div>
  );
}
