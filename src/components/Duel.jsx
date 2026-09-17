import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../data/categories'
import { layoutWithHidden } from '../lib/quiz'
import { DUEL_KEY, QUESTION_MAP, buildDuel, errorText, useServerOffset } from '../lib/duel'
import { bigCelebration, popFrom } from '../lib/celebrate'
import Explanation from './Explanation'
import Icon from './Icons'

const COUNT_CHOICES = [5, 10, 15, 20, 30]
const THREE_CHOICE_KEY = 'ppa_three_choice'

function readSession() {
  try {
    return sessionStorage.getItem(DUEL_KEY)
  } catch {
    return null
  }
}

function writeSession(id) {
  try {
    if (id) sessionStorage.setItem(DUEL_KEY, id)
    else sessionStorage.removeItem(DUEL_KEY)
  } catch {
    // storage unavailable; a refresh just won't rejoin the match
  }
}

export default function Duel({ profile, record }) {
  const [duelId, setDuelId] = useState(readSession)

  function enter(id) {
    writeSession(id)
    setDuelId(id)
  }

  function exit() {
    writeSession(null)
    setDuelId(null)
  }

  return duelId
    ? <Match key={duelId} id={duelId} profile={profile} record={record} onExit={exit} />
    : <DuelHome profile={profile} onEnter={enter} />
}

// ---------------------------------------------------------------- home

