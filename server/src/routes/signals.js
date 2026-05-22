import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeSignal, tierSignalLimit } from '../lib/serializeSignal.js'
import { formatTier } from '../lib/serializeUser.js'

const router = Router()

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

export default router
