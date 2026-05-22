import Stripe from 'stripe'
import { config } from '../config.js'

export const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey)
  : null

export const PACKAGE_TO_TIER = {
  starter: 'STARTER',
  pro: 'PRO',
  elite: 'ELITE',
}

export const TIER_TO_PACKAGE = {
  STARTER: 'starter',
  PRO: 'pro',
  ELITE: 'elite',
}

export function priceIdForPackage(packageId) {
  const map = config.stripe.prices
  return map[packageId] || null
}
