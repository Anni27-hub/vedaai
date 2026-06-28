import { Router, Response } from 'express'
import { z } from 'zod'
import { ToolkitRun } from '../models'
import { generateToolkitOutput } from '../lib/ai'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const toolkitSchema = z.object({
  tool: z.enum(['question-generator', 'rubric-builder', 'lesson-planner', 'feedback-ai', 'essay-evaluator']),
  title: z.string().trim().min(2).max(120),
  input: z.string().trim().min(10).max(3000),
})

router.get('/runs', async (req: AuthRequest, res: Response) => {
  try {
    const runs = await ToolkitRun.find({ owner: req.user!.sub }).sort({ createdAt: -1 }).limit(20)
    res.json({ success: true, data: runs })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const input = toolkitSchema.parse(req.body)
    const output = await generateToolkitOutput(input.tool, input.title, input.input)
    const run = await ToolkitRun.create({ ...input, output, owner: req.user!.sub })
    res.status(201).json({ success: true, data: run })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.issues?.[0]?.message || err.message })
  }
})

router.delete('/runs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const run = await ToolkitRun.findOneAndDelete({ _id: req.params.id, owner: req.user!.sub })
    if (!run) return res.status(404).json({ success: false, error: 'Run not found' })
    res.json({ success: true, data: null })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
