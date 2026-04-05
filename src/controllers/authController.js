'use strict';

const authService = require('../services/authService');
const userModel   = require('../models/userModel');
const { ok, unauthorized } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await authService.login(email, password);
    return ok(res, { message: 'Login successful.', token, user });
  } catch (err) {
    // Service throws { status, message } for auth failures
    return res.status(err.status || 401).json({ success: false, message: err.message });
  }
});

const logout = asyncHandler(async (req, res) => {
  authService.revokeToken(req.token);
  return ok(res, { message: 'Logged out successfully. Token has been revoked.' });
});

const me = asyncHandler(async (req, res) => {
  return ok(res, { user: userModel.sanitize(req.user) });
});

module.exports = { login, logout, me };
