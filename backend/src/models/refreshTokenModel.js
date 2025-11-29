// src/models/refreshTokenModel.js
const pool = require('../config/db');

const addRefreshToken = async ({ user_id, token, expires_at }) => {
  const res = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3) RETURNING id, user_id, token, expires_at, revoked`,
    [user_id, token, expires_at]
  );
  return res.rows[0];
};

const findRefreshToken = async (token) => {
  const res = await pool.query('SELECT * FROM refresh_tokens WHERE token=$1', [token]);
  return res.rows[0];
};

const revokeRefreshToken = async (token) => {
  await pool.query('UPDATE refresh_tokens SET revoked=true WHERE token=$1', [token]);
};

const revokeAllUserRefreshTokens = async (user_id) => {
  await pool.query('UPDATE refresh_tokens SET revoked=true WHERE user_id=$1', [user_id]);
};

module.exports = { addRefreshToken, findRefreshToken, revokeRefreshToken, revokeAllUserRefreshTokens };
