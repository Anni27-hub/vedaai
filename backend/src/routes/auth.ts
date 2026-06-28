import { Response, Router } from 'express'
import { z } from 'zod'
import { IUser, User } from '../models'
import { clearRefreshCookie, createAccessToken, hashPassword, issueRefreshToken, publicUser, readCookie, revokeRefreshToken, rotateRefreshToken, setRefreshCookie, verifyPassword } from '../lib/auth'
import { authenticate, AuthRequest } from '../middleware/auth'
import { OAuth2Client } from 'google-auth-library'

const router = Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const credentialsSchema = z.object({ email: z.string().email().transform((v) => v.toLowerCase()), password: z.string().min(8).max(128) })
const signupSchema = credentialsSchema.extend({ name: z.string().trim().min(2).max(80) })

async function sendSession(res: Response, user: IUser, status = 200) {
  setRefreshCookie(res, await issueRefreshToken(user._id.toString()))
  res.status(status).json({ success: true, data: { accessToken: createAccessToken(user), user: publicUser(user) } })
}

router.post('/signup', async (req, res) => {
  try {
    const input = signupSchema.parse(req.body)
    if (await User.exists({ email: input.email })) return res.status(409).json({ success: false, error: 'An account with this email already exists' })
    const user = await User.create({ name: input.name, email: input.email, passwordHash: hashPassword(input.password) })
    await sendSession(res, user, 201)
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.issues?.[0]?.message || 'Could not create account' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const input = credentialsSchema.parse(req.body)
    const user = await User.findOne({ email: input.email }).select('+passwordHash')
    if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) return res.status(401).json({ success: false, error: 'Invalid email or password' })
    await sendSession(res, user)
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.issues?.[0]?.message || 'Could not sign in' })
  }
})

router.post('/google', async (req, res) => {
  try {
    const credential = z.string().min(1).parse(req.body.credential)
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })
    const profile = ticket.getPayload()
    if (!profile?.sub || !profile.email || !profile.email_verified) return res.status(401).json({ success: false, error: 'Google account could not be verified' })
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }] })
    if (!user) user = await User.create({ name: profile.name || profile.email.split('@')[0], email: profile.email, googleId: profile.sub, avatarUrl: profile.picture })
    else if (!user.googleId) {
      user.googleId = profile.sub
      user.avatarUrl ||= profile.picture
      await user.save()
    }
    await sendSession(res, user)
  } catch {
    res.status(400).json({ success: false, error: 'Could not sign in with Google' })
  }
})

router.post('/refresh', async (req, res) => {
  const current = readCookie(req.headers.cookie)
  if (!current) return res.status(401).json({ success: false, error: 'Session expired' })
  const rotated = await rotateRefreshToken(current)
  if (!rotated) {
    clearRefreshCookie(res)
    return res.status(401).json({ success: false, error: 'Session expired' })
  }
  const user = await User.findById(rotated.userId)
  if (!user) return res.status(401).json({ success: false, error: 'Session expired' })
  setRefreshCookie(res, rotated.token)
  res.json({ success: true, data: { accessToken: createAccessToken(user), user: publicUser(user) } })
})

router.post('/logout', async (req, res) => {
  await revokeRefreshToken(readCookie(req.headers.cookie))
  clearRefreshCookie(res)
  res.json({ success: true, data: null })
})

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.sub)
  if (!user) return res.status(404).json({ success: false, error: 'User not found' })
  res.json({ success: true, data: publicUser(user) })
})

export default router
