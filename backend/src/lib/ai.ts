import Groq from 'groq-sdk'
import { ISection } from '../models'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export type QuestionType = {
  type: string
  count: number
  marks: number
}

export type ParsedPaper = {
  subject: string
  className: string
  timeAllowed: string
  totalMarks: number
  sections: ISection[]
  answerKey: { questionId: string; answer: string }[]
}

function buildPrompt(
  questionTypes: QuestionType[],
  additionalInstructions: string,
  fileName?: string
): string {
  const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0)

  const totalMarks = questionTypes.reduce(
    (s, q) => s + q.count * q.marks,
    0
  )

  const qtDesc = questionTypes
    .map((q) => `- ${q.count} × ${q.type} (${q.marks} mark each)`)
    .join('\n')

  return `
You are an expert teacher creating an exam question paper.

Generate a structured question paper with the following requirements:

${qtDesc}

Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}

${fileName ? `Reference material: ${fileName}` : ''}

${
  additionalInstructions
    ? `Additional instructions: ${additionalInstructions}`
    : ''
}

IMPORTANT:
Respond ONLY with a valid JSON object.
No markdown.
No backticks.
No explanation.

The JSON must follow this exact structure:

{
  "subject": "string (infer from context or use 'General Science')",
  "className": "string (e.g. '8th')",
  "timeAllowed": "string (e.g. '45 minutes')",
  "totalMarks": number,
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries N marks.",
      "questions": [
        {
          "id": "A1",
          "text": "Full question text here",
          "difficulty": "Easy",
          "marks": number
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionId": "A1",
      "answer": "Concise answer here"
    }
  ]
}

Rules:
- Group questions into sections by type
- Section A = first type
- Section B = second type
- Assign difficulty:
  - 40% Easy
  - 40% Moderate
  - 20% Hard
- Difficulty values must be exactly:
  - "Easy"
  - "Moderate"
  - "Hard"
- Each section instruction must mention marks per question
- Questions must be educationally appropriate
- Answer key must have one entry per question
- Return ONLY the JSON object
`
}

export async function generateQuestionPaper(
  questionTypes: QuestionType[],
  additionalInstructions: string,
  fileName?: string
): Promise<ParsedPaper> {
  try {
    const prompt = buildPrompt(
      questionTypes,
      additionalInstructions,
      fileName
    )

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI that ONLY returns valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const raw =
      completion.choices[0]?.message?.content || '{}'

    // Clean accidental markdown
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const parsed: ParsedPaper = JSON.parse(cleaned)

    // Basic validation
    if (
      !parsed.sections ||
      !Array.isArray(parsed.sections)
    ) {
      throw new Error(
        'Invalid AI response: missing sections array'
      )
    }

    if (
      !parsed.answerKey ||
      !Array.isArray(parsed.answerKey)
    ) {
      throw new Error(
        'Invalid AI response: missing answerKey array'
      )
    }

    return parsed
  } catch (error) {
    console.error('Question paper generation error:', error)
    throw new Error('Failed to generate question paper')
  }
}