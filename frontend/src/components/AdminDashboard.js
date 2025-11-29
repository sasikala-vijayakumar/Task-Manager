import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, startTask, stopTask, createTask, updateTask, deleteTask } from '../store/slices/tasksSlice';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/usersSlice';
import { TaskModal, UserModal } from './Modal';
import { dashboardStyles } from '../styles/dashboardStyles';

export function AdminDashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const tasks = useSelector((s) => s.tasks.items || []);
  const users = useSelector((s) => s.users.items || []);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [taskCurrentPage, setTaskCurrentPage] = useState(1);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchUsers());
  }, [dispatch]);

  const onStart = (id) => dispatch(startTask(id));
  const onStop = (id) => dispatch(stopTask(id));

  const handleCreateTask = (formData) => {
    dispatch(createTask(formData));
    setTaskModalOpen(false);
  };

  const handleUpdateTask = (formData) => {
    dispatch(updateTask({ id: selectedTask.id, ...formData }));
    setTaskModalOpen(false);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
    }
  };

  const handleCreateUser = (formData) => {
    dispatch(createUser(formData));
    setUserModalOpen(false);
  };

  const handleUpdateUser = (formData) => {
    dispatch(updateUser({ id: selectedUser.id, ...formData }));
    setUserModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  const openCreateTaskModal = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const openCreateUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const openEditUserModal = (u) => {
    setSelectedUser(u);
    setUserModalOpen(true);
  };

  const paginatedTasks = tasks.slice((taskCurrentPage - 1) * itemsPerPage, taskCurrentPage * itemsPerPage);
  const taskTotalPages = Math.ceil(tasks.length / itemsPerPage);

  const paginatedUsers = users.slice((userCurrentPage - 1) * itemsPerPage, userCurrentPage * itemsPerPage);
  const userTotalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <div style={dashboardStyles.dashboardContainer}>
      <h2 style={dashboardStyles.dashboardTitle}>Admin Dashboard</h2>

      {/* Tasks Section */}
      <div style={dashboardStyles.dashboardSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={dashboardStyles.dashboardSectionTitle}>Tasks</h3>
          <button onClick={openCreateTaskModal} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallPrimary}}>+ New Task</button>
        </div>

        <table style={dashboardStyles.dashboardTable}>
          <thead>
            <tr>
              <th style={dashboardStyles.dashboardTableTh}>Title</th>
              <th style={dashboardStyles.dashboardTableTh}>Assigned To</th>
              <th style={dashboardStyles.dashboardTableTh}>Team Lead</th>
              <th style={dashboardStyles.dashboardTableTh}>Status</th>
              <th style={dashboardStyles.dashboardTableTh}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map(t => {
              const teamLeadName = t.team ? (users.find(u => u.team === t.team && u.role === 'teamlead')?.name || '-') : '-';
              return (
                <tr key={t.id}>
                  <td style={dashboardStyles.dashboardTableTd}><strong>{t.title}</strong></td>
                  <td style={dashboardStyles.dashboardTableTd}>{t.assigned_name || 'Unassigned'}</td>
                  <td style={dashboardStyles.dashboardTableTd}>{teamLeadName}</td>
                  <td style={dashboardStyles.dashboardTableTd}>
                    <span style={{
                      ...dashboardStyles.badgeBase,
                      ...(t.status === 'open' ? dashboardStyles.badgeOpen :
                        t.status === 'in-progress' ? dashboardStyles.badgeInProgress :
                        dashboardStyles.badgeCompleted)
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={dashboardStyles.dashboardTableTd}>
                    {t.status === 'open' && (
                      <button onClick={() => onStart(t.id)} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallSuccess, marginRight: '5px'}}>Start</button>
                    )}
                    {t.status === 'in-progress' && (
                      <button onClick={() => onStop(t.id)} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallPrimary, marginRight: '5px'}}>Stop</button>
                    )}
                    <button onClick={() => openEditTaskModal(t)} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallOutline, marginRight: '5px'}}>Edit</button>
                    <button onClick={() => handleDeleteTask(t.id)} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallDanger}}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div style={dashboardStyles.noData}>No tasks yet</div>
        )}

        {taskTotalPages > 1 && (
          <div style={dashboardStyles.pagination}>
            <button 
              onClick={() => setTaskCurrentPage(p => Math.max(1, p - 1))} 
              disabled={taskCurrentPage === 1}
              style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallOutline}}
            >
              ← Previous
            </button>
            <span style={{ margin: '0 10px', color: '#666' }}>
              Page {taskCurrentPage} of {taskTotalPages}
            </span>
            <button 
              onClick={() => setTaskCurrentPage(p => Math.min(taskTotalPages, p + 1))} 
              disabled={taskCurrentPage === taskTotalPages}
              style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallOutline}}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Users Section */}
      <div style={dashboardStyles.dashboardSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={dashboardStyles.dashboardSectionTitle}>Users</h3>
          <button onClick={openCreateUserModal} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallPrimary}}>+ New User</button>
        </div>

        <table style={dashboardStyles.dashboardTable}>
          <thead>
            <tr>
              <th style={dashboardStyles.dashboardTableTh}>Name</th>
              <th style={dashboardStyles.dashboardTableTh}>Email</th>
              <th style={dashboardStyles.dashboardTableTh}>Role</th>
              <th style={dashboardStyles.dashboardTableTh}>Team</th>
              <th style={dashboardStyles.dashboardTableTh}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(u => (
              <tr key={u.id}>
                <td style={dashboardStyles.dashboardTableTd}><strong>{u.name}</strong></td>
                <td style={dashboardStyles.dashboardTableTd}>{u.email}</td>
                <td style={dashboardStyles.dashboardTableTd}>
                  <span style={{
                    ...dashboardStyles.badgeBase,
                    backgroundColor: u.role === 'admin' ? '#e3f2fd' : u.role === 'teamlead' ? '#fff3e0' : '#f3e5f5',
                    color: u.role === 'admin' ? '#1976d2' : u.role === 'teamlead' ? '#f57c00' : '#7b1fa2'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={dashboardStyles.dashboardTableTd}>{u.team || '-'}</td>
                <td style={dashboardStyles.dashboardTableTd}>
                  <button onClick={() => openEditUserModal(u)} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallOutline, marginRight: '5px'}}>Edit</button>
                  <button onClick={() => handleDeleteUser(u.id)} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallDanger}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={dashboardStyles.noData}>No users yet</div>
        )}

        {userTotalPages > 1 && (
          <div style={dashboardStyles.pagination}>
            <button 
              onClick={() => setUserCurrentPage(p => Math.max(1, p - 1))} 
              disabled={userCurrentPage === 1}
              style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallOutline}}
            >
              ← Previous
            </button>
            <span style={{ margin: '0 10px', color: '#666' }}>
              Page {userCurrentPage} of {userTotalPages}
            </span>
            <button 
              onClick={() => setUserCurrentPage(p => Math.min(userTotalPages, p + 1))} 
              disabled={userCurrentPage === userTotalPages}
              style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallOutline}}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <TaskModal 
        task={selectedTask}
        onClose={() => setTaskModalOpen(false)}
        onSave={selectedTask ? handleUpdateTask : handleCreateTask}
        isOpen={taskModalOpen}
        teamMembers={users}
        userRole={user.role}
        allUsers={users}
      />

      <UserModal 
        user={selectedUser}
        onClose={() => setUserModalOpen(false)}
        onSave={selectedUser ? handleUpdateUser : handleCreateUser}
        isOpen={userModalOpen}
      />
    </div>
  );
}
