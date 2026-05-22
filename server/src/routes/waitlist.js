import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

const router = Router()

const waitlistSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().max(255),
  phone: z.string().max(40).optional(),
  country: z.string().min(1).max(120),
  investment: z.string().min(1).max(120),
  package: z.string().max(40).optional(),
})

router.post('/', async (req, res) => {
  try {
    const body = waitlistSchema.parse(req.body)
    const entry = await prisma.waitlistEntry.create({
      data: {
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: body.email.toLowerCase(),
        phone: body.phone?.trim() || null,
        country: body.country.trim(),
        investmentLevel: body.investment.trim(),
        packageInterest: body.package?.trim() || null,
      },
    })
    return res.status(201).json({
      ok: true,
      entry: {
        id: entry.id,
        submittedAt: entry.submittedAt,
      },
    })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid waitlist data.', details: err.errors })
    }
    console.error('[waitlist]', err)
    return res.status(500).json({ error: 'Could not save waitlist entry.' })
  }
})

export default router
