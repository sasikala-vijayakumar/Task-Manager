// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// create task - teamlead or admin
router.post('/', auth, roleCheck(['teamlead']), [
  body('title').notEmpty().withMessage('Title required'),
  body('description').optional().isString()
], taskController.create);

// list tasks - behavior depends on role
router.get('/', auth, taskController.list);

// assign task - teamlead or admin
router.post('/:id/assign', auth, roleCheck(['teamlead']), [
  body('assigned_to').isInt().withMessage('assigned_to user id required')
], taskController.assign);

// start/stop - assignee only
router.post('/:id/start', auth, taskController.start);
router.post('/:id/stop', auth, taskController.stop);

// update task - teamlead or admin
router.put('/:id', auth, roleCheck(['teamlead']), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString(),
  body('assigned_to').optional().isInt().withMessage('assigned_to must be user id'),
  body('status').optional().isIn(['open', 'in-progress', 'completed']).withMessage('Invalid status')
], taskController.update);

// delete task - teamlead or admin
router.delete('/:id', auth, roleCheck(['teamlead']), taskController.delete);

module.exports = router;
