export interface QuestionType {
  type: string
  count: number
  marks: number
}

export interface Assignment {
  _id: string
  title: string
  institutionName: string
  courseName: string
  examTitle?: string
  dueDate: string
  questionTypes: QuestionType[]
  additionalInstructions: string
  fileUrl?: string
  fileName?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  jobId?: string
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  text: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  marks: number
}

export interface Section {
  title: string
  instruction: string
  questions: Question[]
}

export interface QuestionPaper {
  _id: string
  assignmentId: string
  institutionName: string
  courseName: string
  examTitle?: string
  schoolName?: string
  subject: string
  className: string
  timeAllowed: string
  totalMarks: number
  sections: Section[]
  answerKey: { questionId: string; answer: string }[]
  createdAt: string
}

export interface Group {
  _id: string
  name: string
  subject: string
  grade: string
  studentCount: number
  notes?: string
  assignments: number
  createdAt: string
  updatedAt: string
}

export interface LibraryPaper {
  _id: string
  assignmentId: string
  title: string
  subject: string
  className: string
  totalMarks: number
  questionCount: number
  sectionCount: number
  starred: boolean
  createdAt: string
}

export type ToolkitTool = 'question-generator' | 'rubric-builder' | 'lesson-planner' | 'feedback-ai' | 'essay-evaluator'

export interface ToolkitRun {
  _id: string
  tool: ToolkitTool
  title: string
  input: string
  output: string
  createdAt: string
  updatedAt: string
}
