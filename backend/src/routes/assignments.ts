import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { Assignment } from '../models'
import { QuestionPaper } from '../models'
import { questionQueue } from '../lib/queue'
import { z } from 'zod'

const router = Router()

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.png', '.jpg', '.jpeg']
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  },
})

// Validation schema
const CreateAssignmentSchema = z.object({
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.string().transform((s) => {
    const parsed = JSON.parse(s)
    return z.array(
      z.object({
        type: z.string().min(1),
        count: z.number().min(1),
        marks: z.number().min(1),
      })
    ).parse(parsed)
  }),
  additionalInstructions: z.string().optional().default(''),
  title: z.string().optional().default('New Assignment'),
})

// ─── GET /assignments — list all ──────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 })
    res.json({ success: true, data: assignments })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── POST /assignments — create + queue job ────────────────────
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const validated = CreateAssignmentSchema.parse(req.body)

    const assignment = await Assignment.create({
      title: validated.title,
      dueDate: validated.dueDate,
      questionTypes: validated.questionTypes,
      additionalInstructions: validated.additionalInstructions,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      fileName: req.file ? req.file.originalname : undefined,
      status: 'pending',
    })

    // Add job to queue
    const job = await questionQueue.add('generate', {
      assignmentId: assignment._id.toString(),
      questionTypes: validated.questionTypes,
      additionalInstructions: validated.additionalInstructions,
      fileName: req.file?.originalname,
    })

    // Store jobId on assignment
    await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id })

    res.status(201).json({
      success: true,
      data: { assignment, jobId: job.id },
    })
  } catch (err: any) {
    console.error('Create assignment error:', err)
    res.status(400).json({ success: false, error: err.message })
  }
})

// ─── GET /assignments/:id — single assignment ──────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' })
    res.json({ success: true, data: assignment })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── DELETE /assignments/:id ───────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id)
    await QuestionPaper.deleteMany({ assignmentId: req.params.id })
    res.json({ success: true, message: 'Deleted' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── GET /assignments/:id/paper — get generated paper ─────────
router.get('/:id/paper', async (req: Request, res: Response) => {
  try {
    const paper = await QuestionPaper.findOne({ assignmentId: req.params.id })
    if (!paper) return res.status(404).json({ success: false, error: 'Paper not generated yet' })
    res.json({ success: true, data: paper })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── POST /assignments/:id/regenerate ─────────────────────────
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return res.status(404).json({ success: false, error: 'Not found' })

    // Delete old paper
    await QuestionPaper.deleteMany({ assignmentId: req.params.id })
    await Assignment.findByIdAndUpdate(req.params.id, { status: 'pending' })

    const job = await questionQueue.add('generate', {
      assignmentId: assignment._id.toString(),
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
      fileName: assignment.fileName,
    })

    res.json({ success: true, data: { jobId: job.id } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
