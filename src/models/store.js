'use strict';

/**
 * In-Memory Store
 *
 * Assumption: Persistent storage (PostgreSQL / MongoDB / SQLite) would be a
 * straight swap — each model file is the only layer that touches this object.
 * Controllers and services never import store directly.
 *
 * If replacing with a real DB, update only the model files; everything above
 * (routes, controllers, middlewares) stays unchanged.
 */

const store = {
  users: [],
  transactions: [],
  // Set of JWT strings that have been explicitly logged out
  revokedTokens: new Set(),
  // Idempotency flag for the seed script
  seeded: false,
};

module.exports = store;
