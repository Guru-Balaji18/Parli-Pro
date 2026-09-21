import { citation, useExplanation } from '../lib/explanations'

export default function Explanation({ id, letter, answerText }) {
  const note = useExplanation(id)
  if (!note) return null
  return (
    <div className={`explanation ${note.conflict ? 'conflict' : ''}`}>
      <div className="explanation-label">What the rulebook says</div>
      {note.sources.map((s) => (
        <div className="explanation-source" key={s.ref}>
          <div className="explanation-cite">
            In <cite>Robert’s Rules of Order Newly Revised</cite> (12th ed.), {citation(s)}, it says (paraphrased):
          </div>
          <p>{s.says}</p>
        </div>
      ))}
      {note.answer && <p className="explanation-link"><strong>So:</strong> {note.answer}</p>}
      <p className="explanation-key">
        Dunbar’s answer key: <strong>{letter}</strong>{answerText ? ` — ${answerText}` : ''}
      </p>
      {note.conflict && (
        <p className="explanation-conflict"><strong>Heads up:</strong> {note.conflict}</p>
      )}
    </div>
  )
}
