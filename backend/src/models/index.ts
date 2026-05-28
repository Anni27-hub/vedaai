import mongoose, { Schema, Document } from 'mongoose'

// ─── Assignment ───────────────────────────────────────────────
export interface IQuestionType {
  type: string
  count: number
  marks: number
}

export interface IAssignment extends Document {
  title: string
  dueDate: string
  questionTypes: IQuestionType[]
  additionalInstructions: string
  fileUrl?: string
  fileName?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  jobId?: string
  createdAt: Date
  updatedAt: Date
}

const QuestionTypeSchema = new Schema<IQuestionType>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
})

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, default: 'New Assignment' },
    dueDate: { type: String, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInstructions: { type: String, default: '' },
    fileUrl: { type: String },
    fileName: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
  },
  { timestamps: true }
)

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema)

// ─── Question Paper Result ─────────────────────────────────────
export interface IQuestion {
  id: string
  text: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  marks: number
}

export interface ISection {
  title: string        // e.g. "Section A"
  instruction: string  // e.g. "Attempt all questions"
  questions: IQuestion[]
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId
  schoolName: string
  subject: string
  className: string
  timeAllowed: string
  totalMarks: number
  sections: ISection[]
  answerKey: { questionId: string; answer: string }[]
  createdAt: Date
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
})

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
})

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    schoolName: { type: String, default: 'Delhi Public School, Sector-4, Bokaro' },
    subject: { type: String, default: 'General' },
    className: { type: String, default: '5th' },
    timeAllowed: { type: String, default: '45 minutes' },
    totalMarks: { type: Number, required: true },
    sections: { type: [SectionSchema], required: true },
    answerKey: [{ questionId: String, answer: String }],
  },
  { timestamps: true }
)

export const QuestionPaper = mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema)
