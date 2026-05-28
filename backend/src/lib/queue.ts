import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Shared Redis connection for BullMQ
export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
})

// Queue name
export const QUEUE_NAME = 'question-generation'

// The main queue (used in API to add jobs)
export const questionQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

export type GenerationJobData = {
  assignmentId: string
  questionTypes: { type: string; count: number; marks: number }[]
  additionalInstructions: string
  fileName?: string
}
