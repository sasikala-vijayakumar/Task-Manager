// src/middleware/roleCheck.js
// allowedRoles is array like ['teamlead'] — admin always allowed
module.exports = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });
  if (req.user.role === 'admin') return next();
  if (allowedRoles.includes(req.user.role)) return next();
  return res.status(403).json({ msg: 'Forbidden: insufficient role' });
};
