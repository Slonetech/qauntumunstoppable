import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeSignal, tierSignalLimit } from '../lib/serializeSignal.js'
import { formatTier } from '../lib/serializeUser.js'
import { sendSignalEmail } from '../lib/sendSignalEmail.js'

const router = Router()

const createSignalSchema = z.object({
  asset: z.string().min(1),
  action: z.string().min(1),
  bias: z.string().min(1),
  confidencePct: z.number().int().min(0).max(100),
  entryPrice: z.number().positive(),
  takeProfit: z.number().positive(),
  stopLoss: z.number().positive(),
  timeframe: z.string().min(1),
  modelVersion: z.string().min(1),
  tier: z.enum(['STARTER', 'PRO', 'ELITE']).optional().default('STARTER'),
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = tierSignalLimit(req.user.tier)
    const tierLabel = formatTier(req.user.tier)

    const rows = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      ...(limit !== undefined ? { take: limit } : {}),
    })

    return res.json({
      signals: rows.map(serializeSignal),
      limit: limit ?? rows.length,
      tier: tierLabel,
      total: rows.length,
    })
  } catch (err) {
    console.error('[signals]', err)
    return res.status(500).json({ error: 'Failed to load signals.' })
  }
})

router.get('/history', requireAuth, async (req, res) => {
  try {
    const rows = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return res.json({
      signals: rows.map(serializeSignal),
    })
  } catch (err) {
    console.error('[signals/history]', err)
    return res.status(500).json({ error: 'Failed to load signal history.' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const data = createSignalSchema.parse(req.body)

    const signal = await prisma.signal.create({
      data: {
        asset: data.asset,
        action: data.action,
        bias: data.bias,
        confidencePct: data.confidencePct,
        entryPrice: data.entryPrice,
        takeProfit: data.takeProfit,
        stopLoss: data.stopLoss,
        timeframe: data.timeframe,
        modelVersion: data.modelVersion,
      },
    })

    // Determine eligible tiers based on signal tier
    let eligibleTiers = []
    if (data.tier === 'STARTER') {
      eligibleTiers = ['STARTER', 'PRO', 'ELITE']
    } else if (data.tier === 'PRO') {
      eligibleTiers = ['PRO', 'ELITE']
    } else if (data.tier === 'ELITE') {
      eligibleTiers = ['ELITE']
    }

    // Query Prisma for users who qualify
    prisma.user.findMany({
      where: {
        tier: { in: eligibleTiers },
      },
      select: {
        email: true,
        firstName: true,
      },
    }).then(users => {
      // Non-blocking fire-and-forget email dispatch
      sendSignalEmail(signal, users).catch(mailErr => {
        console.error('[sendSignalEmail background error]', mailErr)
      })
    }).catch(dbErr => {
      console.error('[sendSignalEmail database query error]', dbErr)
    })

    return res.status(201).json(serializeSignal(signal))
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid signal parameters.', details: err.errors })
    }
    console.error('[signals/create]', err)
    return res.status(500).json({ error: 'Failed to create signal.' })
  }
})

// ── Internal endpoint for Python signal engine ────────────────────────────────
router.post('/internal', async (req, res) => {
  // 1. Authenticate via shared secret header
  const secret = req.headers['x-internal-secret']
  if (!secret || secret !== process.env.API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized.' })
  }

  try {
    const { asset, type, entry, confidence, tier = 'STARTER', reasoning } = req.body

    if (!asset || !type || entry == null || confidence == null) {
      return res.status(400).json({ error: 'Missing required fields: asset, type, entry, confidence.' })
    }

    const isBuy = type === 'BUY'

    // 2. Auto-calculate takeProfit and stopLoss
    const takeProfit = isBuy ? entry * 1.025 : entry * 0.975
    const stopLoss   = isBuy ? entry * 0.985 : entry * 1.015

    // 3. Persist to database
    const signal = await prisma.signal.create({
      data: {
        asset,
        action:        type,
        bias:          isBuy ? 'Bullish' : 'Bearish',
        confidencePct: confidence,
        entryPrice:    entry,
        takeProfit,
        stopLoss,
        timeframe:     '15m',
        modelVersion:  'engine-v1',
        tier,
      },
    })

    // 4. Determine eligible tiers
    let eligibleTiers = []
    if (tier === 'STARTER')      eligibleTiers = ['STARTER', 'PRO', 'ELITE']
    else if (tier === 'PRO')     eligibleTiers = ['PRO', 'ELITE']
    else if (tier === 'ELITE')   eligibleTiers = ['ELITE']

    // 5. Fire email notifications non-blocking (fire-and-forget)
    prisma.user.findMany({
      where:  { tier: { in: eligibleTiers } },
      select: { email: true, firstName: true },
    }).then(users => {
      sendSignalEmail(signal, users).catch(mailErr => {
        console.error('[internal/sendSignalEmail background error]', mailErr)
      })
    }).catch(dbErr => {
      console.error('[internal/sendSignalEmail database query error]', dbErr)
    })

    return res.status(201).json(serializeSignal(signal))
  } catch (err) {
    console.error('[signals/internal]', err)
    return res.status(500).json({ error: 'Failed to create signal.' })
  }
})

export default router
