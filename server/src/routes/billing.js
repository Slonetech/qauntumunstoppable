import { Router } from 'express'
import { z } from 'zod'
import { config } from '../config.js'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import {
  stripe,
  priceIdForPackage,
  PACKAGE_TO_TIER,
} from '../lib/stripe.js'

const router = Router()

const checkoutSchema = z.object({
  package: z.enum(['STARTER', 'PRO', 'ELITE']),
})

router.get('/status', (_req, res) => {
  return res.json({
    configured: config.isStripeConfigured(),
  })
})

router.post('/checkout', requireAuth, async (req, res) => {
  try {
    if (!stripe || !config.isStripeConfigured()) {
      return res.status(503).json({
        error: 'stripe_not_configured',
        message: 'Stripe is not configured. Add keys to server/.env.',
      })
    }

    const { package: selectedPackage } = checkoutSchema.parse(req.body)
    const packageId = selectedPackage.toLowerCase()
    const priceId = priceIdForPackage(packageId)
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid package.' })
    }

    let customerId = req.user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: req.user.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: req.user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const tier = PACKAGE_TO_TIER[packageId]
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://qauntumunstoppable.vercel.app?payment=success`,
      cancel_url: `https://qauntumunstoppable.vercel.app?payment=cancelled`,
      metadata: {
        userId: req.user.id,
        packageId,
        tier,
      },
    })

    await prisma.payment.create({
      data: {
        userId: req.user.id,
        tier,
        amountCents: packageId === 'elite' ? 79900 : packageId === 'pro' ? 29900 : 9900,
        status: 'PENDING',
        stripeCheckoutId: session.id,
      },
    })

    return res.json({ url: session.url })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid package selection.' })
    }
    console.error('[billing/checkout]', err)
    return res.status(500).json({ error: 'Could not create checkout session.' })
  }
})

export default router
