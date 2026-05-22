import { Router } from 'express'
import { z } from 'zod'
import { config } from '../config.js'
import { prisma } from '../lib/prisma.js'
import { serializeUser, formatTier } from '../lib/serializeUser.js'
import { requireAdmin, setAdminCookie, clearAdminCookie } from '../middleware/adminAuth.js'

const router = Router()

const loginSchema = z.object({
  password: z.string().min(1),
})

router.post('/login', (req, res) => {
  try {
    if (!config.adminPassword) {
      return res.status(503).json({ error: 'Admin access is not configured on the server.' })
    }
    const { password } = loginSchema.parse(req.body)
    if (password !== config.adminPassword) {
      return res.status(401).json({ error: 'Incorrect password. Access denied.' })
    }
    setAdminCookie(res)
    return res.json({ ok: true })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Password required.' })
    }
    return res.status(500).json({ error: 'Admin login failed.' })
  }
})

router.post('/logout', (_req, res) => {
  clearAdminCookie(res)
  return res.json({ ok: true })
})

router.get('/stats', requireAdmin, async (_req, res) => {
  try {
    const [users, waitlist, payments] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.waitlistEntry.findMany({ orderBy: { submittedAt: 'desc' } }),
      prisma.payment.findMany({
        where: { status: 'SUCCEEDED' },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
    ])

    const tierPrice = { STARTER: 99, PRO: 299, ELITE: 799 }
    const mrr = users.reduce((sum, u) => sum + (tierPrice[u.tier] || 99), 0)
    const countries = new Set([
      ...users.map(u => u.country).filter(Boolean),
      ...waitlist.map(w => w.country).filter(Boolean),
    ]).size

    return res.json({
      users: users.map(serializeUser),
      waitlist: waitlist.map(w => ({
        firstName: w.firstName,
        lastName: w.lastName,
        email: w.email,
        package: w.packageInterest,
        investment: w.investmentLevel,
        country: w.country,
        submittedAt: w.submittedAt,
      })),
      payments: payments.map(p => ({
        email: p.user.email,
        package: formatTier(p.tier),
        amount: `$${(p.amountCents / 100).toFixed(0)}`,
        cardLast4: null,
        date: p.createdAt,
      })),
      revenue: {
        mrr,
        arr: mrr * 12,
        countries,
        starter: users.filter(u => u.tier === 'STARTER').length,
        pro: users.filter(u => u.tier === 'PRO').length,
        elite: users.filter(u => u.tier === 'ELITE').length,
      },
    })
  } catch (err) {
    console.error('[admin/stats]', err)
    return res.status(500).json({ error: 'Failed to load admin data.' })
  }
})

export default router
