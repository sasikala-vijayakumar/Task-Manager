// src/models/userModel.js
const pool = require('../config/db');

const createUser = async ({ name, email, password, role = 'employee', team = null }) => {
  const res = await pool.query(
    `INSERT INTO users (name,email,password,role,team) VALUES ($1,$2,$3,$4,$5)
     RETURNING id,name,email,role,team,created_at`
    , [name, email, password, role, team]
  );
  return res.rows[0];
};

const findUserByEmail = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  return res.rows[0];
};

const findUserById = async (id) => {
  const res = await pool.query('SELECT id,name,email,role,team,created_at FROM users WHERE id=$1', [id]);
  return res.rows[0];
};

const findUserWithPasswordByEmail = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  return res.rows[0]; // includes password
};

const findUsersByTeam = async (team) => {
  const res = await pool.query('SELECT id,name,email,role,team,created_at FROM users WHERE team=$1 AND role=$2 ORDER BY name', [team, 'employee']);
  return res.rows;
};

const findAllUsers = async () => {
  const res = await pool.query('SELECT id,name,email,role,team,created_at FROM users ORDER BY created_at DESC');
  return res.rows;
};

const deleteUser = async (id) => {
  const res = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
  return res.rows[0];
};

const updateUser = async (id, { name, email, password }) => {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name=$${paramCount++}`);
    values.push(name);
  }
  if (email !== undefined) {
    updates.push(`email=$${paramCount++}`);
    values.push(email);
  }
  if (password !== undefined) {
    updates.push(`password=$${paramCount++}`);
    values.push(password);
  }

  if (updates.length === 0) return await findUserById(id);

  values.push(id);
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id=$${paramCount} RETURNING id,name,email,role,team,created_at`;
  const res = await pool.query(query, values);
  return res.rows[0];
};

module.exports = { createUser, findUserByEmail, findUserById, findUserWithPasswordByEmail, findUsersByTeam, findAllUsers, deleteUser, updateUser };
