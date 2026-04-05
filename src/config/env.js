'use strict';

const required = (key) => {
  const val = process.env[key];
  if (!val) {
    console.warn(`[config] ${key} not set — using default (fine for development)`);
  }
  return val;
};

module.exports = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'finance_dev_secret_replace_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};
