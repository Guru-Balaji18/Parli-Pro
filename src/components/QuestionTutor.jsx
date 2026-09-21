import { useMemo } from 'react'
import AskAI from './AskAI'
import { useExplanation } from '../lib/explanations'
import { questionContext } from '../lib/askContext'

// The "ask about this one" panel under an answered question. It hands the
// tutor the question, the key, what the student picked, and the app's own
// explanation, so follow-ups don't start from nothing.
export default function QuestionTutor({ question, picked, profile }) {
  const note = useExplanation(question.id)
  const context = useMemo(() => questionContext(question, picked, note), [question, picked, note])
  const right = picked === question.answer
  const suggestions = right
    ? ['Why is this the answer?', 'When would this rule not apply?']
    : ['Why is my answer wrong?', 'Explain this like I’m new to parli pro']

  return (
    // Keyed on the question so moving to the next one starts a clean panel.
    <AskAI
      key={question.id}
      profile={profile}
      context={context}
      collapsible
      openLabel="Ask the AI tutor about this question"
      suggestions={suggestions}
      placeholder="Ask about this question…"
      intro="Ask anything about this question — why the key says what it says, what the motion does, or how it would sound in a real meeting."
    />
  )
}
