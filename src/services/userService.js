'use strict';

const bcrypt    = require('bcryptjs');
const userModel = require('../models/userModel');

async function createUser({ name, email, password, role }) {
  if (userModel.findByEmail(email)) {
    throw { status: 409, message: `A user with email '${email}' already exists.` };
  }
  const passwordHash = await bcrypt.hash(password, 12);
  return userModel.create({ name, email, passwordHash, role });
}

async function updateUser(id, fields, requesterId) {
  const target = userModel.findById(id);
  if (!target) throw { status: 404, message: 'User not found.' };

  const updates = {};

  if (fields.name)   updates.name   = fields.name.trim();
  if (fields.status) updates.status = fields.status;
  if (fields.role)   updates.role   = fields.role;

  if (fields.email) {
    const existing = userModel.findByEmail(fields.email);
    if (existing && existing.id !== id) {
      throw { status: 409, message: `Email '${fields.email}' is already in use.` };
    }
    updates.email = fields.email.toLowerCase().trim();
  }

  if (fields.password) {
    updates.passwordHash = await bcrypt.hash(fields.password, 12);
  }

  return userModel.update(id, updates);
}

function deleteUser(id, requesterId) {
  if (id === requesterId) throw { status: 400, message: 'You cannot delete your own account.' };
  const target = userModel.findById(id);
  if (!target) throw { status: 404, message: 'User not found.' };
  userModel.remove(id);
}

module.exports = { createUser, updateUser, deleteUser };
