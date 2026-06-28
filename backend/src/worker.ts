import 'dotenv/config'
import mongoose from 'mongoose'
import { Worker, Job } from 'bullmq'
import { redisConnection, QUEUE_NAME, GenerationJobData } from './lib/queue'
import { Assignment, QuestionPaper } from './models'
import { generateQuestionPaper } from './lib/ai'
import { notifyClients } from './lib/websocket'

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai')
  console.log('Worker connected to MongoDB')

  const worker = new Worker<GenerationJobData>(
    QUEUE_NAME,
    async (job: Job<GenerationJobData>) => {
      const { assignmentId, institutionName, courseName, examTitle, questionTypes, additionalInstructions, fileName } = job.data
      console.log(`[Worker] Processing job ${job.id} for assignment ${assignmentId}`)

      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' })
      notifyClients(assignmentId, {
        type: 'status',
        assignmentId,
        status: 'processing',
        message: 'Generating your question paper...',
      })

      await job.updateProgress(30)
      const paper = await generateQuestionPaper(questionTypes, additionalInstructions, fileName)

      await job.updateProgress(80)
      const qp = await QuestionPaper.create({
        assignmentId,
        institutionName,
        courseName,
        examTitle,
        subject: paper.subject,
        className: paper.className || courseName,
        timeAllowed: paper.timeAllowed,
        totalMarks: paper.totalMarks,
        sections: paper.sections,
        answerKey: paper.answerKey,
      })

      await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' })
      await job.updateProgress(100)

      notifyClients(assignmentId, {
        type: 'completed',
        assignmentId,
        paperId: qp._id.toString(),
        message: 'Question paper ready!',
      })

      console.log(`[Worker] Done: assignment ${assignmentId} -> paper ${qp._id}`)
      return { paperId: qp._id.toString() }
    },
    { connection: redisConnection, concurrency: 3 }
  )

  worker.on('failed', async (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message)
    if (job?.data.assignmentId) {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' })
      notifyClients(job.data.assignmentId, {
        type: 'failed',
        assignmentId: job.data.assignmentId,
        message: err.message,
      })
    }
  })

  console.log(`Worker listening on queue: ${QUEUE_NAME}`)
}

main().catch((err) => {
  console.error('Worker startup error:', err)
  process.exit(1)
})
