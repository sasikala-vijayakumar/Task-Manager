// src/controllers/taskController.js
const { validationResult } = require('express-validator');
const { createTask, findTaskById, findTasksForUser, assignTask, startTask, stopTask, updateTask, deleteTask } = require('../models/taskModel');
const { findUserById } = require('../models/userModel');

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { title, description, assigned_to, team } = req.body;
  try {
    let taskTeam = team || null;
    
    if (assigned_to) {
      const assignee = await findUserById(assigned_to);
      if (!assignee) return res.status(400).json({ msg: 'Assignee not found' });
      // team validation: teamlead can only assign within their team
      if (req.user.role === 'teamlead' && assignee.team !== req.user.team) {
        return res.status(403).json({ msg: 'Cannot assign outside your team' });
      }
      // If no team specified, derive from assignee
      if (!taskTeam) {
        taskTeam = assignee.team;
      }
    }

    const task = await createTask({ title, description, created_by: req.user.id, assigned_to: assigned_to || null, team: taskTeam });
    return res.json(task);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const tasks = await findTasksForUser(req.user);
    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.assign = async (req, res) => {
  const taskId = req.params.id;
  const { assigned_to } = req.body;
  if (!assigned_to) return res.status(400).json({ msg: 'assigned_to is required' });
  try {
    const assignee = await findUserById(assigned_to);
    if (!assignee) return res.status(400).json({ msg: 'Assignee not found' });
    // teamlead cannot assign outside their team
    if (req.user.role === 'teamlead' && assignee.team !== req.user.team) {
      return res.status(403).json({ msg: 'Cannot assign outside your team' });
    }
    const updated = await assignTask(taskId, assigned_to, assignee.team);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.start = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await findTaskById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.assigned_to !== req.user.id) return res.status(403).json({ msg: 'Only assignee can start task' });
    const updated = await startTask(taskId);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.stop = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await findTaskById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.assigned_to !== req.user.id) return res.status(403).json({ msg: 'Only assignee can stop task' });
    const updated = await stopTask(taskId);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const taskId = req.params.id;
  const { title, description, assigned_to, status, team } = req.body;
  try {
    const task = await findTaskById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Only creator or admin can update
    if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
      return res.status(403).json({ msg: 'You can only update your own tasks' });
    }

    // If assigning, validate assignee
    let taskTeam = team || null;
    if (assigned_to) {
      const assignee = await findUserById(assigned_to);
      if (!assignee) return res.status(400).json({ msg: 'Assignee not found' });
      if (req.user.role === 'teamlead' && assignee.team !== req.user.team) {
        return res.status(403).json({ msg: 'Cannot assign outside your team' });
      }
      // If no team specified, derive from assignee
      if (!taskTeam) {
        taskTeam = assignee.team;
      }
    }

    const updated = await updateTask(taskId, { title, description, assigned_to, status, team: taskTeam });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await findTaskById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // Only creator or admin can delete
    if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
      return res.status(403).json({ msg: 'You can only delete your own tasks' });
    }

    await deleteTask(taskId);
    return res.json({ msg: 'Task deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
