import { useState } from 'react'
import { makeRound, ROUNDS } from '../lib/motionMatch'

const NO_TOTALS = { pairs: 0, firstTry: 0, mistakes: 0 }

export default function MotionMatch() {
  const [roundNo, setRoundNo] = useState(1)
  const [round, setRound] = useState(() => makeRound())
  const [matched, setMatched] = useState({}) // motion index -> tile index
  const [pickedMotion, setPickedMotion] = useState(null)
  const [pickedTile, setPickedTile] = useState(null)
  const [shake, setShake] = useState(null)
  const [roundMistakes, setRoundMistakes] = useState(0)
  const [missed, setMissed] = useState(() => new Set())
  const [totals, setTotals] = useState(NO_TOTALS)
  const [finished, setFinished] = useState(false)

  const usedTiles = new Set(Object.values(matched))
  const roundDone = Object.keys(matched).length === round.motions.length

  function tryPair(mi, ti) {
    setPickedMotion(null)
    setPickedTile(null)
    if (round.tiles[ti] !== round.motions[mi].answer) {
      setRoundMistakes((n) => n + 1)
      setMissed((s) => new Set(s).add(mi))
      setShake((s) => ({ mi, ti, key: (s?.key ?? 0) + 1 }))
      return
    }
    const next = { ...matched, [mi]: ti }
    setMatched(next)
    if (Object.keys(next).length === round.motions.length) {
      setTotals((t) => ({
        pairs: t.pairs + round.motions.length,
        firstTry: t.firstTry + round.motions.length - missed.size,
        mistakes: t.mistakes + roundMistakes,
      }))
    }
  }

  function pickMotion(mi) {
    if (mi in matched) return
    if (pickedTile !== null) return tryPair(mi, pickedTile)
    setPickedMotion(pickedMotion === mi ? null : mi)
  }

  function pickTile(ti) {
    if (usedTiles.has(ti)) return
    if (pickedMotion !== null) return tryPair(pickedMotion, ti)
    setPickedTile(pickedTile === ti ? null : ti)
  }

  function startRound(no, previousKey) {
    setRoundNo(no)
    setRound(makeRound(Math.random, previousKey))
    setMatched({})
    setPickedMotion(null)
    setPickedTile(null)
    setShake(null)
    setRoundMistakes(0)
    setMissed(new Set())
  }

  function nextRound() {
    if (roundNo >= ROUNDS) return setFinished(true)
    startRound(roundNo + 1, round.column.key)
  }

  function playAgain() {
    setTotals(NO_TOTALS)
    setFinished(false)
    startRound(1, null)
  }

  if (finished) {
    const pct = totals.pairs ? Math.round((totals.firstTry / totals.pairs) * 100) : 0
    return (
      <div className="q-card match-summary">
        <div className="q-card-top"><span className="q-cat">Match drill complete</span></div>
        <div className="stat-row">
          <div className="stat-card"><div className="stat-value mono">{pct}%</div><div className="stat-label">Matched on the first try</div></div>
          <div className="stat-card"><div className="stat-value mono">{totals.firstTry}/{totals.pairs}</div><div className="stat-label">First-try pairs</div></div>
          <div className="stat-card"><div className="stat-value mono">{totals.mistakes}</div><div className="stat-label">Wrong taps</div></div>
        </div>
        <button className="next-btn" onClick={playAgain}>Play again</button>
      </div>
    )
  }

  const cardClass = (base, { picked, done, used, wrong }) =>
    [base, picked && 'picked', done && 'done', used && 'used', wrong && 'wrong'].filter(Boolean).join(' ')

  return (
    <div className="q-card match">
      <div className="match-head">
        <div className="match-prompt">{round.column.prompt}</div>
        <div className="match-progress">
          Round {roundNo} of {ROUNDS}
          {totals.pairs > 0 && ` · ${totals.firstTry}/${totals.pairs} first try so far`}
        </div>
      </div>

      <div className="match-board">
        <div className="match-col">
          <span className="label">Motions</span>
          {round.motions.map((m, mi) => {
            const done = mi in matched
            const wrong = shake?.mi === mi
            return (
              <button
                key={wrong ? `m${mi}-${shake.key}` : `m${mi}`}
                className={cardClass('match-card', { picked: pickedMotion === mi, done, wrong })}
                onClick={() => pickMotion(mi)}
                disabled={done}
                aria-pressed={pickedMotion === mi}
              >
                <span>{m.name}</span>
                {done ? <span className="match-card-sub">{m.answer}</span> : <span className="match-card-class">{m.classLabel}</span>}
              </button>
            )
          })}
        </div>
        <div className="match-col">
          <span className="label">Answers</span>
          {round.tiles.map((text, ti) => {
            const used = usedTiles.has(ti)
            const wrong = shake?.ti === ti
            return (
              <button
                key={wrong ? `t${ti}-${shake.key}` : `t${ti}`}
                className={cardClass('match-card', { picked: pickedTile === ti, used, wrong })}
                onClick={() => pickTile(ti)}
                disabled={used}
                aria-pressed={pickedTile === ti}
              >
                {text}
              </button>
            )
          })}
        </div>
      </div>

      <div className="match-footer">
        {roundDone ? (
          <>
            <span>
              Round complete{roundMistakes ? ` with ${roundMistakes} wrong ${roundMistakes === 1 ? 'tap' : 'taps'}` : ', no mistakes'}.
            </span>
            <button className="next-btn" onClick={nextRound} autoFocus>
              {roundNo >= ROUNDS ? 'See results' : 'Next round →'}
            </button>
          </>
        ) : (
          <span>Tap a motion, then its answer. Answers can repeat, so any matching tile counts.</span>
        )}
      </div>
    </div>
  )
}
