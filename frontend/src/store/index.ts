import { create } from 'zustand'
import { Assignment, QuestionType } from '@/types'

// ─── Assignment list store ─────────────────────────────────────
interface AssignmentStore {
  assignments: Assignment[]
  setAssignments: (a: Assignment[]) => void
  addAssignment: (a: Assignment) => void
  updateAssignment: (id: string, updates: Partial<Assignment>) => void
  removeAssignment: (id: string) => void
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) =>
    set((s) => ({ assignments: [assignment, ...s.assignments] })),
  updateAssignment: (id, updates) =>
    set((s) => ({
      assignments: s.assignments.map((a) =>
        a._id === id ? { ...a, ...updates } : a
      ),
    })),
  removeAssignment: (id) =>
    set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) })),
}))

// ─── Form store ────────────────────────────────────────────────
export const DEFAULT_QUESTION_TYPES: QuestionType[] = [
  { type: 'Multiple Choice Questions', count: 4, marks: 1 },
  { type: 'Short Questions', count: 3, marks: 2 },
]

interface FormStore {
  dueDate: string
  questionTypes: QuestionType[]
  additionalInstructions: string
  file: File | null

  setDueDate: (d: string) => void
  setQuestionTypes: (qt: QuestionType[]) => void
  addQuestionType: () => void
  removeQuestionType: (idx: number) => void
  updateQuestionType: (idx: number, field: keyof QuestionType, value: string | number) => void
  setAdditionalInstructions: (s: string) => void
  setFile: (f: File | null) => void
  resetForm: () => void
  totalQuestions: () => number
  totalMarks: () => number
}

export const useFormStore = create<FormStore>((set, get) => ({
  dueDate: '',
  questionTypes: DEFAULT_QUESTION_TYPES,
  additionalInstructions: '',
  file: null,

  setDueDate: (dueDate) => set({ dueDate }),
  setQuestionTypes: (questionTypes) => set({ questionTypes }),
  setAdditionalInstructions: (additionalInstructions) => set({ additionalInstructions }),
  setFile: (file) => set({ file }),

  addQuestionType: () =>
    set((s) => ({
      questionTypes: [...s.questionTypes, { type: 'Essay Questions', count: 2, marks: 5 }],
    })),

  removeQuestionType: (idx) =>
    set((s) => ({
      questionTypes: s.questionTypes.filter((_, i) => i !== idx),
    })),

  updateQuestionType: (idx, field, value) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((qt, i) =>
        i === idx ? { ...qt, [field]: field === 'type' ? value : Number(value) } : qt
      ),
    })),

  resetForm: () =>
    set({
      dueDate: '',
      questionTypes: DEFAULT_QUESTION_TYPES,
      additionalInstructions: '',
      file: null,
    }),

  totalQuestions: () => get().questionTypes.reduce((s, q) => s + q.count, 0),
  totalMarks: () => get().questionTypes.reduce((s, q) => s + q.count * q.marks, 0),
}))
