'use strict';

/**
 * Seed script — populates the in-memory store with demo data so the API
 * is immediately explorable without manual POST calls.
 *
 * This module is also imported by app.js at startup so the server boots
 * with data already present.
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const store = require('../models/store');

function seed() {
  if (store.seeded) return; // idempotent — only run once
  store.seeded = true;

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = [
    { name: 'Super Admin',   email: 'admin@finance.com',   password: 'admin123',   role: 'admin'   },
    { name: 'Alice Analyst', email: 'analyst@finance.com', password: 'analyst123', role: 'analyst' },
    { name: 'Victor Viewer', email: 'viewer@finance.com',  password: 'viewer123',  role: 'viewer'  },
  ];

  const createdUsers = users.map(({ name, email, password, role }) => {
    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = { id, name, email, passwordHash, role, status: 'active', createdAt: new Date().toISOString() };
    store.users.push(user);
    return user;
  });

  const adminId = createdUsers[0].id;

  // ── Transactions ───────────────────────────────────────────────────────────
  const now = new Date();
  const month = (offset) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - offset);
    return d.toISOString().split('T')[0];
  };

  const txns = [
    { amount: 85000, type: 'income',  category: 'Salary',       date: month(0), notes: 'March salary credit' },
    { amount: 12000, type: 'expense', category: 'Rent',         date: month(0), notes: 'Monthly rent' },
    { amount: 3200,  type: 'expense', category: 'Groceries',    date: month(0), notes: 'Weekly grocery run' },
    { amount: 5000,  type: 'expense', category: 'Utilities',    date: month(0), notes: 'Electricity + internet' },
    { amount: 85000, type: 'income',  category: 'Salary',       date: month(1), notes: 'February salary credit' },
    { amount: 12000, type: 'expense', category: 'Rent',         date: month(1), notes: 'Monthly rent' },
    { amount: 7500,  type: 'income',  category: 'Freelance',    date: month(1), notes: 'Web design project' },
    { amount: 2800,  type: 'expense', category: 'Groceries',    date: month(1), notes: 'Weekly grocery run' },
    { amount: 15000, type: 'expense', category: 'Travel',       date: month(1), notes: 'Flight tickets' },
    { amount: 85000, type: 'income',  category: 'Salary',       date: month(2), notes: 'January salary credit' },
    { amount: 12000, type: 'expense', category: 'Rent',         date: month(2), notes: 'Monthly rent' },
    { amount: 4200,  type: 'expense', category: 'Dining',       date: month(2), notes: 'Team dinner' },
    { amount: 10000, type: 'income',  category: 'Freelance',    date: month(2), notes: 'Logo design project' },
    { amount: 6500,  type: 'expense', category: 'Electronics',  date: month(2), notes: 'Mechanical keyboard' },
    { amount: 85000, type: 'income',  category: 'Salary',       date: month(3), notes: 'December salary' },
    { amount: 12000, type: 'expense', category: 'Rent',         date: month(3), notes: 'Monthly rent' },
    { amount: 20000, type: 'expense', category: 'Travel',       date: month(3), notes: 'Goa trip' },
    { amount: 3500,  type: 'expense', category: 'Groceries',    date: month(3), notes: 'Monthly grocery' },
  ];

  txns.forEach(({ amount, type, category, date, notes }) => {
    store.transactions.push({
      id: uuidv4(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      notes,
      createdBy: adminId,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    });
  });

  console.log(`[seed] ✓ ${store.users.length} users, ${store.transactions.length} transactions loaded`);
}

module.exports = seed;
