# Finance Data Processing and Access Control Backend

> **Zorvyn Internship Assignment — Backend Developer Intern**

A production-quality REST API built with **Node.js + Express** featuring live interactive API documentation via **Swagger UI**.

---

## Quick Start (Local)

```bash
npm install
npm start
```

| URL | What you get |
|---|---|
| `http://localhost:3000/api-docs` | **Swagger UI** — try every endpoint live |
| `http://localhost:3000/api-docs.json` | Raw OpenAPI JSON (import into Postman) |
| `http://localhost:3000/health` | Health check |

---

## How to Use Swagger UI

### Step 1 — Login
1. Open `http://localhost:3000/api-docs`
2. Click **Auth** → **POST /api/auth/login** → **Try it out**
3. Use a demo account:

| Email | Password | Role |
|---|---|---|
| `admin@finance.com` | `admin123` | admin — full access |
| `analyst@finance.com` | `analyst123` | analyst — read + dashboard |
| `viewer@finance.com` | `viewer123` | viewer — read only |

4. Click **Execute** → copy the `token` from the response

### Step 2 — Authorize
1. Click **Authorize** (lock icon, top right)
2. Paste: `Bearer <your_token>`
3. Click **Authorize** → **Close**

### Step 3 — Try any endpoint
All protected endpoints now work. Token persists across page refreshes.

---

## Import into Postman

1. Postman → **Import** → **Link** tab
2. Paste: `http://localhost:3000/api-docs.json`
3. Postman auto-generates the full collection
4. Set Collection variable `base_url` = `http://localhost:3000`
5. Login, copy token, set Collection Authorization: **Bearer Token** → token value

---

## Deploy to Render (Free — Recommended)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Finance backend with Swagger"
git remote add origin https://github.com/YOUR_USERNAME/finance-backend.git
git push -u origin main
```

### Step 2 — Create Render service
1. [https://render.com](https://render.com) → Sign up → **New Web Service**
2. Connect your GitHub repo
3. Settings:

| Field | Value |
|---|---|
| Environment | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

4. Environment Variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | any long random string |
| `JWT_EXPIRES_IN` | `24h` |

5. Click **Create Web Service** — live in ~2 minutes

### Your live URLs
```
https://finance-backend-XXXX.onrender.com/api-docs        ← Submit this
https://finance-backend-XXXX.onrender.com/api-docs.json   ← Postman import
```

> Free tier sleeps after 15 min inactivity — first request takes ~30s to wake up.

---

## Alternative: Railway

1. [https://railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Same env variables as Render
3. Settings → Domains → generate public domain

---

## Project Structure

```
src/
├── app.js                       # Entry: helmet, cors, morgan, rate-limit, swagger
├── config/
│   ├── env.js                   # Centralised env vars
│   ├── seed.js                  # Auto-seeds 3 users + 18 transactions
│   └── swagger.js               # Full OpenAPI 3.0 spec
├── models/
│   ├── store.js                 # In-memory store
│   ├── userModel.js             # User CRUD + sanitize
│   └── transactionModel.js      # Transaction CRUD + soft delete + pagination
├── services/
│   ├── authService.js           # Login, JWT, token revocation
│   ├── userService.js           # User rules: duplicate check, bcrypt
│   └── transactionService.js    # Transaction rules: soft delete, field whitelist
├── controllers/                 # HTTP layer — reads req, calls service, writes res
├── middlewares/
│   ├── authenticate.js          # JWT verify + revocation check
│   ├── rbac.js                  # Role guard (viewer=1, analyst=2, admin=3)
│   └── validate.js              # express-validator error collector
├── routes/                      # URL definitions + validation chains
└── utils/
    ├── response.js              # ok / created / notFound / forbidden etc.
    ├── asyncHandler.js          # Eliminates try/catch boilerplate
    └── analytics.js            # Pure: computeSummary, computeTrends, computeCategoryTotals
```

---

## All Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | public | Get JWT |
| POST | `/api/auth/logout` | any | Revoke token |
| GET | `/api/auth/me` | any | My profile |

### Users (admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List (filter: role, status) |
| GET | `/api/users/:id` | Get one |
| POST | `/api/users` | Create |
| PATCH | `/api/users/:id` | Partial update |
| DELETE | `/api/users/:id` | Hard delete |

### Transactions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/transactions` | viewer+ | List + filter + paginate |
| GET | `/api/transactions/:id` | viewer+ | Get one |
| POST | `/api/transactions` | admin | Create |
| PATCH | `/api/transactions/:id` | admin | Partial update |
| DELETE | `/api/transactions/:id` | admin | Soft delete |

### Dashboard (analyst+)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Totals, category breakdown, recent activity |
| GET | `/api/dashboard/trends` | Monthly/weekly income vs expense |
| GET | `/api/dashboard/category-breakdown` | Per-category (filter by type) |

---

## Role Permissions

| | viewer | analyst | admin |
|---|:---:|:---:|:---:|
| Read transactions | ✓ | ✓ | ✓ |
| Dashboard analytics | ✗ | ✓ | ✓ |
| Create/Edit/Delete transactions | ✗ | ✗ | ✓ |
| Manage users | ✗ | ✗ | ✓ |

---

## Design Decisions

1. **In-memory store** — zero setup. Swap to a real DB by editing only model files.
2. **Soft delete** — `isDeleted:true` flag preserves audit trail and analytics.
3. **JWT revocation Set** — logout invalidates tokens server-side immediately.
4. **bcrypt cost 12** — stronger than the default 10; ~300ms hash time per login.
5. **express-validator chains** — defined on the route, all errors returned at once.
6. **`persistAuthorization: true`** in Swagger — token survives page refresh.

---

*Built by Gaurav Kumar — gauravpmca24@cs.du.ac.in*
