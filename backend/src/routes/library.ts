import { Router, Response } from 'express'
import { Assignment, QuestionPaper } from '../models'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await Assignment.find({ owner: req.user!.sub }).select('_id title createdAt')
    const assignmentMap = new Map(assignments.map((assignment) => [assignment._id.toString(), assignment]))
    const papers = await QuestionPaper.find({ assignmentId: { $in: assignments.map((assignment) => assignment._id) } }).sort({ createdAt: -1 })

    res.json({
      success: true,
      data: papers.map((paper) => {
        const assignment = assignmentMap.get(paper.assignmentId.toString())
        return {
          _id: paper._id,
          assignmentId: paper.assignmentId,
          title: assignment?.title || `${paper.subject} Question Paper`,
          subject: paper.subject,
          className: paper.className,
          totalMarks: paper.totalMarks,
          questionCount: paper.sections.reduce((sum, section) => sum + section.questions.length, 0),
          sectionCount: paper.sections.length,
          starred: paper.starred,
          createdAt: paper.createdAt,
        }
      }),
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.patch('/:id/star', async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await Assignment.find({ owner: req.user!.sub }).select('_id')
    const paper = await QuestionPaper.findOne({ _id: req.params.id, assignmentId: { $in: assignments.map((assignment) => assignment._id) } })
    if (!paper) return res.status(404).json({ success: false, error: 'Paper not found' })
    paper.starred = !paper.starred
    await paper.save()
    res.json({ success: true, data: { _id: paper._id, starred: paper.starred } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
