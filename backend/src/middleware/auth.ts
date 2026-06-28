import { NextFunction, Request, Response } from 'express'
import { AccessClaims, verifyAccessToken } from '../lib/auth'

export interface AuthRequest extends Request {
  user?: AccessClaims
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(' ') || []
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ success: false, error: 'Authentication required' })
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired access token' })
  }
}

export function requireRole(...roles: AccessClaims['role'][]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'You do not have access to this resource' })
    }
    next()
  }
}
