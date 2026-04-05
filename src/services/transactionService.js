'use strict';

const txModel = require('../models/transactionModel');

function createTransaction(data, userId) {
  return txModel.create({ ...data, createdBy: userId });
}

function updateTransaction(id, fields) {
  const tx = txModel.findById(id);
  if (!tx) throw { status: 404, message: 'Transaction not found.' };

  const allowed = ['amount', 'type', 'category', 'date', 'notes'];
  const updates = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) updates[key] = fields[key];
  }

  return txModel.update(id, updates);
}

function deleteTransaction(id) {
  const tx = txModel.findById(id);
  if (!tx) throw { status: 404, message: 'Transaction not found.' };
  txModel.softDelete(id);
}

module.exports = { createTransaction, updateTransaction, deleteTransaction };
