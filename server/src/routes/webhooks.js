import { Router } from 'express'
import express from 'express'
import { config } from '../config.js'
import { prisma } from '../lib/prisma.js'
import { stripe } from '../lib/stripe.js'
import { PACKAGE_TO_TIER } from '../lib/stripe.js'

const router = Router()

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe || !config.stripe.webhookSecret) {
      return res.status(503).send('Stripe webhooks not configured')
    }

    const sig = req.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      )
    } catch (err) {
      console.error('[webhook] signature verification failed', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const userId = session.metadata?.userId
        const packageId = session.metadata?.packageId
        const tier = PACKAGE_TO_TIER[packageId] || session.metadata?.tier

        if (userId && tier) {
          await prisma.user.update({
            where: { id: userId },
            data: { tier },
          })

          if (session.subscription) {
            await prisma.subscription.upsert({
              where: { stripeSubscriptionId: session.subscription },
              create: {
                userId,
                tier,
                stripeSubscriptionId: session.subscription,
                stripePriceId: session.metadata?.priceId || null,
                status: 'active',
              },
              update: {
                tier,
                status: 'active',
              },
            })
          }

          if (session.id) {
            await prisma.payment.updateMany({
              where: { stripeCheckoutId: session.id },
              data: { status: 'SUCCEEDED' },
            })
          }
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const sub = event.data.object
        const record = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
        })
        if (record) {
          await prisma.subscription.update({
            where: { id: record.id },
            data: { status: 'cancelled' },
          })
          await prisma.user.update({
            where: { id: record.userId },
            data: { tier: 'STARTER' },
          })
        }
      }

      return res.json({ received: true })
    } catch (err) {
      console.error('[webhook] handler error', err)
      return res.status(500).json({ error: 'Webhook handler failed' })
    }
  }
)

export default router
