// src/middleware/auth.js
const { verifyAccessToken } = require('../utils/tokens');
const { findUserById } = require('../models/userModel');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ msg: 'No token provided' });
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) return res.status(401).json({ msg: 'Invalid token' });
    const user = await findUserById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'User not found' });
    req.user = user; // id,name,email,role,team
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token invalid or expired' });
  }
};
