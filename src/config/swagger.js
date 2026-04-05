'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Data Processing & Access Control API',
      version: '1.0.0',
      description: `
## Finance Dashboard Backend — Zorvyn Internship Assignment

A REST API for managing financial records, users, and role-based access control.

### How to use this docs
1. Call **POST /api/auth/login** with the demo credentials below
2. Copy the \`token\` from the response
3. Click the **Authorize** button (top right) and paste: \`Bearer <your_token>\`
4. All protected endpoints will now work

### Demo accounts
| Email | Password | Role |
|---|---|---|
| admin@finance.com | admin123 | admin — full access |
| analyst@finance.com | analyst123 | analyst — read + dashboard |
| viewer@finance.com | viewer123 | viewer — read only |

### Role permissions
| Action | viewer | analyst | admin |
|---|:---:|:---:|:---:|
| Read transactions | ✓ | ✓ | ✓ |
| Dashboard analytics | ✗ | ✓ | ✓ |
| Create/Edit/Delete transactions | ✗ | ✗ | ✓ |
| Manage users | ✗ | ✗ | ✓ |
      `,
      contact: {
        name: 'Gaurav Kumar',
        email: 'gauravpmca24@cs.du.ac.in',
      },
    },
   servers: [
  {
    url: 'https://finance-backend-hz54.onrender.com',  // ← paste this exactly
    description: 'Live server (Render) — use this',
  },
  {
    url: 'http://localhost:3000',
    description: 'Local development server',
  },
],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your JWT token here. Get it from POST /api/auth/login',
        },
      },
      schemas: {
        // ── User ──────────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            name:      { type: 'string', example: 'Jane Doe' },
            email:     { type: 'string', format: 'email', example: 'jane@company.com' },
            role:      { type: 'string', enum: ['admin', 'analyst', 'viewer'], example: 'analyst' },
            status:    { type: 'string', enum: ['active', 'inactive'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        CreateUserBody: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', minLength: 2, example: 'Jane Doe' },
            email:    { type: 'string', format: 'email', example: 'jane@company.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
            role:     { type: 'string', enum: ['admin', 'analyst', 'viewer'], default: 'viewer' },
          },
        },
        UpdateUserBody: {
          type: 'object',
          properties: {
            name:     { type: 'string', minLength: 2, example: 'Jane Smith' },
            email:    { type: 'string', format: 'email', example: 'janesmith@company.com' },
            password: { type: 'string', minLength: 6, example: 'newpassword123' },
            role:     { type: 'string', enum: ['admin', 'analyst', 'viewer'] },
            status:   { type: 'string', enum: ['active', 'inactive'] },
          },
        },

        // ── Transaction ───────────────────────────────────────────────────────
        Transaction: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            amount:    { type: 'number', example: 5000 },
            type:      { type: 'string', enum: ['income', 'expense'], example: 'income' },
            category:  { type: 'string', example: 'Salary' },
            date:      { type: 'string', format: 'date', example: '2024-03-15' },
            notes:     { type: 'string', example: 'March salary credit' },
            createdBy: { type: 'string', format: 'uuid' },
            isDeleted: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        CreateTransactionBody: {
          type: 'object',
          required: ['amount', 'type', 'category', 'date'],
          properties: {
            amount:   { type: 'number', minimum: 0.01, example: 85000 },
            type:     { type: 'string', enum: ['income', 'expense'], example: 'income' },
            category: { type: 'string', example: 'Salary' },
            date:     { type: 'string', format: 'date', example: '2024-03-01' },
            notes:    { type: 'string', example: 'March salary credit' },
          },
        },
        UpdateTransactionBody: {
          type: 'object',
          properties: {
            amount:   { type: 'number', minimum: 0.01, example: 90000 },
            type:     { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string', example: 'Bonus' },
            date:     { type: 'string', format: 'date', example: '2024-03-20' },
            notes:    { type: 'string', example: 'Updated note' },
          },
        },

        // ── Responses ─────────────────────────────────────────────────────────
        SuccessMessage: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful.' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong.' },
            errors:  { type: 'array', items: { type: 'string' }, example: ['field is required'] },
          },
        },
        PaginatedTransactions: {
          type: 'object',
          properties: {
            success:    { type: 'boolean', example: true },
            data:       { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
            total:      { type: 'integer', example: 18 },
            page:       { type: 'integer', example: 1 },
            limit:      { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 1 },
          },
        },
        DashboardSummary: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            summary: {
              type: 'object',
              properties: {
                totalIncome:       { type: 'number', example: 352500 },
                totalExpenses:     { type: 'number', example: 128200 },
                netBalance:        { type: 'number', example: 224300 },
                totalTransactions: { type: 'integer', example: 18 },
              },
            },
            categoryTotals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  income:   { type: 'number' },
                  expense:  { type: 'number' },
                  net:      { type: 'number' },
                },
              },
            },
            recentActivity: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
          },
        },
      },
    },

    // ── Tag groups shown in Swagger UI ────────────────────────────────────────
    tags: [
      { name: 'Auth',         description: 'Login · Logout · Current user' },
      { name: 'Users',        description: 'User management (admin only)' },
      { name: 'Transactions', description: 'Financial records CRUD + filtering' },
      { name: 'Dashboard',    description: 'Aggregated analytics (analyst + admin)' },
    ],

    // ── Auth paths (written inline here since routes use express-validator, not JSDoc) ──
    paths: {

      // ── Auth ────────────────────────────────────────────────────────────────
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and get a JWT',
          description: 'Returns a signed JWT valid for 24 h. Use it in the Authorization header for all protected routes.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', format: 'email', example: 'admin@finance.com' },
                    password: { type: 'string', example: 'admin123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Login successful.' },
                      token:   { type: 'string', example: 'eyJhbGci...' },
                      user:    { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Wrong credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Account inactive', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout (revoke current token)',
          description: 'Adds the current token to the server-side revocation list. The token cannot be used again.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } } },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
            401: { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      // ── Users ───────────────────────────────────────────────────────────────
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users',
          description: 'Admin only. Optional filters: role and status.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'role',   schema: { type: 'string', enum: ['admin', 'analyst', 'viewer'] }, description: 'Filter by role' },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['active', 'inactive'] },        description: 'Filter by status' },
          ],
          responses: {
            200: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      total:   { type: 'integer' },
                      users:   { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    },
                  },
                },
              },
            },
            401: { description: 'Not authenticated' },
            403: { description: 'Admin role required' },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          description: 'Admin only.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserBody' } } },
          },
          responses: {
            201: { description: 'User created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
            400: { description: 'Validation error' },
            401: { description: 'Not authenticated' },
            403: { description: 'Admin role required' },
            409: { description: 'Email already in use' },
          },
        },
      },

      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get a user by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'User found', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } } },
            404: { description: 'User not found' },
          },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update a user (partial)',
          description: 'Admin only. Send only the fields you want to change.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserBody' } } },
          },
          responses: {
            200: { description: 'User updated' },
            400: { description: 'Validation error' },
            404: { description: 'User not found' },
            409: { description: 'Email already in use' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete a user',
          description: 'Admin only. Cannot delete your own account.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'User deleted' },
            400: { description: 'Cannot delete own account' },
            404: { description: 'User not found' },
          },
        },
      },

      // ── Transactions ─────────────────────────────────────────────────────────
      '/api/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'List transactions with filters and pagination',
          description: 'Accessible by all authenticated users (viewer, analyst, admin).',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'type',      schema: { type: 'string', enum: ['income', 'expense'] }, description: 'Filter by type' },
            { in: 'query', name: 'category',  schema: { type: 'string' }, description: 'Filter by category (case-insensitive)' },
            { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' }, description: 'From date (ISO 8601)' },
            { in: 'query', name: 'endDate',   schema: { type: 'string', format: 'date' }, description: 'To date (ISO 8601)' },
            { in: 'query', name: 'page',      schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Page number' },
            { in: 'query', name: 'limit',     schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Results per page' },
          ],
          responses: {
            200: { description: 'Paginated list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedTransactions' } } } },
            400: { description: 'Invalid query params' },
            401: { description: 'Not authenticated' },
          },
        },
        post: {
          tags: ['Transactions'],
          summary: 'Create a transaction',
          description: 'Admin only.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTransactionBody' } } },
          },
          responses: {
            201: { description: 'Transaction created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, transaction: { $ref: '#/components/schemas/Transaction' } } } } } },
            400: { description: 'Validation error' },
            401: { description: 'Not authenticated' },
            403: { description: 'Admin role required' },
          },
        },
      },

      '/api/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get a transaction by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Transaction found', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, transaction: { $ref: '#/components/schemas/Transaction' } } } } } },
            404: { description: 'Not found' },
          },
        },
        patch: {
          tags: ['Transactions'],
          summary: 'Update a transaction (partial)',
          description: 'Admin only.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTransactionBody' } } },
          },
          responses: {
            200: { description: 'Updated' },
            400: { description: 'Validation error' },
            404: { description: 'Not found' },
          },
        },
        delete: {
          tags: ['Transactions'],
          summary: 'Delete a transaction (soft delete)',
          description: 'Admin only. Record is flagged isDeleted=true but not physically removed.',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Deleted (soft)' },
            404: { description: 'Not found' },
          },
        },
      },

      // ── Dashboard ────────────────────────────────────────────────────────────
      '/api/dashboard/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Overall financial summary',
          description: 'Returns total income, total expenses, net balance, category totals, and recent 10 transactions. Analyst and admin only.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Summary data', content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardSummary' } } } },
            401: { description: 'Not authenticated' },
            403: { description: 'Analyst or admin role required' },
          },
        },
      },

      '/api/dashboard/trends': {
        get: {
          tags: ['Dashboard'],
          summary: 'Income vs expense trends over time',
          description: 'Groups transactions by month or ISO week. Analyst and admin only.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'period', schema: { type: 'string', enum: ['monthly', 'weekly'], default: 'monthly' }, description: 'Grouping period' },
          ],
          responses: {
            200: {
              description: 'Trend data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      period:  { type: 'string' },
                      trends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            period:  { type: 'string', example: '2024-03' },
                            income:  { type: 'number', example: 92500 },
                            expense: { type: 'number', example: 34200 },
                            net:     { type: 'number', example: 58300 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/api/dashboard/category-breakdown': {
        get: {
          tags: ['Dashboard'],
          summary: 'Per-category income and expense totals',
          description: 'Optionally filter by type=income or type=expense. Analyst and admin only.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'type', schema: { type: 'string', enum: ['income', 'expense'] }, description: 'Filter to only income or only expense categories' },
          ],
          responses: {
            200: {
              description: 'Category breakdown',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success:   { type: 'boolean' },
                      type:      { type: 'string' },
                      breakdown: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, income: { type: 'number' }, expense: { type: 'number' }, net: { type: 'number' } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/health': {
        get: {
          tags: ['Auth'],
          summary: 'Health check',
          description: 'Returns server status. No auth required.',
          responses: {
            200: { description: 'Server is running', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, status: { type: 'string', example: 'ok' }, env: { type: 'string' }, timestamp: { type: 'string' } } } } } },
          },
        },
      },
    },
  },
  apis: [], // paths defined inline above
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
