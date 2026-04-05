'use strict';

const { Router } = require('express');
const { body }   = require('express-validator');

const authController = require('../controllers/authController');
const authenticate   = require('../middlewares/authenticate');
const validate       = require('../middlewares/validate');

const router = Router();

/**
 * POST /api/auth/login
 * Public — exchange credentials for a JWT.
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email address is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

/**
 * POST /api/auth/logout
 * Protected — adds current token to the revocation list.
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Protected — returns the currently authenticated user's profile.
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
