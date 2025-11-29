// src/routes/users.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { createUser, findUserByEmail, findAllUsers, updateUser, deleteUser } = require('../models/userModel');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const bcrypt = require('bcryptjs');
const { findUsersByTeam } = require('../models/userModel');

// get all users - admin can see all, teamlead can see their team members
router.get('/', auth, roleCheck(['admin', 'teamlead']), async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const users = await findAllUsers();
      return res.json(users);
    } else if (req.user.role === 'teamlead') {
      // Teamlead can only see their own team members
      const users = await findUsersByTeam(req.user.team);
      return res.json(users);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// get team members - teamlead only
router.get('/team-members', auth, roleCheck(['teamlead']), async (req, res) => {
  try {
    const users = await findUsersByTeam(req.user.team);
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// create user - admin only
router.post('/', auth, roleCheck(['admin']), [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('role').isIn(['employee', 'teamlead', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, role } = req.body;
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).substring(2, 15);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const user = await createUser({ name, email, password: hashedPassword, role, team: null });
    return res.status(201).json({ ...user, tempPassword });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// update user - admin only
router.put('/:id', auth, roleCheck(['admin']), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['employee', 'teamlead', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    const user = await updateUser(id, { name, email });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// delete user - admin only
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    return res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
