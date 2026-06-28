import { ConnectionOptions, Queue } from 'bullmq'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const parsedRedisUrl = new URL(REDIS_URL)

export const redisConnection: ConnectionOptions = {
  host: parsedRedisUrl.hostname,
  port: Number(parsedRedisUrl.port || 6379),
  username: parsedRedisUrl.username ? decodeURIComponent(parsedRedisUrl.username) : undefined,
  password: parsedRedisUrl.password ? decodeURIComponent(parsedRedisUrl.password) : undefined,
  db: Number(parsedRedisUrl.pathname.slice(1) || 0),
  maxRetriesPerRequest: null,
  ...(parsedRedisUrl.protocol === 'rediss:' ? { tls: {} } : {}),
}

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
  institutionName: string
  courseName: string
  examTitle?: string
  questionTypes: { type: string; count: number; marks: number }[]
  additionalInstructions: string
  fileName?: string
}
