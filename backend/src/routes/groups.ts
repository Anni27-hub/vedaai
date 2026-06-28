import { Router, Response } from 'express'
import { z } from 'zod'
import { Assignment, Group } from '../models'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const groupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  subject: z.string().trim().min(2).max(60),
  grade: z.string().trim().min(1).max(30),
  studentCount: z.number().int().min(0).max(500).default(0),
  notes: z.string().max(500).optional().default(''),
})

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const [groups, assignmentCount] = await Promise.all([
      Group.find({ owner: req.user!.sub }).sort({ createdAt: -1 }),
      Assignment.countDocuments({ owner: req.user!.sub }),
    ])

    res.json({
      success: true,
      data: groups.map((group) => ({
        ...group.toObject(),
        assignments: assignmentCount,
      })),
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const input = groupSchema.parse(req.body)
    const group = await Group.create({ ...input, owner: req.user!.sub })
    res.status(201).json({ success: true, data: { ...group.toObject(), assignments: 0 } })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.issues?.[0]?.message || err.message })
  }
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const input = groupSchema.partial().parse(req.body)
    const group = await Group.findOneAndUpdate({ _id: req.params.id, owner: req.user!.sub }, input, { new: true })
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' })
    res.json({ success: true, data: group })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.issues?.[0]?.message || err.message })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.id, owner: req.user!.sub })
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' })
    res.json({ success: true, data: null })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
