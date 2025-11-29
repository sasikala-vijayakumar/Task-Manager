import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, startTask, stopTask, createTask, updateTask, deleteTask } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { TaskModal } from './Modal';
import { dashboardStyles } from '../styles/dashboardStyles';

export function TeamleadDashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const tasks = useSelector((s) => s.tasks.items || []);
  const users = useSelector((s) => s.users.items || []);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const openCreateTaskModal = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const paginatedTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  return (
    <div style={dashboardStyles.dashboardContainer}>
      <h2 style={dashboardStyles.dashboardTitle}>Team Lead Dashboard</h2>
      
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
              <th style={dashboardStyles.dashboardTableTh}>Status</th>
              <th style={dashboardStyles.dashboardTableTh}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map(t => (
              <tr key={t.id}>
                <td style={dashboardStyles.dashboardTableTd}><strong>{t.title}</strong></td>
                <td style={dashboardStyles.dashboardTableTd}>{t.assigned_name || 'Unassigned'}</td>
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
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div style={dashboardStyles.noData}>No tasks yet</div>
        )}

        {totalPages > 1 && (
          <div style={dashboardStyles.pagination}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallOutline}}
            >
              ← Previous
            </button>
            <span style={{ margin: '0 10px', color: '#666' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
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
    </div>
  );
}
