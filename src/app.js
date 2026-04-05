'use strict';

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { PORT, NODE_ENV } = require('./config/env');
const seed               = require('./config/seed');

const authRoutes        = require('./routes/authRoutes');
const userRoutes        = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');

const { notFound: notFoundRes, serverError } = require('./utils/response');

// ─── Seed demo data ───────────────────────────────────────────────────────────
seed();

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet());

// CORS — allow all origins in development; tighten in production
app.use(cors({
  origin: NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP request logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parse JSON bodies 
app.use(express.json({ limit: '10kb' }));

// ─── Global rate limiter ─────────────────────────────────────────────────────
// 120 requests per 15 minutes per IP — tighter on auth routes (see below)
const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             120,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many requests. Please slow down and try again later.' },
});
app.use(globalLimiter);


const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

// ─── Swagger UI (interactive API docs) ────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Finance API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,   
    displayRequestDuration: true,
    filter: true,
  },
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── Health check 
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status:  'ok',
    env:     NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────
app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ─── 404 handler ──────
app.use((req, res) => {
  notFoundRes(res, `Route ${req.method} ${req.originalUrl} does not exist.`);
});

// ─── Global error handler ─────
// Catches anything thrown inside asyncHandler wrappers
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  serverError(res, NODE_ENV === 'development' ? err.message : 'Internal server error.');
});

// ─── Start server ──────────
app.listen(PORT, () => {
  console.log(`\n Finance Backend running on http://localhost:${PORT}`);
  console.log(` Swagger UI  →  http://localhost:${PORT}/api-docs`);
  console.log(` OpenAPI JSON→  http://localhost:${PORT}/api-docs.json`);
  console.log(`    ENV : ${NODE_ENV}`);
  console.log(`\n Demo accounts:`);
  console.log(`    admin@finance.com    / admin123    (admin)`);
  console.log(`    analyst@finance.com  / analyst123  (analyst)`);
  console.log(`    viewer@finance.com   / viewer123   (viewer)\n`);
});

module.exports = app;
