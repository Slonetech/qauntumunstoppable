# Production deployment — Vercel + Railway

## Architecture

| Service | Host | URL |
|---------|------|-----|
| React SPA | Vercel | `https://your-app.vercel.app` |
| Express API | Railway | `https://your-api.up.railway.app` |
| PostgreSQL | Railway plugin | `DATABASE_URL` (internal) |

---

## Railway (API + database)

**Root Directory:** `server`  
**Build Command:** `npm run build` (runs `prisma generate`)  
**Start Command:** `npm start` (runs `node src/index.js`)  
**Health check:** `/api/health`

### Production migrations (run once per release)

From your machine with `DATABASE_URL` pointing at Railway Postgres:

```bash
cd server
export DATABASE_URL="postgresql://..."   # Railway → Postgres → Connect
npx prisma migrate deploy
```

Optional sample signals:

```bash
npm run db:seed
```

---

## Vercel (frontend)

**Root Directory:** repository root (where `package.json` and `vite.config.js` live)  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Environment variable:** `VITE_API_URL` = Railway public URL (no trailing slash)

---

## Environment variables checklist

### Railway (`server/` service)

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Railway sets this — do not hardcode |
| `DATABASE_URL` | Yes | From Railway PostgreSQL plugin |
| `JWT_SECRET` | Yes | `openssl rand -hex 32` |
| `ADMIN_PASSWORD` | Yes | Strong password, not in git |
| `CLIENT_ORIGIN` | Yes | `https://your-app.vercel.app` (comma-separated if multiple) |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `STRIPE_SECRET_KEY` | For billing | Live or test key |
| `STRIPE_WEBHOOK_SECRET` | For billing | From Stripe webhook |
| `STRIPE_PRICE_*` | For billing | Price IDs from Stripe |

### Vercel

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_API_URL` | Yes | `https://your-api.up.railway.app` |

---

## Production pitfalls (cookies / CORS / HTTPS)

1. **Cross-origin cookies:** Vercel and Railway are different sites. Production uses `SameSite=None; Secure` on auth cookies (see `server/src/lib/cookieOptions.js`).
2. **CORS:** `CLIENT_ORIGIN` must exactly match the browser origin (scheme + host, no trailing slash).
3. **Trust proxy:** Enabled in production so secure cookies work behind Railway’s TLS terminator.
4. **Stripe redirects:** `CLIENT_ORIGIN` first URL is used for checkout success/cancel URLs — set your primary Vercel URL first.
5. **Do not commit** `server/.env` or production secrets.
