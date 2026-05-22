import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import waitlistRoutes from './routes/waitlist.js'
import adminRoutes from './routes/admin.js'
import billingRoutes from './routes/billing.js'
import webhookRoutes from './routes/webhooks.js'
import signalsRoutes from './routes/signals.js'

const app = express()

if (config.isProduction) {
  app.set('trust proxy', 1)
}

app.use(helmet())
app.use(cookieParser())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(null, false)
    },
    credentials: true,
  })
)

// Stripe webhooks need raw body — mount before json parser
app.use('/api/webhooks', webhookRoutes)

app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'antigravity-signal-api',
    stripe: config.isStripeConfigured(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/waitlist', waitlistRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/signals', signalsRoutes)

app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err)
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(config.port, '0.0.0.0', () => {
  console.log(`API listening on port ${config.port} (${config.nodeEnv})`)
  console.log(`CORS origins: ${config.clientOrigins.join(', ')}`)
  if (!config.isStripeConfigured()) {
    console.warn('Stripe not fully configured — checkout disabled until env vars are set.')
  }
})
