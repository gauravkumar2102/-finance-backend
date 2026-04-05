'use strict';

const { v4: uuidv4 } = require('uuid');
const store = require('./store');

/** Allowed values — single source of truth used by validators too */
const ROLES    = ['admin', 'analyst', 'viewer'];
const STATUSES = ['active', 'inactive'];

// ─── Finders ──────────────────────────────────────────────────────────────────

function findById(id) {
  return store.users.find((u) => u.id === id) ?? null;
}

function findByEmail(email) {
  return store.users.find((u) => u.email === email.toLowerCase().trim()) ?? null;
}

function listAll({ role, status } = {}) {
  let result = store.users;
  if (role)   result = result.filter((u) => u.role === role);
  if (status) result = result.filter((u) => u.status === status);
  return result;
}

// ─── Mutators ─────────────────────────────────────────────────────────────────

function create({ name, email, passwordHash, role = 'viewer' }) {
  const user = {
    id:           uuidv4(),
    name:         name.trim(),
    email:        email.toLowerCase().trim(),
    passwordHash,
    role,
    status:       'active',
    createdAt:    new Date().toISOString(),
    updatedAt:    null,
  };
  store.users.push(user);
  return user;
}

function update(id, fields) {
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  store.users[idx] = { ...store.users[idx], ...fields, updatedAt: new Date().toISOString() };
  return store.users[idx];
}

function remove(id) {
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  store.users.splice(idx, 1);
  return true;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip the password hash before sending to clients */
function sanitize(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { ROLES, STATUSES, findById, findByEmail, listAll, create, update, remove, sanitize };
