import { useEffect, useState } from 'react'
import { makeScenario, proposalText, stackLabel } from '../lib/motionDrill'

const NO_SCORE = { answered: 0, correct: 0, streak: 0 }

export default function MotionDrill({ onLookup }) {
  const [scenario, setScenario] = useState(() => makeScenario())
  const [guess, setGuess] = useState(null)
  const [score, setScore] = useState(NO_SCORE)

  const revealed = guess !== null
  const right = revealed && guess === scenario.inOrder

  function answer(inOrder) {
    if (revealed) return
    setGuess(inOrder)
    const ok = inOrder === scenario.inOrder
    setScore((s) => ({ answered: s.answered + 1, correct: s.correct + (ok ? 1 : 0), streak: ok ? s.streak + 1 : 0 }))
  }

  function next() {
    setScenario(makeScenario())
    setGuess(null)
  }

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'y' || k === '1') answer(true)
      else if (k === 'n' || k === '2') answer(false)
      else if ((e.key === 'Enter' || e.key === ' ') && revealed) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const choiceClass = (value) => {
    let cls = 'q-option drill-choice'
    if (revealed) {
      if (value === scenario.inOrder) cls += ' correct'
      else if (value === guess) cls += ' incorrect'
    }
    return cls
  }

  const { stack, motion } = scenario

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Order of precedence</div>
        <h2>Motion Drill</h2>
        <p>
          Business is already on the floor and a member makes a new motion. Is it in
          order right now? This is the rule Round 1 tests and Round 2 judges watch you apply.
        </p>
      </div>

      {score.answered > 0 && (
        <div className="session-bar">
          <div><span className="mono">{score.answered}</span> answered</div>
          <div><span className="mono">{Math.round((score.correct / score.answered) * 100)}%</span> accuracy</div>
          <div><span className="mono">{score.streak}</span> in a row</div>
        </div>
      )}

      <div className="q-card">
        <div className="q-card-top">
          <span className="q-cat">Now pending, most recent first</span>
        </div>

        <ol className="drill-stack">
          {stack.map((m, i) => ({ m, i })).reverse().map(({ m, i }) => (
            <li key={i} className={i === stack.length - 1 ? 'top' : ''}>
              <span className="drill-rank mono">{revealed ? m.rank : ''}</span>
              <span>{stackLabel(stack, i)}</span>
              {i === stack.length - 1 && <span className="drill-tag">immediately pending</span>}
            </li>
          ))}
        </ol>

        <div className="drill-move">
          <span className="label">A member moves</span>
          <div className="drill-motion">
            {proposalText(motion)}
            {revealed && <span className="drill-motion-rank mono">rank {motion.rank}</span>}
          </div>
        </div>

        <div className="drill-answers">
          <button className={choiceClass(true)} onClick={() => answer(true)} disabled={revealed}>
            In order
          </button>
          <button className={choiceClass(false)} onClick={() => answer(false)} disabled={revealed}>
            Out of order
          </button>
        </div>

        {revealed && (
          <div className="q-feedback">
            <div className={right ? 'verdict correct' : 'verdict incorrect'}>
              {right ? 'Correct' : 'Not quite'}: it’s {scenario.inOrder ? 'in order' : 'out of order'}
            </div>
            <p className="drill-reason">{scenario.reason}</p>
            <div className="drill-actions">
              <button className="next-btn" onClick={next} autoFocus>Next motion →</button>
              <button className="ghost-btn" onClick={() => onLookup('reference', null)}>Open the precedence chart</button>
            </div>
          </div>
        )}
      </div>

      <div className="shortcut-hint">Y or 1 for in order · N or 2 for out of order · Enter for next</div>
    </div>
  )
}
