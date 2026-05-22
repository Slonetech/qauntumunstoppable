import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { sessionCookieOptions, clearSessionCookieOptions } from '../lib/cookieOptions.js'

const ADMIN_COOKIE = 'asp_admin'

export { ADMIN_COOKIE }

export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[ADMIN_COOKIE]
    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required.' })
    }
    jwt.verify(token, config.jwtSecret)
    next()
  } catch {
    return res.status(401).json({ error: 'Admin session expired.' })
  }
}

export function setAdminCookie(res) {
  const token = jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '8h' })
  res.cookie(ADMIN_COOKIE, token, sessionCookieOptions(8 * 60 * 60 * 1000))
}

export function clearAdminCookie(res) {
  res.clearCookie(ADMIN_COOKIE, clearSessionCookieOptions())
}
