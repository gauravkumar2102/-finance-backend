'use strict';

const txService = require('../services/transactionService');
const txModel   = require('../models/transactionModel');
const { ok, created, notFound } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const listTransactions = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate, page, limit } = req.query;
  const result = txModel.query({ type, category, startDate, endDate, page, limit });
  return ok(res, result);
});

const getTransaction = asyncHandler(async (req, res) => {
  const tx = txModel.findById(req.params.id);
  if (!tx) return notFound(res, 'Transaction not found.');
  return ok(res, { transaction: tx });
});

const createTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, notes } = req.body;
  const tx = txService.createTransaction({ amount, type, category, date, notes }, req.user.id);
  return created(res, { message: 'Transaction created successfully.', transaction: tx });
});

const updateTransaction = asyncHandler(async (req, res) => {
  try {
    const tx = txService.updateTransaction(req.params.id, req.body);
    return ok(res, { message: 'Transaction updated successfully.', transaction: tx });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

const deleteTransaction = asyncHandler(async (req, res) => {
  try {
    txService.deleteTransaction(req.params.id);
    return ok(res, { message: 'Transaction deleted successfully (soft delete).' });
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

module.exports = { listTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction };
