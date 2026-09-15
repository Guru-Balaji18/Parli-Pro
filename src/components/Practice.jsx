import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { missedQuestionIds } from '../lib/useRecord'
import { CATEGORIES } from '../data/categories'
import { findLookup } from '../lib/lookup'
import questions from '../data/questions.json'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const LETTERS = ['A', 'B', 'C', 'D']
const EXAM_COUNT = 50
const EXAM_SECONDS = 60 * 60

function fmtClock(s) {
  const m = Math.floor(Math.abs(s) / 60)
  const sec = Math.floor(Math.abs(s) % 60)
  return `${s < 0 ? '-' : ''}${m}:${String(sec).padStart(2, '0')}`
}

export default function Practice({ mode, record, profile, onLookup }) {
  const { attempts, flags, reload } = record
  const isExam = mode === 'exam'
  const isReview = mode === 'review'
  const isFlagged = mode === 'flagged'

  const countsByCategory = useMemo(() => {
    const m = {}
    for (const q of questions) m[q.category_id] = (m[q.category_id] || 0) + 1
    return m
  }, [])

  const [selected, setSelected] = useState(() => CATEGORIES.map((c) => c.id))
  const [filterOpen, setFilterOpen] = useState(false)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [session, setSession] = useState({ count: 0, correct: 0, totalTime: 0 })
  const [examState, setExamState] = useState('idle') // idle | running | done
  const [examRemaining, setExamRemaining] = useState(EXAM_SECONDS)
  const [examAnswers, setExamAnswers] = useState({})
  const startRef = useRef(performance.now())
  const examStartRef = useRef(null)

  const basePool = useMemo(() => {
    if (isReview) {
      if (!attempts) return []
      const missed = missedQuestionIds(attempts)
      return questions.filter((q) => missed.has(q.id))
    }
    if (isFlagged) {
      if (!flags) return []
      return questions.filter((q) => flags.has(q.id))
    }
    return questions.filter((q) => selected.includes(q.category_id))
  }, [isReview, isFlagged, attempts, flags, selected])

  const resetRound = useCallback((pool) => {
    setQueue(shuffle(pool))
    setIndex(0)
    setAnswer(null)
    setRevealed(false)
    setElapsed(0)
    startRef.current = performance.now()
  }, [])

  useEffect(() => {
    if (isExam) return
    resetRound(basePool)
    setSession({ count: 0, correct: 0, totalTime: 0 })
  }, [basePool, isExam, resetRound])

  // per-question stopwatch
  useEffect(() => {
    if (revealed || queue.length === 0) return
    if (isExam && examState !== 'running') return
    const t = setInterval(() => {
      setElapsed((performance.now() - startRef.current) / 1000)
    }, 100)
    return () => clearInterval(t)
  }, [revealed, index, queue.length, isExam, examState])

  // exam countdown
  useEffect(() => {
    if (!isExam || examState !== 'running') return
    const t = setInterval(() => {
      const left = EXAM_SECONDS - (performance.now() - examStartRef.current) / 1000
      setExamRemaining(left)
      if (left <= 0) finishExam()
    }, 250)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExam, examState])

  const current = queue[index]

  const logAttempt = useCallback((q, letter, seconds, correct) => {
    supabase
      .from('attempts')
      .insert({
        question_id: q.id,
        category_id: q.category_id,
        selected_answer: letter,
        is_correct: correct,
        time_seconds: Math.round(seconds * 10) / 10,
        mode,
        user_id: profile.id,
      })
      .then(({ error }) => error && console.error(error))
  }, [mode, profile.id])

  function pick(letter) {
    if (!current) return
    const seconds = (performance.now() - startRef.current) / 1000
    const correct = letter === current.answer

    if (isExam) {
      if (examState !== 'running') return
      setExamAnswers((prev) => ({ ...prev, [current.id]: { letter, seconds } }))
      setAnswer(letter)
      return
    }

    if (revealed) return
    setAnswer(letter)
    setRevealed(true)
    setSession((s) => ({
      count: s.count + 1,
      correct: s.correct + (correct ? 1 : 0),
      totalTime: s.totalTime + seconds,
    }))
    logAttempt(current, letter, seconds, correct)
  }

  function next() {
    if (index + 1 >= queue.length) {
      if (isExam) return finishExam()
      resetRound(basePool)
      return
    }
    setIndex((i) => i + 1)
    setAnswer(isExam ? examAnswers[queue[index + 1]?.id]?.letter ?? null : null)
    setRevealed(false)
    setElapsed(0)
    startRef.current = performance.now()
  }

  function prev() {
    if (index === 0) return
    setIndex((i) => i - 1)
    setAnswer(examAnswers[queue[index - 1]?.id]?.letter ?? null)
    setElapsed(0)
    startRef.current = performance.now()
  }

  async function toggleFlag() {
    if (!current) return
    const on = flags?.has(current.id)
    if (on) await supabase.from('flags').delete().eq('question_id', current.id).eq('user_id', profile.id)
    else await supabase.from('flags').insert({ question_id: current.id, user_id: profile.id })
    reload()
  }

  function startExam() {
    const pool = questions.filter((q) => selected.includes(q.category_id))
    setQueue(shuffle(pool).slice(0, EXAM_COUNT))
    setIndex(0)
    setAnswer(null)
    setExamAnswers({})
    setExamRemaining(EXAM_SECONDS)
    setExamState('running')
    examStartRef.current = performance.now()
    startRef.current = performance.now()
  }

  function finishExam() {
    setExamState('done')
    const duration = (performance.now() - examStartRef.current) / 1000
    let correct = 0
    for (const q of queue) {
      const a = examAnswers[q.id]
      if (!a) continue
      const ok = a.letter === q.answer
      if (ok) correct += 1
      logAttempt(q, a.letter, a.seconds, ok)
    }
    supabase
      .from('exam_sessions')
      .insert({
        question_count: queue.length,
        correct_count: correct,
        duration_seconds: Math.round(duration),
        finished_at: new Date().toISOString(),
        user_id: profile.id,
      })
      .then(() => reload())
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT') return
      const k = e.key.toLowerCase()
      if (['a', 'b', 'c', 'd'].includes(k)) pick(k.toUpperCase())
      else if (['1', '2', '3', '4'].includes(k)) pick(LETTERS[Number(k) - 1])
      else if (e.key === 'Enter' || e.key === ' ') {
        if (revealed || isExam) {
          e.preventDefault()
          next()
        }
      } else if (k === 'f') toggleFlag()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const sessionAccuracy = session.count ? Math.round((session.correct / session.count) * 100) : null
  const sessionAvgTime = session.count ? session.totalTime / session.count : null

  // ---------- exam intro / results ----------
  if (isExam && examState === 'idle') {
    return (
      <div>
        <div className="page-head">
          <div className="eyebrow">Round One simulation</div>
          <h2>Mock Written Test</h2>
          <p>
            50 questions, 60 minutes, no feedback until you submit — the same
            shape as the real Round 1 test. No time announcements, just like the
            ILC testing center.
          </p>
        </div>
        <CategoryFilter
          selected={selected}
          setSelected={setSelected}
          counts={countsByCategory}
          open={filterOpen}
          setOpen={setFilterOpen}
        />
        <button className="next-btn" onClick={startExam} disabled={selected.length === 0}>
          Start the 60-minute test
        </button>
      </div>
    )
  }

  if (isExam && examState === 'done') {
    const answered = queue.filter((q) => examAnswers[q.id])
    const correct = answered.filter((q) => examAnswers[q.id].letter === q.answer).length
    const pct = Math.round((correct / queue.length) * 100)
    return (
      <div>
        <div className="page-head">
          <div className="eyebrow">Round One simulation</div>
          <h2>Test complete</h2>
        </div>
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-value mono">{pct}%</div>
            <div className="stat-label">Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value mono">{correct}/{queue.length}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-card">
            <div className="stat-value mono">{queue.length - answered.length}</div>
            <div className="stat-label">Left blank</div>
          </div>
          <div className="stat-card">
            <div className="stat-value mono">{fmtClock(EXAM_SECONDS - examRemaining)}</div>
            <div className="stat-label">Time used</div>
          </div>
        </div>
        {pct >= 70 && (
          <p className="note-good">
            Above 70% — the threshold NAP uses for its post-ILC recognition outreach.
          </p>
        )}
        <h3 className="section-title">Review every question</h3>
        <ol className="exam-review">
          {queue.map((q) => {
            const a = examAnswers[q.id]
            const ok = a && a.letter === q.answer
            return (
              <li key={q.id} className={ok ? 'ok' : 'bad'}>
                <div className="er-q">{q.question}</div>
                <div className="er-a">
                  {a ? (
                    <>
                      You: <strong>{a.letter}</strong> — {q.options[a.letter]}
                    </>
                  ) : (
                    <em>Left blank</em>
                  )}
                </div>
                {!ok && (
                  <div className="er-correct">
                    Correct: <strong>{q.answer}</strong> — {q.options[q.answer]}
                  </div>
                )}
                <div className="er-src">
                  {q.category}
                  {q.ronr_pages ? ` · cited to RONR p. ${q.ronr_pages}` : ''}
                </div>
                <LookupLink question={q} onLookup={onLookup} />
              </li>
            )
          })}
        </ol>
        <button className="next-btn" onClick={() => setExamState('idle')}>
          Take another test
        </button>
      </div>
    )
  }

  // ---------- empty states ----------
  const heads = {
    practice: { eyebrow: 'Question bank', title: 'Practice', blurb: `${basePool.length.toLocaleString()} questions in the current filter. Reshuffles and keeps going until you stop.` },
    review: { eyebrow: 'Targeted drilling', title: 'Missed Questions', blurb: 'Every question you got wrong the last time you saw it. Answer it right and it leaves this list.' },
    flagged: { eyebrow: 'Targeted drilling', title: 'Flagged Questions', blurb: 'Questions you marked to come back to. Press F to flag or unflag.' },
  }
  const head = heads[mode] || heads.practice

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">{head.eyebrow}</div>
        <h2>{head.title}</h2>
        <p>{head.blurb}</p>
      </div>

      {isExam && (
        <div className={`exam-bar ${examRemaining < 300 ? 'urgent' : ''}`}>
          <span className="mono">{fmtClock(examRemaining)}</span> remaining ·
          Question <span className="mono">{index + 1}</span> of {queue.length} ·
          <span className="mono"> {Object.keys(examAnswers).length}</span> answered
          <button className="submit-exam" onClick={finishExam}>Submit test</button>
        </div>
      )}

      {mode === 'practice' && (
        <CategoryFilter
          selected={selected}
          setSelected={setSelected}
          counts={countsByCategory}
          open={filterOpen}
          setOpen={setFilterOpen}
        />
      )}

      {session.count > 0 && !isExam && (
        <div className="session-bar">
          <div><span className="mono">{session.count}</span> answered</div>
          <div><span className="mono">{sessionAccuracy}%</span> accuracy</div>
          <div><span className="mono">{sessionAvgTime.toFixed(1)}s</span> avg</div>
        </div>
      )}

      {!current && (
        <div className="empty-state">
          {isReview
            ? "Nothing to review — you haven't missed anything yet."
            : isFlagged
            ? 'No flagged questions. Press F while practicing to flag one.'
            : 'Pick at least one category to start.'}
        </div>
      )}

      {current && (
        <div className="q-card">
          <div className="q-card-top">
            <span className="q-cat">{current.category}</span>
            <div className="q-card-tools">
              <button
                className={`flag-btn ${flags?.has(current.id) ? 'on' : ''}`}
                onClick={toggleFlag}
                title="Flag this question (F)"
              >
                {flags?.has(current.id) ? '★ Flagged' : '☆ Flag'}
              </button>
              {!isExam && <span className="q-timer mono">{elapsed.toFixed(1)}s</span>}
            </div>
          </div>
          <div className="q-text">{current.question}</div>
          <div className="q-options">
            {LETTERS.map((letter) => {
              const text = current.options[letter]
              if (!text) return null
              let cls = 'q-option'
              if (revealed) {
                if (letter === current.answer) cls += ' correct'
                else if (letter === answer) cls += ' incorrect'
              } else if (letter === answer) cls += ' selected'
              return (
                <button key={letter} className={cls} onClick={() => pick(letter)} disabled={revealed}>
                  <span className="q-letter">{letter}</span>
                  <span>{text}</span>
                </button>
              )
            })}
          </div>

          {isExam && (
            <div className="exam-nav">
              <button onClick={prev} disabled={index === 0}>← Previous</button>
              <button onClick={next}>
                {index + 1 >= queue.length ? 'Finish' : 'Next →'}
              </button>
            </div>
          )}

          {revealed && (
            <div className="q-feedback">
              <div className={answer === current.answer ? 'verdict correct' : 'verdict incorrect'}>
                {answer === current.answer ? 'Correct' : `Incorrect — answer is ${current.answer}`}
              </div>
              <div className="q-source">
                {current.source}
                {current.ronr_pages ? ` · cited to RONR p. ${current.ronr_pages}` : ''}
              </div>
              <LookupLink question={current} onLookup={onLookup} />
              <button className="next-btn" onClick={next} autoFocus>Next question →</button>
            </div>
          )}
        </div>
      )}

      {current && (
        <div className="shortcut-hint">
          A–D or 1–4 to answer · Enter for next · F to flag
        </div>
      )}
    </div>
  )
}

function LookupLink({ question, onLookup }) {
  const hit = useMemo(() => findLookup(question.question, question.options), [question])
  if (!hit || !onLookup) return null
  return (
    <button className="lookup-link" onClick={() => onLookup(hit.type, hit.anchor)}>
      Read more on {hit.label}
      <span className="lookup-dest">{hit.type === 'reference' ? 'Reference' : 'Vocabulary'} →</span>
    </button>
  )
}

function CategoryFilter({ selected, setSelected, counts, open, setOpen }) {
  return (
    <>
      <button className="filter-toggle" onClick={() => setOpen(!open)}>
        {open ? 'Hide categories' : 'Filter categories'}
        <span className="filter-count">{selected.length}/{CATEGORIES.length}</span>
      </button>
      {open && (
        <div className="filter-panel">
          <div className="filter-actions">
            <button onClick={() => setSelected(CATEGORIES.map((c) => c.id))}>Select all</button>
            <button onClick={() => setSelected([])}>Clear</button>
          </div>
          <div className="filter-grid">
            {CATEGORIES.map((c) => (
              <label key={c.id} className="filter-row">
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() =>
                    setSelected(
                      selected.includes(c.id)
                        ? selected.filter((x) => x !== c.id)
                        : [...selected, c.id]
                    )
                  }
                />
                <span>{c.name}</span>
                <span className="filter-n mono">{counts[c.id] || 0}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
