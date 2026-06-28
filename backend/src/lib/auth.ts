import crypto from 'crypto'
import { Response } from 'express'
import { RefreshToken, IUser } from '../models'

const ACCESS_TOKEN_SECONDS = 15 * 60
const REFRESH_TOKEN_DAYS = 30
const REFRESH_COOKIE = 'veda_refresh'

export type AccessClaims = {
  sub: string
  role: IUser['role']
  plan: IUser['plan']
  exp: number
}

function secret() {
  const value = process.env.JWT_SECRET
  if (!value && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production')
  return value || 'development-only-change-me'
}

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

export function createAccessToken(user: IUser) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const claims: AccessClaims = {
    sub: user._id.toString(),
    role: user.role,
    plan: user.plan,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_SECONDS,
  }
  const payload = base64url(JSON.stringify(claims))
  const signature = crypto.createHmac('sha256', secret()).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${signature}`
}

export function verifyAccessToken(token: string): AccessClaims {
  const [header, payload, signature] = token.split('.')
  if (!header || !payload || !signature) throw new Error('Invalid access token')
  const expected = crypto.createHmac('sha256', secret()).update(`${header}.${payload}`).digest()
  const actual = Buffer.from(signature, 'base64url')
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw new Error('Invalid access token')
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AccessClaims
  if (!claims.sub || claims.exp <= Math.floor(Date.now() / 1000)) throw new Error('Access token expired')
  return claims
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, savedHash] = stored.split(':')
  if (!salt || !savedHash) return false
  const actual = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(savedHash, 'hex')
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

function tokenHash(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function issueRefreshToken(userId: string) {
  const token = crypto.randomBytes(48).toString('base64url')
  await RefreshToken.create({
    userId,
    tokenHash: tokenHash(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
  })
  return token
}

export async function rotateRefreshToken(token: string) {
  const record = await RefreshToken.findOneAndDelete({ tokenHash: tokenHash(token), expiresAt: { $gt: new Date() } })
  if (!record) return null
  return { userId: record.userId.toString(), token: await issueRefreshToken(record.userId.toString()) }
}

export async function revokeRefreshToken(token?: string) {
  if (token) await RefreshToken.deleteOne({ tokenHash: tokenHash(token) })
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/api/auth',
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions, maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000 })
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions)
}

export function readCookie(cookieHeader: string | undefined, name = REFRESH_COOKIE) {
  return cookieHeader?.split(';').map((part) => part.trim().split('=')).find(([key]) => key === name)?.[1]
}

export function publicUser(user: IUser) {
  return { id: user._id.toString(), name: user.name, email: user.email, avatarUrl: user.avatarUrl, role: user.role, plan: user.plan }
}
