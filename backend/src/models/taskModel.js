// src/models/taskModel.js
const pool = require('../config/db');

const createTask = async ({ title, description, created_by, assigned_to = null, team = null }) => {
  const res = await pool.query(
    `INSERT INTO tasks (title, description, created_by, assigned_to, team, status)
     VALUES ($1,$2,$3,$4,$5,'open') RETURNING *`,
    [title, description, created_by, assigned_to, team]
  );
  return res.rows[0];
};

const findTaskById = async (id) => {
  const res = await pool.query('SELECT * FROM tasks WHERE id=$1', [id]);
  return res.rows[0];
};

const findTasksForUser = async (user) => {
  const query = `
    SELECT t.*, u.name as assigned_name 
    FROM tasks t 
    LEFT JOIN users u ON t.assigned_to = u.id
  `;
  
  if (user.role === 'admin') {
    const res = await pool.query(query + ' ORDER BY t.created_at DESC');
    return res.rows;
  }
  if (user.role === 'teamlead') {
    const res = await pool.query(
      query + ' WHERE t.team=$1 OR t.assigned_to=$2 ORDER BY t.created_at DESC', 
      [user.team, user.id]
    );
    return res.rows;
  }
  // employee
  const res = await pool.query(
    query + ' WHERE t.assigned_to=$1 ORDER BY t.created_at DESC', 
    [user.id]
  );
  return res.rows;
};

const assignTask = async (taskId, assigned_to, team) => {
  const res = await pool.query('UPDATE tasks SET assigned_to=$1, team=$2 WHERE id=$3 RETURNING *', [assigned_to, team, taskId]);
  return res.rows[0];
};

const startTask = async (taskId) => {
  const res = await pool.query("UPDATE tasks SET status='in-progress', started_at=now() WHERE id=$1 RETURNING *", [taskId]);
  return res.rows[0];
};

const stopTask = async (taskId) => {
  const res = await pool.query("UPDATE tasks SET status='completed', stopped_at=now() WHERE id=$1 RETURNING *", [taskId]);
  return res.rows[0];
};

const updateTask = async (id, { title, description, assigned_to, status, team }) => {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (title !== undefined) {
    updates.push(`title=$${paramCount++}`);
    values.push(title);
  }
  if (description !== undefined) {
    updates.push(`description=$${paramCount++}`);
    values.push(description);
  }
  if (assigned_to !== undefined) {
    updates.push(`assigned_to=$${paramCount++}`);
    values.push(assigned_to);
  }
  if (status !== undefined) {
    updates.push(`status=$${paramCount++}`);
    values.push(status);
  }
  if (team !== undefined) {
    updates.push(`team=$${paramCount++}`);
    values.push(team);
  }

  if (updates.length === 0) return await findTaskById(id);

  values.push(id);
  const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id=$${paramCount} RETURNING *`;
  const res = await pool.query(query, values);
  return res.rows[0];
};

const deleteTask = async (id) => {
  const res = await pool.query('DELETE FROM tasks WHERE id=$1 RETURNING id', [id]);
  return res.rows[0];
};

module.exports = { createTask, findTaskById, findTasksForUser, assignTask, startTask, stopTask, updateTask, deleteTask };
