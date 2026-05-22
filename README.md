# Antigravity Signal Platform

Multi-asset trading signals SaaS — React frontend + Node/Express API + PostgreSQL + Stripe.

## Project structure

```
qauntumunstoppable/
├── src/                    # React 18 + Vite (marketing site & app UI)
│   ├── components/
│   ├── hooks/
│   └── lib/api.js          # API client (credentials: include)
├── server/                 # Express API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/         # auth, waitlist, admin, billing, webhooks
│       └── middleware/
├── docker-compose.yml      # PostgreSQL 16
├── .env.example            # Frontend env template
└── server/.env.example     # Backend secrets template
```

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18, Vite 5, Recharts |
| API | Node.js, Express, Zod validation |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Auth | JWT in httpOnly cookie, bcrypt passwords |
| Payments | Stripe Checkout (subscriptions) |

## Quick start

### 1. Database

**Option A — Docker (recommended)**

```bash
# From project root — if you get "permission denied", use sudo or add your user to the docker group:
bash scripts/start-database.sh
# Or: sudo docker compose up -d
```

**Option B — Native PostgreSQL (no Docker)**

```bash
bash scripts/install-postgres-native.sh
```

Then configure the API:

```bash
cp server/.env.example server/.env
# Edit server/.env — set JWT_SECRET and ADMIN_PASSWORD
```

### 2. API

```bash
cd server && npm install
npm run db:generate
npm run db:migrate    # waits for Postgres on :5432, then migrates
npm run db:seed       # insert 10 sample signals
npm run dev
```

**Troubleshooting `P1001: Can't reach database server`**

PostgreSQL is not running. From the project root run `npm run db:up` (or `sudo docker compose up -d`), wait ~10 seconds, then `cd server && npm run db:migrate` again.

If Docker says *permission denied*: run `sudo usermod -aG docker $USER`, log out and back in, or use `sudo docker compose up -d`.

API: `http://localhost:3001` · Health: `GET /api/health`

### 3. Frontend

```bash
npm install
npm run dev
```

Web: `http://localhost:5173` (proxies `/api` → port 3001)

**Both at once:** `npm run dev:all`

## Stripe setup

1. Create products/prices in [Stripe Dashboard](https://dashboard.stripe.com) for Starter ($99), Pro ($299), Elite ($799) monthly.
2. Add to `server/.env`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ELITE`
3. Webhook (local): `stripe listen --forward-to localhost:3001/api/webhooks/stripe`
   - Set `STRIPE_WEBHOOK_SECRET` from CLI output.

Checkout flow: Pricing → (login required) → Stripe Checkout → webhook updates user tier.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login (sets cookie) |
| POST | `/api/auth/logout` | — | Clear session |
| GET | `/api/auth/me` | User | Current user |
| PATCH | `/api/auth/me` | User | Update profile/balance |
| POST | `/api/waitlist` | — | Waitlist lead |
| POST | `/api/admin/login` | — | Admin session |
| GET | `/api/admin/stats` | Admin | Users, waitlist, payments, MRR |
| GET | `/api/billing/status` | — | Stripe configured? |
| POST | `/api/billing/checkout-session` | User | Stripe Checkout URL |
| POST | `/api/webhooks/stripe` | Stripe sig | Subscription events |
| GET | `/api/signals` | User | Tier-limited signal feed (3 / 10 / all) |

## Migration from localStorage (completed in P0)

| Before | After |
|--------|-------|
| `asp_users` / plaintext passwords | `User` table + bcrypt |
| `asp_current_user` | JWT cookie `asp_token` |
| `asp_waitlist` | `WaitlistEntry` table |
| `asp_payments` (unused) | `Payment` + Stripe webhooks |
| Client admin password | `ADMIN_PASSWORD` in `server/.env` only |
| Card form in browser | Stripe Checkout redirect |

Legacy keys are cleared on successful API session (`clearLegacyStorage()`).

## Database schema (summary)

- **User** — account, tier, balance, `stripeCustomerId`
- **WaitlistEntry** — marketing leads
- **Subscription** — Stripe subscription linkage
- **Payment** — checkout/payment audit trail
- **Signal** — reserved for Phase 2 (live signals)

## What’s next (Phase 1+)

- Live market data feeds into `PriceGrid` / ticker
- Populate `Signal` model + WebSocket delivery
- Email notifications (waitlist, alerts)
- Production deploy (Vercel + Fly/Railway + managed Postgres)
- Remove simulated P&L / deposit demo or back with ledger API

## Security notes

- Never commit `server/.env`
- Rotate `JWT_SECRET` and `ADMIN_PASSWORD` for production
- Use Stripe test keys until go-live
- Set `CLIENT_ORIGIN` to your production frontend URL
