import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { REVIEW_CLEAR_DAYS, reviewState } from '../lib/review'
import { CATEGORIES } from '../data/categories'
import { findLookup } from '../lib/lookup'
import questions from '../data/questions.json'
import { layoutOptions, shuffle } from '../lib/quiz'
import Explanation from './Explanation'
import Icon from './Icons'
import { bigCelebration, popFrom } from '../lib/celebrate'

const EXAM_COUNT = 50
const EXAM_SECONDS = 60 * 60
const THREE_CHOICE_KEY = 'ppa_three_choice'
const NO_SESSION = { count: 0, correct: 0, totalTime: 0, streak: 0 }
const STREAK_MILESTONES = [5, 10, 15, 20, 30, 50]

function fmtClock(s) {
  const m = Math.floor(Math.abs(s) / 60)
  const sec = Math.floor(Math.abs(s) % 60)
  return `${s < 0 ? '-' : ''}${m}:${String(sec).padStart(2, '0')}`
}

export default function Practice({ mode, record, profile, onLookup }) {
  const { attempts, reload } = record
  const isExam = mode === 'exam'
  const isReview = mode === 'review'

  const countsByCategory = useMemo(() => {
    const m = {}
    for (const q of questions) m[q.category_id] = (m[q.category_id] || 0) + 1
    return m
  }, [])

  const [selected, setSelected] = useState(() => CATEGORIES.map((c) => c.id))
  const [filterOpen, setFilterOpen] = useState(false)
  const [threeChoice, setThreeChoice] = useState(() => {
    try {
      return localStorage.getItem(THREE_CHOICE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31))
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [session, setSession] = useState(NO_SESSION)
  const [examState, setExamState] = useState('idle') // idle | running | done
  const [examRemaining, setExamRemaining] = useState(EXAM_SECONDS)
  const [examAnswers, setExamAnswers] = useState({})
  const startRef = useRef(performance.now())
  const examStartRef = useRef(null)
  const pendingWrites = useRef([])
  const finishExamRef = useRef(null)

  // Each mode's pool depends only on its own source, so flagging a question or
  // refreshing the record doesn't reshuffle a practice round in progress.
  const practicePool = useMemo(() => questions.filter((q) => selected.includes(q.category_id)), [selected])
  const review = useMemo(() => (attempts ? reviewState(attempts) : null), [attempts])
  const reviewPool = useMemo(() => (review ? questions.filter((q) => review.due.has(q.id)) : []), [review])
  const basePool = isReview ? reviewPool : practicePool
  const poolLoading = isReview && !attempts

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
  }, [basePool, isExam, resetRound])

  function changeSelected(ids) {
    setSelected(ids)
    setSession(NO_SESSION)
  }

  // per-question stopwatch
  useEffect(() => {
    if (revealed || queue.length === 0) return
    if (isExam && examState !== 'running') return
    const t = setInterval(() => {
      setElapsed((performance.now() - startRef.current) / 1000)
    }, 100)
    return () => clearInterval(t)
  }, [revealed, index, queue.length, isExam, examState])

  // The countdown's interval outlives many renders; going through a ref makes a
  // time-up submission use the answers given so far, not the ones at the start.
  useEffect(() => {
    finishExamRef.current = finishExam
  })

  // exam countdown
  useEffect(() => {
    if (!isExam || examState !== 'running') return
    const t = setInterval(() => {
      const left = EXAM_SECONDS - (performance.now() - examStartRef.current) / 1000
      setExamRemaining(left)
      if (left <= 0) {
        clearInterval(t)
        finishExamRef.current()
      }
    }, 250)
    return () => clearInterval(t)
  }, [isExam, examState])

  const current = queue[index]
  const layout = useMemo(() => (current ? layoutOptions(current, threeChoice, seed) : []), [current, threeChoice, seed])
  const shownLetter = (q, orig) => layoutOptions(q, threeChoice, seed).find((o) => o.orig === orig)?.shown ?? orig

  const refreshRecord = useCallback(() => {
    const writes = pendingWrites.current
    pendingWrites.current = []
    return Promise.allSettled(writes).then(() => reload())
  }, [reload])

  // Answers save in the background; refresh on the way out so the Dashboard and
  // Missed list reflect this session.
  useEffect(() => () => { refreshRecord() }, [refreshRecord])

  const logAttempt = useCallback((q, letter, seconds, correct) => {
    const write = supabase
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
    pendingWrites.current.push(write)
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
    const streak = correct ? session.streak + 1 : 0
    setSession((s) => ({
      count: s.count + 1,
      correct: s.correct + (correct ? 1 : 0),
      totalTime: s.totalTime + seconds,
      streak,
    }))
    if (correct) {
      if (STREAK_MILESTONES.includes(streak)) bigCelebration()
      else popFrom(document.querySelector(`[data-orig="${letter}"]`))
    }
    logAttempt(current, letter, seconds, correct)
  }

  function next() {
    if (index + 1 >= queue.length) {
      if (isExam) return finishExam()
      // Re-pull the record so questions answered right today wait for tomorrow
      // instead of coming straight back.
      if (isReview) return refreshRecord()
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

  function toggleThreeChoice() {
    const on = !threeChoice
    setThreeChoice(on)
    try {
      localStorage.setItem(THREE_CHOICE_KEY, on ? '1' : '0')
    } catch {
      // storage unavailable (private browsing); the setting just won't persist
    }
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
    const scored = queue.filter((q) => examAnswers[q.id]?.letter === q.answer).length
    if (queue.length && scored / queue.length >= 0.7) setTimeout(bigCelebration, 350)
    const duration = (performance.now() - examStartRef.current) / 1000
    let correct = 0
    for (const q of queue) {
      const a = examAnswers[q.id]
      if (!a) continue
      const ok = a.letter === q.answer
      if (ok) correct += 1
      logAttempt(q, a.letter, a.seconds, ok)
    }
    pendingWrites.current.push(
      supabase
        .from('exam_sessions')
        .insert({
          question_count: queue.length,
          correct_count: correct,
          duration_seconds: Math.round(duration),
          finished_at: new Date().toISOString(),
          user_id: profile.id,
        })
        .then(({ error }) => error && console.error(error))
    )
    refreshRecord()
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      const letterSlot = ['a', 'b', 'c', 'd'].indexOf(k)
      const slot = letterSlot >= 0 ? letterSlot : ['1', '2', '3', '4'].indexOf(k)
      if (slot >= 0) {
        if (layout[slot]) pick(layout[slot].orig)
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (revealed || isExam) {
          e.preventDefault()
          next()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const sessionAccuracy = session.count ? Math.round((session.correct / session.count) * 100) : null
  const sessionAvgTime = session.count ? session.totalTime / session.count : null
  const choiceToggle = <ThreeChoiceToggle on={threeChoice} onToggle={toggleThreeChoice} />

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
          setSelected={changeSelected}
          counts={countsByCategory}
          open={filterOpen}
          setOpen={setFilterOpen}
        >
          {choiceToggle}
        </CategoryFilter>
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
                      You: <strong>{shownLetter(q, a.letter)}</strong> — {q.options[a.letter]}
                    </>
                  ) : (
                    <em>Left blank</em>
                  )}
                </div>
                {!ok && (
                  <>
                    <div className="er-correct">
                      Correct: <strong>{shownLetter(q, q.answer)}</strong> — {q.options[q.answer]}
                    </div>
                    <Explanation id={q.id} letter={shownLetter(q, q.answer)} answerText={q.options[q.answer]} />
                  </>
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

  // ---------- practice / review / flagged ----------
  const heads = {
    practice: { eyebrow: 'Question bank', title: 'Practice', blurb: `${basePool.length.toLocaleString()} questions in the current filter. Reshuffles and keeps going until you stop.` },
    review: { eyebrow: 'Targeted drilling', title: 'Missed Questions', blurb: `Questions you've missed. Each one leaves this list once you've answered it right on ${REVIEW_CLEAR_DAYS} different days — right twice in one day counts once.` },
  }
  const head = heads[mode] || heads.practice
  const correctShown = current ? layout.find((o) => o.orig === current.answer)?.shown : null

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
          setSelected={changeSelected}
          counts={countsByCategory}
          open={filterOpen}
          setOpen={setFilterOpen}
        >
          {choiceToggle}
        </CategoryFilter>
      )}

      {isReview && <div className="practice-tools">{choiceToggle}</div>}

      {session.count > 0 && !isExam && (
        <div className="session-bar">
          <div><span className="mono">{session.count}</span> answered</div>
          <div><span className="mono">{sessionAccuracy}%</span> accuracy</div>
          <div><span className="mono">{sessionAvgTime.toFixed(1)}s</span> avg</div>
          {session.streak >= 2 && (
            <div className="streak-chip" key={session.streak}><span className="mono">{session.streak}</span> streak</div>
          )}
        </div>
      )}

      {poolLoading && <div className="empty-state">Loading your record…</div>}

      {!current && !poolLoading && basePool.length === 0 && (
        <div className="empty-state">
          {isReview
            ? review?.waiting.size
              ? `All caught up for today. ${review.waiting.size} ${review.waiting.size === 1 ? 'question comes' : 'questions come'} back tomorrow for a second right answer.`
              : "Nothing to review — you haven't missed anything yet."
            : 'Pick at least one category to start.'}
        </div>
      )}

      {current && (
        <div className="q-card">
          <div className="q-card-top">
            <span className="q-cat">{current.category}</span>
            <div className="q-card-tools">
              {isReview && review?.progress.has(current.id) && (
                <span className="review-progress">
                  Right on {review.progress.get(current.id)} of {REVIEW_CLEAR_DAYS} days
                </span>
              )}
              {!isExam && <span className="q-timer mono">{elapsed.toFixed(1)}s</span>}
            </div>
          </div>
          <div className="q-text">{current.question}</div>
          <div className="q-options">
            {layout.map(({ shown, orig, text }) => {
              let cls = 'q-option'
              if (revealed) {
                if (orig === current.answer) cls += ' correct'
                else if (orig === answer) cls += ' incorrect'
              } else if (orig === answer) cls += ' selected'
              return (
                <button key={orig} data-orig={orig} className={cls} onClick={() => pick(orig)} disabled={revealed}>
                  <span className="q-letter">{shown}</span>
                  <span className="q-option-text">{text}</span>
                </button>
              )
            })}
          </div>

          {threeChoice && layout.length === 4 && (
            <div className="choice-note">All four choices kept: one of them refers to the others.</div>
          )}

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
                <span className="verdict-icon"><Icon name={answer === current.answer ? 'check' : 'x'} strokeWidth={3} /></span>
                {answer === current.answer
                  ? session.streak >= 3 ? `Correct! ${session.streak} in a row` : 'Correct!'
                  : `Not quite. The answer is ${correctShown}`}
              </div>
              {isReview && (
                <ReviewNote correct={answer === current.answer} daysBefore={review?.progress.get(current.id) ?? 0} />
              )}
              <Explanation id={current.id} letter={correctShown} answerText={current.options[current.answer]} />
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
          A–{layout[layout.length - 1]?.shown} or 1–{layout.length} to answer · Enter for next
        </div>
      )}
    </div>
  )
}

function ReviewNote({ correct, daysBefore }) {
  let text
  if (!correct) text = 'Missed again, so the count starts over. It stays on your list.'
  else if (daysBefore + 1 >= REVIEW_CLEAR_DAYS) text = `That's ${REVIEW_CLEAR_DAYS} different days, so this one leaves your Missed list.`
  else text = `Right on ${daysBefore + 1} of ${REVIEW_CLEAR_DAYS} days. It comes back tomorrow; get it right again to clear it.`
  return <p className="review-note">{text}</p>
}

function ThreeChoiceToggle({ on, onToggle }) {
  return (
    <button type="button" className={`choice-toggle ${on ? 'on' : ''}`} onClick={onToggle} aria-pressed={on}>
      <span className="choice-toggle-track" aria-hidden="true"><span /></span>
      3 choices, like the HOSA test
    </button>
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

function CategoryFilter({ selected, setSelected, counts, open, setOpen, children }) {
  return (
    <>
      <div className="practice-tools">
        <button className="filter-toggle" onClick={() => setOpen(!open)}>
          {open ? 'Hide categories' : 'Filter categories'}
          <span className="filter-count">{selected.length}/{CATEGORIES.length}</span>
        </button>
        {children}
      </div>
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
