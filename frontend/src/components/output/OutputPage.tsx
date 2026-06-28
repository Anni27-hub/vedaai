'use client'
import { QuestionPaper, Question } from '@/types'

const difficultyStyle = {
  Easy: 'bg-green-50 text-green-700 border-green-200',
  Moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Hard: 'bg-red-50 text-red-700 border-red-200',
}

function DifficultyBadge({ level }: { level: Question['difficulty'] }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${difficultyStyle[level]}`}>
      {level}
    </span>
  )
}

export default function OutputPage({ paper }: { paper: QuestionPaper }) {
  return (
    <div className="print-paper max-w-3xl mx-auto p-8 print:p-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
        {/* Paper Header */}
        <div className="text-center py-6 px-8 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">{paper.institutionName || paper.schoolName || 'Question Paper'}</h1>
          <p className="text-sm font-medium text-gray-700 mt-1">{paper.examTitle || 'Question Paper'}</p>
          <p className="text-sm text-gray-600 mt-1">Course: {paper.courseName || paper.subject}</p>
        </div>

        {/* Meta info */}
        <div className="px-8 py-4 border-b border-gray-100 flex justify-between text-xs text-gray-600">
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.totalMarks}</span>
        </div>

        <div className="px-8 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-600">All questions are compulsory unless stated otherwise.</p>
        </div>

        {/* Student info section */}
        <div className="px-8 py-5 border-b border-gray-100">
          <div className="space-y-3">
            {[
              { label: 'Name:', width: 'w-56' },
              { label: 'Roll Number:', width: 'w-40' },
              { label: 'Course:', width: 'w-56' },
              { label: 'Section:', width: 'w-20' },
            ].map(({ label, width }) => (
              <div key={label} className="flex items-end gap-2">
                <span className="text-xs text-gray-700 whitespace-nowrap">{label}</span>
                <div className={`${width} border-b border-gray-400 h-5`} />
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="px-8 py-6 space-y-8">
          {paper.sections.map((section, si) => (
            <div key={si}>
              {/* Section header */}
              <h2 className="text-sm font-bold text-center text-gray-900 mb-1">{section.title}</h2>
              <p className="text-xs text-gray-500 text-center mb-4 italic">{section.instruction}</p>

              {/* Questions */}
              <ol className="space-y-4">
                {section.questions.map((q, qi) => (
                  <li key={q.id} className="flex gap-3">
                    <span className="text-xs text-gray-500 mt-0.5 shrink-0 w-6">{qi + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <p className="text-xs text-gray-800 flex-1 leading-relaxed">
                          <DifficultyBadge level={q.difficulty} />
                          {' '}{q.text}
                        </p>
                        <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                          [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* End of paper */}
        <div className="px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs font-medium text-gray-600">End of Question Paper</p>
        </div>

        {/* Answer Key */}
        {paper.answerKey.length > 0 && (
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Answer Key</h3>
            <ol className="space-y-2">
              {paper.answerKey.map((ak, i) => (
                <li key={ak.questionId} className="flex gap-3">
                  <span className="text-xs text-gray-500 shrink-0 w-6">{i + 1}.</span>
                  <p className="text-xs text-gray-700 leading-relaxed">{ak.answer}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
