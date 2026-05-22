import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { prisma } from '../lib/prisma.js'
import { serializeUser } from '../lib/serializeUser.js'
import { sessionCookieOptions, clearSessionCookieOptions } from '../lib/cookieOptions.js'

const COOKIE_NAME = 'asp_token'

export { COOKIE_NAME }

export function signToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, sessionCookieOptions(7 * 24 * 60 * 60 * 1000))
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, clearSessionCookieOptions())
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' })
    }
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) {
      return res.status(401).json({ error: 'Session invalid.' })
    }
    req.user = user
    req.userPublic = serializeUser(user)
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid.' })
  }
}
