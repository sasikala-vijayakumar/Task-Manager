import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, startTask, stopTask } from '../store/slices/tasksSlice';
import { dashboardStyles } from '../styles/dashboardStyles';

export function EmployeeDashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const tasks = useSelector((s) => s.tasks.items || []);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const onStart = (id) => dispatch(startTask(id));
  const onStop = (id) => dispatch(stopTask(id));

  const paginatedTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  return (
    <div style={dashboardStyles.dashboardContainer}>
      <h2 style={dashboardStyles.dashboardTitle}>Employee Dashboard</h2>
      
      <div style={dashboardStyles.dashboardSection}>
        <h3 style={dashboardStyles.dashboardSectionTitle}>My Tasks</h3>
        
        <table style={dashboardStyles.dashboardTable}>
          <thead>
            <tr>
              <th style={dashboardStyles.dashboardTableTh}>Title</th>
              <th style={dashboardStyles.dashboardTableTh}>Description</th>
              <th style={dashboardStyles.dashboardTableTh}>Status</th>
              <th style={dashboardStyles.dashboardTableTh}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map(t => (
              <tr key={t.id}>
                <td style={dashboardStyles.dashboardTableTd}><strong>{t.title}</strong></td>
                <td style={dashboardStyles.dashboardTableTd}>{t.description}</td>
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
                    <button onClick={() => onStart(t.id)} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallSuccess}}>Start</button>
                  )}
                  {t.status === 'in-progress' && (
                    <button onClick={() => onStop(t.id)} style={{...dashboardStyles.buttonSmall, ...dashboardStyles.buttonSmallPrimary}}>Stop</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div style={dashboardStyles.noData}>No tasks assigned</div>
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
    </div>
  );
}
