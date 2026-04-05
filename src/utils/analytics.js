'use strict';


const r2 = (n) => Math.round(n * 100) / 100;

function computeSummary(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type === 'income')  totalIncome   += t.amount;
    if (t.type === 'expense') totalExpenses += t.amount;
  }

  return {
    totalIncome:       r2(totalIncome),
    totalExpenses:     r2(totalExpenses),
    netBalance:        r2(totalIncome - totalExpenses),
    totalTransactions: transactions.length,
  };
}

function computeCategoryTotals(transactions) {
  const map = {};

  for (const t of transactions) {
    if (!map[t.category]) map[t.category] = { category: t.category, income: 0, expense: 0 };
    map[t.category][t.type] += t.amount;
  }

  return Object.values(map)
    .map((c) => ({ ...c, income: r2(c.income), expense: r2(c.expense), net: r2(c.income - c.expense) }))
    .sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
}

function computeTrends(transactions, period = 'monthly') {
  const buckets = {};

  for (const t of transactions) {
    const d   = new Date(t.date);
    const key = period === 'weekly'
      ? `${d.getFullYear()}-W${String(isoWeek(d)).padStart(2, '0')}`
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!buckets[key]) buckets[key] = { period: key, income: 0, expense: 0 };
    buckets[key][t.type] += t.amount;
  }

  return Object.values(buckets)
    .map((b) => ({ period: b.period, income: r2(b.income), expense: r2(b.expense), net: r2(b.income - b.expense) }))
    .sort((a, b) => a.period.localeCompare(b.period));
}


function isoWeek(date) {
  const d   = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = { computeSummary, computeCategoryTotals, computeTrends };
