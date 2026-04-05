'use strict';

const { forbidden } = require('../utils/response');

/**
 * Role hierarchy (higher number = more access):
 *   viewer  → 1  — can only read transactions
 *   analyst → 2  — can read + access dashboard analytics
 *   admin   → 3  — full management access
 *
 * Usage:
 *   router.delete('/users/:id', authenticate, authorize('admin'), handler)
 *   router.get('/dashboard',    authenticate, authorize('analyst'), handler)
 */

const LEVELS = { viewer: 1, analyst: 2, admin: 3 };

/**
 * Middleware factory.
 * @param  {...string} roles  Minimum role required (OR logic — any match passes)
 */
function authorize(...roles) {
  return (req, res, next) => {
    const userLevel     = LEVELS[req.user?.role] ?? 0;
    const requiredLevel = Math.min(...roles.map((r) => LEVELS[r] ?? 99));

    if (userLevel < requiredLevel) {
      return forbidden(
        res,
        `This action requires the '${roles.join(' or ')}' role. Your current role is '${req.user?.role}'.`
      );
    }
    next();
  };
}

// Convenience shortcuts
const adminOnly      = authorize('admin');
const analystOrAbove = authorize('analyst');
const anyAuth        = authorize('viewer');

module.exports = { authorize, adminOnly, analystOrAbove, anyAuth };
