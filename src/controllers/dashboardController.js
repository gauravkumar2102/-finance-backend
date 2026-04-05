'use strict';

const txModel    = require('../models/transactionModel');
const analytics  = require('../utils/analytics');
const { ok, badRequest } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/dashboard/summary
 * Returns: total income, total expenses, net balance,
 *          category-wise totals, recent 10 transactions.
 * Access: analyst, admin
 */
const summary = asyncHandler(async (req, res) => {
  const all = txModel.getActive();

  const summaryStats   = analytics.computeSummary(all);
  const categoryTotals = analytics.computeCategoryTotals(all);

  // Recent activity — 10 latest by createdAt
  const recentActivity = [...all]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return ok(res, { summary: summaryStats, categoryTotals, recentActivity });
});

/**
 * GET /api/dashboard/trends?period=monthly|weekly
 * Returns income vs expense bucketed by month or ISO week.
 * Access: analyst, admin
 */
const trends = asyncHandler(async (req, res) => {
  const { period = 'monthly' } = req.query;

  if (!['monthly', 'weekly'].includes(period)) {
    return badRequest(res, "period must be 'monthly' or 'weekly'.");
  }

  const all        = txModel.getActive();
  const trendData  = analytics.computeTrends(all, period);

  return ok(res, { period, trends: trendData });
});

/**
 * GET /api/dashboard/category-breakdown?type=income|expense
 * Deeper slice — amounts per category filtered by transaction type.
 * 
 */
const categoryBreakdown = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let all = txModel.getActive();
  if (type) all = all.filter((t) => t.type === type);

  const breakdown = analytics.computeCategoryTotals(all);
  return ok(res, { type: type || 'all', breakdown });
});

module.exports = { summary, trends, categoryBreakdown };
