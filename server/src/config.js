import 'dotenv/config'

const nodeEnv = process.env.NODE_ENV || 'development'
const isProduction = nodeEnv === 'production'

if (isProduction && !process.env.JWT_SECRET) {
  console.error('[config] FATAL: JWT_SECRET is required in production.')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.warn('[config] Missing DATABASE_URL — set it in server/.env or Railway variables.')
}

/** Comma-separated list, e.g. http://localhost:5173,https://your-app.vercel.app */
function parseClientOrigins() {
  const raw = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export const config = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: isProduction
    ? process.env.JWT_SECRET
    : (process.env.JWT_SECRET || 'dev-only-insecure-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  clientOrigins: parseClientOrigins(),
  /** Primary origin for Stripe redirects (first in list) */
  clientOrigin: parseClientOrigins()[0] || 'http://localhost:5173',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    prices: {
      starter: process.env.STRIPE_PRICE_STARTER || '',
      pro: process.env.STRIPE_PRICE_PRO || '',
      elite: process.env.STRIPE_PRICE_ELITE || '',
    },
  },
  isStripeConfigured() {
    const { secretKey, prices } = this.stripe
    return Boolean(secretKey && prices.starter && prices.pro && prices.elite)
  },
}
