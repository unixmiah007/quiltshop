import jwt from 'jsonwebtoken'

const cookieName = 'qsid'

export function setUserFromToken(req, _res, next) {
  try {
    const token = req.cookies?.[cookieName]
    if (!token) return next()
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.id, email: payload.email, role: payload.role, name: payload.name }
  } catch (_) { /* ignore bad/expired tokens */ }
  next()
}

// Guard helpers
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  next()
}
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })
  next()
}

export const authCookieName = cookieName
