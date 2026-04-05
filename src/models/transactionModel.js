'use strict';

const { v4: uuidv4 } = require('uuid');
const store = require('./store');

const TYPES = ['income', 'expense'];

// ─── Finders ──────────────────────────────────────────────────────────────────

function findById(id) {
  return store.transactions.find((t) => t.id === id && !t.isDeleted) ?? null;
}

/**
 * Query with optional filters + pagination.
 *
 * Filters: type, category, startDate, endDate
 * Pagination: page (1-based), limit (max 100)
 * Returns: { data, total, page, limit, totalPages }
 */
function query({ type, category, startDate, endDate, page = 1, limit = 20 } = {}) {
  let results = store.transactions.filter((t) => !t.isDeleted);

  if (type)      results = results.filter((t) => t.type === type);
  if (category)  results = results.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  if (startDate) results = results.filter((t) => new Date(t.date) >= new Date(startDate));
  if (endDate)   results = results.filter((t) => new Date(t.date) <= new Date(endDate));

  // Newest date first
  results.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total     = results.length;
  const pageNum   = Math.max(1, parseInt(page, 10));
  const pageSize  = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const data      = results.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  return { data, total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) };
}

/** All non-deleted transactions — used by dashboard aggregations */
function getActive() {
  return store.transactions.filter((t) => !t.isDeleted);
}

// ─── Mutators ─────────────────────────────────────────────────────────────────

function create({ amount, type, category, date, notes = '', createdBy }) {
  const tx = {
    id:        uuidv4(),
    amount:    parseFloat(amount),
    type,
    category:  category.trim(),
    date,
    notes,
    createdBy,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    deletedAt: null,
  };
  store.transactions.push(tx);
  return tx;
}

function update(id, fields) {
  const idx = store.transactions.findIndex((t) => t.id === id && !t.isDeleted);
  if (idx === -1) return null;
  if (fields.amount !== undefined) fields.amount = parseFloat(fields.amount);
  if (fields.category)             fields.category = fields.category.trim();
  store.transactions[idx] = { ...store.transactions[idx], ...fields, updatedAt: new Date().toISOString() };
  return store.transactions[idx];
}

/** Soft delete — record is retained for audit / analytics */
function softDelete(id) {
  const idx = store.transactions.findIndex((t) => t.id === id && !t.isDeleted);
  if (idx === -1) return false;
  store.transactions[idx].isDeleted = true;
  store.transactions[idx].deletedAt = new Date().toISOString();
  return true;
}

module.exports = { TYPES, findById, query, getActive, create, update, softDelete };
