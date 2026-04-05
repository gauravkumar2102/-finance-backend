'use strict';

const { Router } = require('express');
const { query }  = require('express-validator');

const dashboardController = require('../controllers/dashboardController');
const authenticate        = require('../middlewares/authenticate');
const { analystOrAbove }  = require('../middlewares/rbac');
const validate            = require('../middlewares/validate');

const router = Router();

// All dashboard routes: must be logged in + analyst or admin
router.use(authenticate, analystOrAbove);

/**
 * GET /api/dashboard/summary
 * Returns: totals, net balance, category breakdown, recent activity.
 */
router.get('/summary', dashboardController.summary);

/**
 * GET /api/dashboard/trends?period=monthly|weekly
 * Returns: time-series of income vs expense.
 */
router.get(
  '/trends',
  [
    query('period')
      .optional()
      .isIn(['monthly', 'weekly'])
      .withMessage("period must be 'monthly' or 'weekly'."),
  ],
  validate,
  dashboardController.trends
);

/**
 * GET /api/dashboard/category-breakdown?type=income|expense
 * Returns: per-category totals, optionally filtered by type.
 */
router.get(
  '/category-breakdown',
  [
    query('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage("type must be 'income' or 'expense'."),
  ],
  validate,
  dashboardController.categoryBreakdown
);

module.exports = router;
