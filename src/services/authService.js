'use strict';

const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const userModel     = require('../models/userModel');
const store         = require('../models/store');

async function login(email, password) {
  const user = userModel.findByEmail(email);
  if (!user) throw { status: 401, message: 'Invalid email or password.' };

  if (user.status === 'inactive') throw { status: 403, message: 'Account is deactivated. Contact an admin.' };

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw { status: 401, message: 'Invalid email or password.' };

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token, user: userModel.sanitize(user) };
}

function revokeToken(token) {
  store.revokedTokens.add(token);
}

module.exports = { login, revokeToken };