function DuelHome({ profile, onEnter }) {
  const [count, setCount] = useState(10)
  const [cats, setCats] = useState(() => CATEGORIES.map((c) => c.id))
  const [threeChoice, setThreeChoice] = useState(() => {
    try {
      return localStorage.getItem(THREE_CHOICE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [tally, setTally] = useState(null)

  useEffect(() => {
    let live = true
    supabase.rpc('duel_record', { p_user: profile.id }).then(({ data }) => {
      if (live && data?.[0]) setTally(data[0])
    })
    return () => { live = false }
  }, [profile.id])

  function toggleCat(id) {
    setCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  async function create() {
    setError('')
    const built = buildDuel(cats, count, threeChoice)
    if (built.available < count) {
      setError(`Only ${built.available} questions in those categories. Pick more categories or fewer questions.`)
      return
    }
    setBusy('create')
    const { available: _available, ...args } = built
    const { data, error: rpcError } = await supabase.rpc('duel_create', {
      p_user: profile.id,
      p_categories: cats.length === CATEGORIES.length ? [] : cats,
      ...args,
    })
    setBusy(null)
    if (rpcError || !data) return setError(errorText(rpcError))
    onEnter(data.id)
  }

  async function join(e) {
    e.preventDefault()
    if (code.trim().length < 4) return
    setError('')
    setBusy('join')
    const { data, error: rpcError } = await supabase.rpc('duel_join', { p_user: profile.id, p_code: code.trim() })
    setBusy(null)
    if (rpcError || !data) return setError(errorText(rpcError))
    onEnter(data.id)
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Head to head</div>
        <h2>1v1 Battle</h2>
        <p>Race a teammate through the same questions, live. Most right wins; if you tie, the faster total time takes it.</p>
        {tally && (
          <div className="duel-tally">
            <span><strong className="mono">{tally.wins}</strong> wins</span>
            <span><strong className="mono">{tally.losses}</strong> losses</span>
            <span><strong className="mono">{tally.draws}</strong> draws</span>
          </div>
        )}
      </div>

      {error && <div className="duel-error" role="alert">{error}</div>}

      <div className="duel-home">
        <motion.section className="duel-panel create" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="duel-panel-head">
            <span className="duel-panel-icon tone-pink"><Icon name="bolt" /></span>
            <div>
              <h3>Start a match</h3>
              <p>You’ll get a code to share with your opponent.</p>
            </div>
          </div>

          <div className="field-label">Questions</div>
          <div className="chip-row">
            {COUNT_CHOICES.map((n) => (
              <button key={n} className={`chip ${count === n ? 'on' : ''}`} onClick={() => setCount(n)}>{n}</button>
            ))}
            <label className="chip-custom">
              <span className="sr-only">Custom number of questions</span>
              <input
                type="number"
                min={3}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(3, Math.min(50, Number(e.target.value) || 3)))}
              />
            </label>
          </div>

          <div className="field-label">
            Categories
            <span className="field-actions">
              <button onClick={() => setCats(CATEGORIES.map((c) => c.id))}>All</button>
              <button onClick={() => setCats([])}>None</button>
            </span>
          </div>
          <div className="chip-row wrap">
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`chip small ${cats.includes(c.id) ? 'on' : ''}`} onClick={() => toggleCat(c.id)}>
                {c.short}
              </button>
            ))}
          </div>

          <button className={`choice-toggle ${threeChoice ? 'on' : ''}`} onClick={() => setThreeChoice(!threeChoice)} aria-pressed={threeChoice}>
            <span className="choice-toggle-track" aria-hidden="true"><span /></span>
            3 choices, like the HOSA test
          </button>

          <div className="duel-rule"><Icon name="clock" /> 30 seconds per question</div>

          <button className="next-btn big tone-pink" onClick={create} disabled={busy !== null || cats.length === 0}>
            {busy === 'create' ? 'Creating…' : 'Create match'}
          </button>
        </motion.section>

        <motion.section className="duel-panel join" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="duel-panel-head">
            <span className="duel-panel-icon tone-blue"><Icon name="duel" /></span>
            <div>
              <h3>Join a match</h3>
              <p>Type the 4-letter code your opponent shared.</p>
            </div>
          </div>
          <form onSubmit={join}>
            <input
              className="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
              placeholder="CODE"
              aria-label="Match code"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="next-btn big tone-blue" disabled={busy !== null || code.length < 4}>
              {busy === 'join' ? 'Joining…' : 'Join match'}
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- match

function Match({ id, profile, record, onExit }) {
  const [duel, setDuel] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [picks, setPicks] = useState({})
  const [reveals, setReveals] = useState({})
  const [holdUntil, setHoldUntil] = useState(0)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const offset = useServerOffset()
  const lastAdvance = useRef(0)
  const duelRef = useRef(null)

  // Updates can arrive out of order from realtime and polling; never go back.
  // When a match we were watching finishes, keep the last reveal up briefly.
  const apply = useCallback((next) => {
    const cur = duelRef.current
    if (cur && next.current_index < cur.current_index) return
    if (cur?.status === 'active' && next.status === 'finished') setHoldUntil(Date.now() + 3200)
    duelRef.current = next
    setDuel(next)
  }, [])

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('duels').select('*').eq('id', id).maybeSingle()
    if (error) return setLoadError('Couldn’t load the match.')
    if (!data) return setLoadError('That match no longer exists.')
    apply(data)
  }, [id, apply])

  // Live updates, with a slow poll in case the realtime connection drops.
  useEffect(() => {
    load()
    const channel = supabase
      .channel(`duel-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'duels', filter: `id=eq.${id}` }, (payload) => apply(payload.new))
      .subscribe()
    const poll = setInterval(load, 3000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [id, load, apply])

  const status = duel?.status
  const live = status === 'active' || (status === 'finished' && now < holdUntil)
  useEffect(() => {
    if (!live && status !== 'lobby') return
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [live, status])

  const idx = duel?.current_index ?? 0
  const total = duel?.question_ids.length ?? 0

  // Fetch the result of each question once it closes.
  useEffect(() => {
    if (!duel || duel.status === 'lobby') return
    const closed = duel.status === 'finished' ? total : idx
    const missing = []
    for (let i = 0; i < closed; i++) if (!reveals[i]) missing.push(i)
    if (!missing.length) return
    let active = true
    Promise.all(missing.map((i) => supabase.rpc('duel_reveal', { p_duel: id, p_index: i }).then((r) => [i, r.data?.[0]])))
      .then((rows) => {
        if (!active) return
        setReveals((prev) => {
          const next = { ...prev }
          for (const [i, row] of rows) if (row) next[i] = row
          return next
        })
      })
    return () => { active = false }
  }, [duel, idx, total, id, reveals])

  const finishedHandled = useRef(false)
  useEffect(() => {
    if (status !== 'finished' || finishedHandled.current) return
    finishedHandled.current = true
    record?.reload?.()
  }, [status, record])

  const isHost = duel?.host_id === profile.id
  const serverNow = now + offset
  const started = duel?.question_started_at ? Date.parse(duel.question_started_at) : 0
  const limitMs = (duel?.seconds_per_question ?? 30) * 1000
  const inQuestion = status === 'active' && serverNow >= started
  const remaining = Math.max(0, limitMs - (serverNow - started))

  // When time is up, nudge the server to close the question.
  useEffect(() => {
    if (status !== 'active' || !inQuestion) return
    if (serverNow - started < limitMs + 1200) return
    if (Date.now() - lastAdvance.current < 1500) return
    lastAdvance.current = Date.now()
    supabase.rpc('duel_advance', { p_duel: id, p_index: idx }).then(() => load())
  }, [status, inQuestion, serverNow, started, limitMs, id, idx, load])

  async function answer(letter) {
    if (!inQuestion || picks[idx] || remaining <= 0) return
    setPicks((p) => ({ ...p, [idx]: letter }))
    const { error } = await supabase.rpc('duel_answer', { p_user: profile.id, p_duel: id, p_index: idx, p_selected: letter })
    if (error && !error.message?.includes('question_closed')) console.error(error)
    load()
  }

  async function quit() {
    await supabase.rpc('duel_leave', { p_user: profile.id, p_duel: id })
    onExit()
  }

  if (loadError) {
    return (
      <div className="empty-state">
        <p>{loadError}</p>
        <button className="next-btn" onClick={onExit}>Back to 1v1</button>
      </div>
    )
  }
  if (!duel) return <div className="empty-state">Loading match…</div>

  if (duel.status === 'abandoned') {
    return (
      <div className="empty-state">
        <p>This match was cancelled.</p>
        <button className="next-btn" onClick={onExit}>Back to 1v1</button>
      </div>
    )
  }

  if (duel.status === 'lobby') {
    return isHost
      ? <Lobby duel={duel} onCancel={quit} />
      : <div className="empty-state"><p>Joining…</p></div>
  }

  const me = isHost
    ? { name: duel.host_name, score: duel.host_score, time: duel.host_time_ms, answered: duel.host_answered }
    : { name: duel.guest_name, score: duel.guest_score, time: duel.guest_time_ms, answered: duel.guest_answered }
  const opp = isHost
    ? { name: duel.guest_name, score: duel.guest_score, time: duel.guest_time_ms, answered: duel.guest_answered }
    : { name: duel.host_name, score: duel.host_score, time: duel.host_time_ms, answered: duel.host_answered }

  if (duel.status === 'finished' && now >= holdUntil) {
    return (
      <Results duel={duel} profile={profile} me={me} opp={opp} reveals={reveals} isHost={isHost} onExit={onExit} />
    )
  }

  const showingIdx = inQuestion ? idx : idx - 1
  const intermission = !inQuestion
  const countdown = Math.max(1, Math.ceil((started - serverNow) / 1000))

  return (
    <div className="match">
      <Scoreboard
        me={me}
        opp={opp}
        idx={idx}
        total={total}
        inQuestion={inQuestion}
        remaining={remaining}
        limitMs={limitMs}
        reveal={reveals[showingIdx]}
        isHost={isHost}
        intermission={intermission && showingIdx >= 0}
      />

      <AnimatePresence mode="wait">
        {intermission && showingIdx < 0 ? (
          <motion.div
            key="countdown"
            className="match-countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="match-countdown-label">Get ready!</div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={countdown}
                className="match-countdown-num"
                initial={{ scale: 2.2, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                {countdown}
              </motion.div>
            </AnimatePresence>
            <div className="match-countdown-sub">{total} questions · 30 seconds each</div>
          </motion.div>
        ) : (
          <QuestionCard
            key={`q-${showingIdx}`}
            duel={duel}
            index={showingIdx}
            pick={picks[showingIdx]}
            reveal={intermission ? reveals[showingIdx] : null}
            isHost={isHost}
            locked={intermission || Boolean(picks[showingIdx]) || me.answered >= showingIdx}
            onPick={answer}
            oppAnswered={opp.answered >= showingIdx}
            oppName={opp.name}
            nextIn={intermission && status === 'active' ? countdown : null}
            last={showingIdx === total - 1}
          />
        )}
      </AnimatePresence>

      <div className="match-foot">
        {confirmQuit ? (
          <span className="confirm-row">
            Quit and give your opponent the win?
            <button className="danger-btn small" onClick={quit}>Quit match</button>
            <button className="ghost-btn small" onClick={() => setConfirmQuit(false)}>Keep playing</button>
          </span>
        ) : (
          <button className="ghost-btn small" onClick={() => setConfirmQuit(true)}>Quit</button>
        )}
      </div>
    </div>
  )
}

function Lobby({ duel, onCancel }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(duel.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <div className="lobby">
      <div className="page-head">
        <div className="eyebrow">Waiting room</div>
        <h2>Share this code</h2>
        <p>Your opponent opens 1v1 Battle, taps Join, and types it in. The match starts the moment they join.</p>
      </div>
      <motion.div
        className="lobby-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="lobby-code" aria-label={`Match code ${duel.code.split('').join(' ')}`}>
          {duel.code.split('').map((ch, i) => (
            <motion.span
              key={i}
              initial={{ y: 30, opacity: 0, rotate: -10 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 380, damping: 16 }}
            >
              {ch}
            </motion.span>
          ))}
        </div>
        <button className="ghost-btn" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} /> {copied ? 'Copied!' : 'Copy code'}
        </button>
        <div className="lobby-wait">
          <span className="bounce-dots" aria-hidden="true"><i /><i /><i /></span>
          Waiting for an opponent
        </div>
        <div className="lobby-meta">
          {duel.question_ids.length} questions · 30s each{duel.three_choice ? ' · 3 choices' : ''}
        </div>
      </motion.div>
      <button className="ghost-btn small" onClick={onCancel}>Cancel match</button>
    </div>
  )
}

function Scoreboard({ me, opp, idx, total, inQuestion, remaining, limitMs, reveal, isHost, intermission }) {
  const meRef = useRef(null)
  const myCorrect = reveal ? (isHost ? reveal.host_correct : reveal.guest_correct) : null
  const oppCorrect = reveal ? (isHost ? reveal.guest_correct : reveal.host_correct) : null
  const popped = useRef(-1)

  useEffect(() => {
    if (intermission && myCorrect && popped.current !== idx) {
      popped.current = idx
      popFrom(meRef.current)
    }
  }, [intermission, myCorrect, idx])

  const secs = Math.ceil(remaining / 1000)
  const frac = inQuestion ? remaining / limitMs : 1
  const R = 26
  const C = 2 * Math.PI * R

  return (
    <div className="scoreboard">
      <PlayerCard ref={meRef} name={me.name} score={me.score} label="You" tone="blue" gained={intermission && myCorrect} />
      <div className="score-mid">
        <div className="score-round">
          {Math.min(idx + (inQuestion ? 1 : 0), total)} / {total}
        </div>
        <div className={`timer-ring ${inQuestion && secs <= 5 ? 'urgent' : ''}`}>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r={R} className="timer-track" />
            <circle
              cx="32"
              cy="32"
              r={R}
              className="timer-fill"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - frac)}
            />
          </svg>
          <span className="timer-num mono">{inQuestion ? secs : 'VS'}</span>
        </div>
      </div>
      <PlayerCard name={opp.name} score={opp.score} label="Opponent" tone="pink" gained={intermission && oppCorrect} />
    </div>
  )
}

function PlayerCard({ ref, name, score, label, tone, gained }) {
  return (
    <div ref={ref} className={`player-card tone-${tone}`}>
      <span className="avatar big">{(name || '?').slice(0, 1).toUpperCase()}</span>
      <div className="player-info">
        <div className="player-label">{label}</div>
        <div className="player-name">{name}</div>
      </div>
      <div className="player-score">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            className="mono"
            initial={{ y: -18, scale: 1.6, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          >
            {score}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence>
          {gained && (
            <motion.span
              className="plus-one"
              initial={{ y: 6, opacity: 0, scale: 0.6 }}
              animate={{ y: -22, opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            >
              +1
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function QuestionCard({ duel, index, pick, reveal, isHost, locked, onPick, oppAnswered, oppName, nextIn, last }) {
  const q = QUESTION_MAP[duel.question_ids[index]]
  const layout = useMemo(() => (q ? layoutWithHidden(q, duel.hidden[index] || null) : []), [q, duel.hidden, index])

  // Keyboard answers: A–D or 1–4.
  useEffect(() => {
    function onKey(e) {
      if (locked || e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      let slot = ['a', 'b', 'c', 'd'].indexOf(k)
      if (slot < 0) slot = ['1', '2', '3', '4'].indexOf(k)
      if (slot >= 0 && layout[slot]) onPick(layout[slot].orig)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, layout, onPick])

  if (!q) return null
  const mine = reveal ? (isHost ? reveal.host_selected : reveal.guest_selected) : pick
  const theirs = reveal ? (isHost ? reveal.guest_selected : reveal.host_selected) : null

  return (
    <motion.div
      className="q-card duel-q"
      initial={{ opacity: 0, x: 40, rotate: 1 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      exit={{ opacity: 0, x: -40, rotate: -1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      <div className="q-card-top">
        <span className="q-cat">{q.category}</span>
        <span className={`opp-status ${reveal ? 'hide' : oppAnswered ? 'done' : ''}`}>
          {oppAnswered ? <><Icon name="check" /> {oppName} locked in</> : <>{oppName} is thinking<span className="bounce-dots small" aria-hidden="true"><i /><i /><i /></span></>}
        </span>
      </div>
      <div className="q-text">{q.question}</div>
      <div className="q-options">
        {layout.map(({ shown, orig, text }, i) => {
          let cls = 'q-option'
          if (reveal) {
            if (orig === reveal.correct) cls += ' correct'
            else if (orig === mine) cls += ' incorrect'
            else cls += ' dim'
          } else if (orig === mine) cls += ' selected'
          return (
            <motion.button
              key={orig}
              className={cls}
              onClick={() => onPick(orig)}
              disabled={locked}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
            >
              <span className="q-letter">{shown}</span>
              <span className="q-option-text">{text}</span>
              {reveal && (
                <span className="pick-tags">
                  {orig === mine && <span className="pick-tag tone-blue">You</span>}
                  {orig === theirs && <span className="pick-tag tone-pink">{oppName}</span>}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
      <div className="duel-q-foot">
        {reveal ? (
          <span>
            {mine === reveal.correct ? 'Nice! You got it.' : mine ? 'Not this time.' : 'Out of time.'}
            {nextIn ? ` ${last ? 'Results' : 'Next question'} in ${nextIn}…` : ''}
          </span>
        ) : pick ? (
          <span>Locked in. Waiting for the reveal…</span>
        ) : (
          <span>Tap an answer or press A–{layout[layout.length - 1]?.shown}</span>
        )}
      </div>
    </motion.div>
  )
}

function Results({ duel, profile, me, opp, reveals, isHost, onExit }) {
  const won = duel.winner_id === profile.id
  const draw = !duel.winner_id
  const tiebreak = !draw && me.score === opp.score
  const celebrated = useRef(false)

  useEffect(() => {
    if (won && !celebrated.current) {
      celebrated.current = true
      bigCelebration()
    }
  }, [won])

  const title = draw ? 'It’s a draw!' : won ? 'You win!' : `${opp.name} wins`
  const sub = duel.forfeit
    ? won ? 'Your opponent left the match.' : 'You left the match.'
    : tiebreak
      ? `Tied on points, decided by total time (${(me.time / 1000).toFixed(1)}s vs ${(opp.time / 1000).toFixed(1)}s).`
      : draw ? 'Same score and same total time.' : won ? 'Great battle.' : 'Rematch?'

  return (
    <div className="results">
      <motion.div
        className={`results-banner ${draw ? 'draw' : won ? 'won' : 'lost'}`}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      >
        <motion.div
          className="results-trophy"
          initial={{ rotate: -30, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 10 }}
        >
          <Icon name={won ? 'team' : draw ? 'duel' : 'review'} />
        </motion.div>
        <h2>{title}</h2>
        <p>{sub}</p>
        <div className="results-score">
          <div>
            <span className="avatar big tone-blue">{me.name.slice(0, 1).toUpperCase()}</span>
            <strong className="mono">{me.score}</strong>
            <small>You · {(me.time / 1000).toFixed(1)}s</small>
          </div>
          <span className="results-dash">–</span>
          <div>
            <span className="avatar big tone-pink">{(opp.name || '?').slice(0, 1).toUpperCase()}</span>
            <strong className="mono">{opp.score}</strong>
            <small>{opp.name} · {(opp.time / 1000).toFixed(1)}s</small>
          </div>
        </div>
        <button className="next-btn big" onClick={onExit}>Play again</button>
      </motion.div>

      <h3 className="section-title">Question by question</h3>
      <ol className="exam-review duel-review">
        {duel.question_ids.map((qid, i) => {
          const q = QUESTION_MAP[qid]
          const r = reveals[i]
          if (!q) return null
          const layout = layoutWithHidden(q, duel.hidden[i] || null)
          const shown = (orig) => layout.find((o) => o.orig === orig)?.shown ?? orig
          const mine = r ? (isHost ? r.host_selected : r.guest_selected) : null
          const theirs = r ? (isHost ? r.guest_selected : r.host_selected) : null
          const myOk = r && mine === r.correct
          return (
            <motion.li
              key={qid}
              className={myOk ? 'ok' : 'bad'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.6) }}
            >
              <div className="er-q">{q.question}</div>
              <div className="duel-review-picks">
                <span className={`pick-result ${myOk ? 'good' : 'bad'}`}>
                  You: {mine ? `${shown(mine)} — ${q.options[mine]}` : 'no answer'}
                </span>
                <span className={`pick-result ${r && theirs === r.correct ? 'good' : 'bad'}`}>
                  {opp.name}: {theirs ? `${shown(theirs)} — ${q.options[theirs]}` : 'no answer'}
                </span>
              </div>
              {!myOk && (
                <>
                  <div className="er-correct">Correct: <strong>{shown(q.answer)}</strong> — {q.options[q.answer]}</div>
                  <Explanation id={q.id} letter={shown(q.answer)} answerText={q.options[q.answer]} />
                </>
              )}
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
