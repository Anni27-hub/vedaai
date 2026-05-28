export interface QuestionType {
  type: string
  count: number
  marks: number
}

export interface Assignment {
  _id: string
  title: string
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
  schoolName: string
  subject: string
  className: string
  timeAllowed: string
  totalMarks: number
  sections: Section[]
  answerKey: { questionId: string; answer: string }[]
  createdAt: string
}
