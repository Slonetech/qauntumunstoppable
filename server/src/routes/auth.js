import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { serializeUser, parseTierInput } from '../lib/serializeUser.js'
import {
  requireAuth,
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from '../middleware/auth.js'

const router = Router()

const registerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  country: z.string().min(1).max(120),
  phone: z.string().max(40).optional(),
  investment: z.string().max(120).optional(),
  package: z.string().max(40).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(body.password, 12)
    const tier = parseTierInput(body.package)

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        country: body.country.trim(),
        phone: body.phone?.trim() || null,
        investmentLevel: body.investment?.trim() || null,
        tier,
      },
    })

    const token = signToken(user.id)
    setAuthCookie(res, token)
    return res.status(201).json({ user: serializeUser(user) })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid registration data.', details: err.errors })
    }
    console.error('[auth/register]', err)
    return res.status(500).json({ error: 'Registration failed.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = signToken(user.id)
    setAuthCookie(res, token)
    return res.json({ user: serializeUser(user) })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid login data.' })
    }
    console.error('[auth/login]', err)
    return res.status(500).json({ error: 'Login failed.' })
  }
})

router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  return res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.userPublic })
})

router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { balance } = req.body
    if (balance === undefined) {
      return res.status(400).json({ error: 'No updatable fields provided.' })
    }
    const amount = Number(balance)
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ error: 'Invalid balance.' })
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { balance: amount },
    })
    return res.json({ user: serializeUser(user) })
  } catch (err) {
    console.error('[auth/me patch]', err)
    return res.status(500).json({ error: 'Update failed.' })
  }
})

export default router
