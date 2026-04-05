'use strict';

const jwt         = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const store       = require('../models/store');
const userModel   = require('../models/userModel');
const { unauthorized, forbidden } = require('../utils/response');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Missing or malformed Authorization header. Expected: Bearer <token>');
  }

  const token = header.slice(7); // strip "Bearer "

  // Check if this token has been revoked (logged out)
  if (store.revokedTokens.has(token)) {
    return unauthorized(res, 'Token has been revoked. Please log in again.');
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Token has expired. Please log in again.'
      : 'Invalid token.';
    return unauthorized(res, msg);
  }

  const user = userModel.findById(payload.sub);
  if (!user)                   return unauthorized(res, 'User belonging to this token no longer exists.');
  if (user.status === 'inactive') return forbidden(res, 'Your account has been deactivated. Contact an admin.');

  req.user  = user;
  req.token = token;
  next();
}

module.exports = authenticate;
