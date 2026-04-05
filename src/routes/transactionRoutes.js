'use strict';

const { Router } = require('express');
const { body, query, param } = require('express-validator');

const txController   = require('../controllers/transactionController');
const authenticate   = require('../middlewares/authenticate');
const { adminOnly, anyAuth } = require('../middlewares/rbac');
const validate       = require('../middlewares/validate');
const { TYPES }      = require('../models/transactionModel');

const router = Router();

// All transaction routes require a valid token
router.use(authenticate);

/**
 * GET /api/transactions
 * Filters: type, category, startDate, endDate, page, limit
 * Access: viewer, analyst, admin
 */
router.get(
  '/',
  anyAuth,
  [
    query('type').optional().isIn(TYPES).withMessage(`type must be one of: ${TYPES.join(', ')}.`),
    query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date.'),
    query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO 8601 date.'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
  ],
  validate,
  txController.listTransactions
);

/**
 * GET /api/transactions/:id
 * Access: viewer, analyst, admin
 */
router.get(
  '/:id',
  anyAuth,
  [param('id').isUUID().withMessage('Transaction ID must be a valid UUID.')],
  validate,
  txController.getTransaction
);

/**
 * POST /api/transactions
 * Body: { amount, type, category, date, notes? }
 * Access: admin only
 */
router.post(
  '/',
  adminOnly,
  [
    body('amount').isFloat({ gt: 0 }).withMessage('amount must be a positive number.'),
    body('type').isIn(TYPES).withMessage(`type must be one of: ${TYPES.join(', ')}.`),
    body('category').trim().notEmpty().withMessage('category is required.'),
    body('date').isISO8601().withMessage('date must be a valid ISO 8601 date (e.g. 2024-03-15).'),
    body('notes').optional().isString(),
  ],
  validate,
  txController.createTransaction
);

/**
 * PATCH /api/transactions/:id
 * Body: any subset of { amount, type, category, date, notes }
 * Access: admin only
 */
router.patch(
  '/:id',
  adminOnly,
  [
    param('id').isUUID().withMessage('Transaction ID must be a valid UUID.'),
    body('amount').optional().isFloat({ gt: 0 }).withMessage('amount must be a positive number.'),
    body('type').optional().isIn(TYPES).withMessage(`type must be one of: ${TYPES.join(', ')}.`),
    body('date').optional().isISO8601().withMessage('date must be a valid ISO 8601 date.'),
    body('category').optional().trim().notEmpty().withMessage('category cannot be empty.'),
    body('notes').optional().isString(),
  ],
  validate,
  txController.updateTransaction
);

/**
 * DELETE /api/transactions/:id
 * Soft delete — record is retained in the store for audit/analytics.
 * Access: admin only
 */
router.delete(
  '/:id',
  adminOnly,
  [param('id').isUUID().withMessage('Transaction ID must be a valid UUID.')],
  validate,
  txController.deleteTransaction
);

module.exports = router;
