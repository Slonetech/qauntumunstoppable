import { config } from '../config.js'

/**
 * Production (Vercel + Railway): cross-site cookies need SameSite=None + Secure.
 * Local dev: SameSite=Lax is fine for localhost proxy.
 */
export function sessionCookieOptions(maxAgeMs) {
  const isProd = config.nodeEnv === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: maxAgeMs,
    path: '/',
  }
}

export function clearSessionCookieOptions() {
  const isProd = config.nodeEnv === 'production'
  return {
    path: '/',
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  }
}
