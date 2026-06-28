import mongoose, { Schema, Document } from 'mongoose'

export type UserRole = 'teacher' | 'admin'
export type UserPlan = 'free' | 'pro'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash?: string
  googleId?: string
  avatarUrl?: string
  role: UserRole
  plan: UserPlan
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  },
  { timestamps: true }
)

export const User = mongoose.model<IUser>('User', UserSchema)

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId
  tokenHash: string
  expiresAt: Date
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
)

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema)

// ─── Assignment ───────────────────────────────────────────────
export interface IQuestionType {
  type: string
  count: number
  marks: number
}

export interface IAssignment extends Document {
  owner: mongoose.Types.ObjectId
  title: string
  institutionName: string
  courseName: string
  examTitle?: string
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
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, default: 'New Assignment' },
    institutionName: { type: String, required: true, trim: true, default: 'Your Institution' },
    courseName: { type: String, required: true, trim: true, default: 'General Course' },
    examTitle: { type: String, trim: true, default: 'Question Paper' },
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

export interface IGroup extends Document {
  owner: mongoose.Types.ObjectId
  name: string
  subject: string
  grade: string
  studentCount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const GroupSchema = new Schema<IGroup>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    subject: { type: String, required: true, trim: true, maxlength: 60 },
    grade: { type: String, required: true, trim: true, maxlength: 30 },
    studentCount: { type: Number, required: true, min: 0, default: 0 },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
)

export const Group = mongoose.model<IGroup>('Group', GroupSchema)

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
  institutionName: string
  courseName: string
  examTitle?: string
  schoolName?: string
  subject: string
  className: string
  timeAllowed: string
  totalMarks: number
  sections: ISection[]
  answerKey: { questionId: string; answer: string }[]
  starred: boolean
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
    institutionName: { type: String, required: true, default: 'Your Institution' },
    courseName: { type: String, required: true, default: 'General Course' },
    examTitle: { type: String, default: 'Question Paper' },
    schoolName: { type: String },
    subject: { type: String, default: 'General' },
    className: { type: String, default: '' },
    timeAllowed: { type: String, default: '45 minutes' },
    totalMarks: { type: Number, required: true },
    sections: { type: [SectionSchema], required: true },
    answerKey: [{ questionId: String, answer: String }],
    starred: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const QuestionPaper = mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema)

export interface IToolkitRun extends Document {
  owner: mongoose.Types.ObjectId
  tool: 'question-generator' | 'rubric-builder' | 'lesson-planner' | 'feedback-ai' | 'essay-evaluator'
  title: string
  input: string
  output: string
  createdAt: Date
  updatedAt: Date
}

const ToolkitRunSchema = new Schema<IToolkitRun>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tool: {
      type: String,
      enum: ['question-generator', 'rubric-builder', 'lesson-planner', 'feedback-ai', 'essay-evaluator'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    input: { type: String, required: true, maxlength: 3000 },
    output: { type: String, required: true },
  },
  { timestamps: true }
)

export const ToolkitRun = mongoose.model<IToolkitRun>('ToolkitRun', ToolkitRunSchema)
