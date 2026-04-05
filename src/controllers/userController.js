'use strict';

const userService = require('../services/userService');
const userModel   = require('../models/userModel');
const { ok, created, notFound } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const users = userModel.listAll({ role, status }).map(userModel.sanitize);
  return ok(res, { total: users.length, users });
});

const getUser = asyncHandler(async (req, res) => {
  const user = userModel.findById(req.params.id);
  if (!user) return notFound(res, 'User not found.');
  return ok(res, { user: userModel.sanitize(user) });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = await userService.createUser({ name, email, password, role });
    return created(res, { message: 'User created successfully.', user: userModel.sanitize(user) });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user.id);
    return ok(res, { message: 'User updated successfully.', user: userModel.sanitize(user) });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    userService.deleteUser(req.params.id, req.user.id);
    return ok(res, { message: 'User deleted successfully.' });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
