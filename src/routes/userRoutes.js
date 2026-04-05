'use strict';

const { Router } = require('express');
const { body, query, param } = require('express-validator');

const userController = require('../controllers/userController');
const authenticate   = require('../middlewares/authenticate');
const { adminOnly }  = require('../middlewares/rbac');
const validate       = require('../middlewares/validate');
const { ROLES, STATUSES } = require('../models/userModel');

const router = Router();

// All user-management routes require authentication + admin role
router.use(authenticate, adminOnly);

/**
 * GET /api/users
 * Optional filters: ?role=admin|analyst|viewer  &status=active|inactive
 */
router.get(
  '/',
  [
    query('role').optional().isIn(ROLES).withMessage(`role must be one of: ${ROLES.join(', ')}.`),
    query('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}.`),
  ],
  validate,
  userController.listUsers
);

/**
 * GET /api/users/:id
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('User ID must be a valid UUID.')],
  validate,
  userController.getUser
);

/**
 * POST /api/users
 * Body: { name, email, password, role? }
 */
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('name must be at least 2 characters.'),
    body('email').isEmail().withMessage('A valid email address is required.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters.'),
    body('role').optional().isIn(ROLES).withMessage(`role must be one of: ${ROLES.join(', ')}.`),
  ],
  validate,
  userController.createUser
);

/**
 * PATCH /api/users/:id
 * Body: any subset of { name, email, password, role, status }
 */
router.patch(
  '/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID.'),
    body('name').optional().trim().isLength({ min: 2 }).withMessage('name must be at least 2 characters.'),
    body('email').optional().isEmail().withMessage('A valid email address is required.').normalizeEmail(),
    body('password').optional().isLength({ min: 6 }).withMessage('password must be at least 6 characters.'),
    body('role').optional().isIn(ROLES).withMessage(`role must be one of: ${ROLES.join(', ')}.`),
    body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}.`),
  ],
  validate,
  userController.updateUser
);

/**
 * DELETE /api/users/:id
 * Hard delete. Cannot delete your own account.
 */
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('User ID must be a valid UUID.')],
  validate,
  userController.deleteUser
);

module.exports = router;
