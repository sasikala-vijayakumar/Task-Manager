// src/controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { createUser, findUserWithPasswordByEmail, findUserByEmail, findUserById, updateUser } = require('../models/userModel');
const { addRefreshToken, findRefreshToken, revokeRefreshToken } = require('../models/refreshTokenModel');
const { signAccessToken, signRefreshToken, verifyRefreshToken, refreshExpiresAt } = require('../utils/tokens');

const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password, role, team } = req.body;
  try {
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ msg: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password: hashed, role, team: team || null });
    const accessToken = signAccessToken({ id: user.id });
    const refreshToken = signRefreshToken({ id: user.id });

    const expires_at = refreshExpiresAt();
    await addRefreshToken({ user_id: user.id, token: refreshToken, expires_at });

    return res.json({
      user,
      accessToken,
      refreshToken,
      accessTokenExpiresIn: ACCESS_EXPIRES_IN
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await findUserWithPasswordByEmail(email);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, team: user.team };

    const accessToken = signAccessToken({ id: user.id });
    const refreshToken = signRefreshToken({ id: user.id });
    const expires_at = refreshExpiresAt();
    await addRefreshToken({ user_id: user.id, token: refreshToken, expires_at });

    return res.json({ user: safeUser, accessToken, refreshToken, accessTokenExpiresIn: ACCESS_EXPIRES_IN });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ msg: 'Refresh token required' });

    // verify token signature
    const payload = verifyRefreshToken(refreshToken);
    if (!payload || !payload.id) return res.status(401).json({ msg: 'Invalid refresh token' });

    // confirm stored and not revoked and not expired
    const stored = await findRefreshToken(refreshToken);
    if (!stored || stored.revoked) return res.status(401).json({ msg: 'Refresh token revoked or not found' });

    // optionally, check expiry in DB (expires_at)
    const now = new Date();
    if (new Date(stored.expires_at) < now) return res.status(401).json({ msg: 'Refresh token expired' });

    // issue new tokens
    const accessToken = signAccessToken({ id: payload.id });
    const newRefreshToken = signRefreshToken({ id: payload.id });
    const expires_at = refreshExpiresAt();

    // revoke old refresh token and store new one
    await revokeRefreshToken(refreshToken);
    await addRefreshToken({ user_id: payload.id, token: newRefreshToken, expires_at });

    return res.json({ accessToken, refreshToken: newRefreshToken, accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: 'Refresh token invalid' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ msg: 'Refresh token required' });
    await revokeRefreshToken(refreshToken);
    return res.json({ msg: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.me = async (req, res) => {
  // this route should be protected by auth middleware
  try {
    const user = await findUserById(req.user.id);
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, newPassword } = req.body;
    const userId = req.user.id;

    // If changing password, verify old password
    if (newPassword) {
      if (!password) return res.status(400).json({ msg: 'Current password required to change password' });
      const user = await findUserWithPasswordByEmail((await findUserById(userId)).email);
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Check if email is already taken by another user
    if (email) {
      const existing = await findUserByEmail(email);
      if (existing && existing.id !== userId) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    // Hash new password if provided
    const hashedPassword = newPassword ? await bcrypt.hash(newPassword, 10) : undefined;

    const updatedUser = await updateUser(userId, {
      name: name || undefined,
      email: email || undefined,
      password: hashedPassword
    });

    return res.json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
