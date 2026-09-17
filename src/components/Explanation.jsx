import { useEffect, useState } from 'react'

// The explanations file is large, so it loads on first use instead of with the app.
let explanationsCache = null
let explanationsPromise = null
function loadExplanations() {
  if (!explanationsPromise) {
    explanationsPromise = import('../data/explanations.json').then((m) => {
      explanationsCache = m.default
      return explanationsCache
    })
  }
  return explanationsPromise
}

function useExplanation(id) {
  const [all, setAll] = useState(explanationsCache)
  useEffect(() => {
    if (all) return
    let live = true
    loadExplanations().then((data) => { if (live) setAll(data) }).catch(() => {})
    return () => { live = false }
  }, [all])
  return all ? all[id] : null
}

// Where a source sits in the book: a numbered paragraph ("46:6"), a footnote
// ("3:16n3"), a row of Table II ("T2-28"), one of the tinted-page lists ("L-V"),
// or the unnumbered Introduction.
function citation(s) {
  if (s.ref === 'Intro') return 'the Introduction'
  if (s.ref.startsWith('T2-')) return `Table II (Table of Rules Relating to Motions), entry ${s.ref.slice(3)}`
  if (s.ref.startsWith('L-')) return s.section
  const fn = s.ref.match(/^(\d+:\d+)n(\d+)$/)
  if (fn) return `${s.section}, footnote ${fn[2]} to paragraph ${fn[1]}`
  return `${s.section}, paragraph ${s.ref}`
}

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
