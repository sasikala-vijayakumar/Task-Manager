// src/utils/tokens.js
const jwt = require('jsonwebtoken');
const ms = (str) => {
  // minimal parser: '15m' => minutes, '7d' => days
  const num = parseInt(str.slice(0, -1), 10);
  const unit = str.slice(-1);
  if (unit === 'm') return num * 60 * 1000;
  if (unit === 'h') return num * 60 * 60 * 1000;
  if (unit === 'd') return num * 24 * 60 * 60 * 1000;
  return num * 1000;
};

const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const refreshExpiresAt = () => {
  const ttl = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  return new Date(Date.now() + ms(ttl));
};

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, refreshExpiresAt };
