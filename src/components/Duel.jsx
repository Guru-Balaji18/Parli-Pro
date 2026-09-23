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
const MAX_PLAYERS = 8
// Each player gets a color, in join order.
const TONES = ['blue', 'pink', 'green', 'orange', 'violet', 'teal', 'red', 'yellow']

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

function standing(players) {
  return players
    .slice()
    .sort((a, b) => b.score - a.score || a.time_ms - b.time_ms || a.joined_at.localeCompare(b.joined_at))
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
        <h2>Battle</h2>
        <p>Race up to {MAX_PLAYERS} teammates through the same questions, live. Most right wins; if you tie, the faster total time takes it.</p>
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
              <p>You’ll get a code to share. Everyone joins, then you start it.</p>
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

          <div className="duel-rule"><Icon name="clock" /> 30 seconds per question · 2–{MAX_PLAYERS} players</div>

          <button className="next-btn big tone-pink" onClick={create} disabled={busy !== null || cats.length === 0}>
            {busy === 'create' ? 'Creating…' : 'Create match'}
          </button>
        </motion.section>

        <motion.section className="duel-panel join" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="duel-panel-head">
            <span className="duel-panel-icon tone-blue"><Icon name="duel" /></span>
            <div>
              <h3>Join a match</h3>
              <p>Type the 4-letter code the host shared.</p>
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
  const [players, setPlayers] = useState([])
  const [loadError, setLoadError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [picks, setPicks] = useState({})
  const [reveals, setReveals] = useState({})
  const [holdUntil, setHoldUntil] = useState(0)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const [starting, setStarting] = useState(false)
  const offset = useServerOffset()
  const lastAdvance = useRef(0)
  const duelRef = useRef(null)

  // Updates arrive from both realtime and polling; never go backwards. When a
  // match we were watching finishes, hold the last reveal on screen briefly.
  const applyDuel = useCallback((next) => {
    const cur = duelRef.current
    if (cur && next.current_index < cur.current_index) return
    if (cur?.status === 'active' && next.status === 'finished') setHoldUntil(Date.now() + 3200)
    duelRef.current = next
    setDuel(next)
  }, [])

  const load = useCallback(async () => {
    const [{ data, error }, { data: roster }] = await Promise.all([
      supabase.from('duels').select('*').eq('id', id).maybeSingle(),
      supabase.from('duel_players').select('*').eq('duel_id', id).order('joined_at'),
    ])
    if (error) return setLoadError('Couldn’t load the match.')
    if (!data) return setLoadError('That match no longer exists.')
    applyDuel(data)
    if (roster) setPlayers(roster)
  }, [id, applyDuel])

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`duel-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'duels', filter: `id=eq.${id}` }, (p) => applyDuel(p.new))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'duel_players', filter: `duel_id=eq.${id}` }, () => load())
      .subscribe()
    const poll = setInterval(load, 3000)
    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [id, load, applyDuel])

  const status = duel?.status
  const live = status === 'active' || (status === 'finished' && now < holdUntil)
  useEffect(() => {
    if (!live && status !== 'lobby') return
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [live, status])

  const idx = duel?.current_index ?? 0
  const total = duel?.question_ids.length ?? 0

  // Fetch each question's result once it closes.
  useEffect(() => {
    if (!duel || duel.status === 'lobby') return
    const closed = duel.status === 'finished' ? total : idx
    const missing = []
    for (let i = 0; i < closed; i++) if (!reveals[i]) missing.push(i)
    if (!missing.length) return
    let active = true
    Promise.all(missing.map((i) => supabase.rpc('duel_reveal', { p_duel: id, p_index: i }).then((r) => [i, r.data])))
      .then((rows) => {
        if (!active) return
        setReveals((prev) => {
          const next = { ...prev }
          for (const [i, row] of rows) if (row?.length) next[i] = row
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

  const seated = players.filter((p) => !p.left_at)
  const me = players.find((p) => p.user_id === profile.id)
  const isHost = duel?.host_id === profile.id
  const toneOf = (userId) => TONES[Math.max(0, players.findIndex((p) => p.user_id === userId)) % TONES.length]

  async function answer(letter) {
    if (!inQuestion || picks[idx] || remaining <= 0) return
    setPicks((p) => ({ ...p, [idx]: letter }))
    const { error } = await supabase.rpc('duel_answer', { p_user: profile.id, p_duel: id, p_index: idx, p_selected: letter })
    if (error && !error.message?.includes('question_closed')) console.error(error)
    load()
  }

  async function start() {
    setStarting(true)
    const { error } = await supabase.rpc('duel_start', { p_user: profile.id, p_duel: id })
    setStarting(false)
    if (error) return setLoadError(errorText(error))
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
        <button className="next-btn" onClick={onExit}>Back to Battle</button>
      </div>
    )
  }
  if (!duel) return <div className="empty-state">Loading match…</div>

  if (duel.status === 'abandoned') {
    return (
      <div className="empty-state">
        <p>This match was cancelled.</p>
        <button className="next-btn" onClick={onExit}>Back to Battle</button>
      </div>
    )
  }

  if (duel.status === 'lobby') {
    return (
      <Lobby
        duel={duel}
        players={seated}
        isHost={isHost}
        starting={starting}
        toneOf={toneOf}
        onStart={start}
        onLeave={quit}
      />
    )
  }

  if (duel.status === 'finished' && now >= holdUntil) {
    return (
      <Results
        duel={duel}
        profile={profile}
        players={players}
        reveals={reveals}
        toneOf={toneOf}
        onExit={onExit}
      />
    )
  }

  const showingIdx = inQuestion ? idx : idx - 1
  const intermission = !inQuestion
  const countdown = Math.max(1, Math.ceil((started - serverNow) / 1000))
  const reveal = intermission ? reveals[showingIdx] : null

  return (
    <div className="match">
      <Scoreboard
        players={seated}
        meId={profile.id}
        idx={idx}
        total={total}
        inQuestion={inQuestion}
        remaining={remaining}
        limitMs={limitMs}
        reveal={reveal}
        toneOf={toneOf}
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
            <div className="match-countdown-sub">{total} questions · 30 seconds each · {seated.length} players</div>
          </motion.div>
        ) : (
          <QuestionCard
            key={`q-${showingIdx}`}
            duel={duel}
            index={showingIdx}
            pick={picks[showingIdx]}
            reveal={reveal}
            meId={profile.id}
            locked={intermission || Boolean(picks[showingIdx]) || (me?.answered ?? -1) >= showingIdx}
            onPick={answer}
            waitingOn={seated.filter((p) => p.answered < showingIdx && p.user_id !== profile.id)}
            toneOf={toneOf}
            nextIn={intermission && status === 'active' ? countdown : null}
            last={showingIdx === total - 1}
          />
        )}
      </AnimatePresence>

      <div className="match-foot">
        {confirmQuit ? (
          <span className="confirm-row">
            Quit? The others keep playing without you.
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

function Lobby({ duel, players, isHost, starting, toneOf, onStart, onLeave }) {
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
        <p>
          {isHost
            ? `Everyone opens Battle, taps Join, and types it in. Start when your squad is in — up to ${MAX_PLAYERS} players.`
            : 'You’re in. The host starts the match when everyone has joined.'}
        </p>
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

        <div className="lobby-roster">
          <div className="field-label">In the lobby · {players.length}/{MAX_PLAYERS}</div>
          <ul>
            <AnimatePresence initial={false}>
              {players.map((p) => (
                <motion.li
                  key={p.user_id}
                  className={`roster-chip tone-${toneOf(p.user_id)}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                >
                  <span className="avatar">{p.display_name.slice(0, 1).toUpperCase()}</span>
                  {p.display_name}
                  {p.user_id === duel.host_id && <span className="host-tag">host</span>}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        {isHost ? (
          <button className="next-btn big tone-pink" onClick={onStart} disabled={players.length < 2 || starting}>
            {starting ? 'Starting…' : players.length < 2 ? 'Waiting for one more player…' : `Start match · ${players.length} players`}
          </button>
        ) : (
          <div className="lobby-wait">
            <span className="bounce-dots" aria-hidden="true"><i /><i /><i /></span>
            Waiting for the host to start
          </div>
        )}

        <div className="lobby-meta">
          {duel.question_ids.length} questions · 30s each{duel.three_choice ? ' · 3 choices' : ''}
        </div>
      </motion.div>
      <button className="ghost-btn small" onClick={onLeave}>{isHost ? 'Cancel match' : 'Leave lobby'}</button>
    </div>
  )
}

function Scoreboard({ players, meId, idx, total, inQuestion, remaining, limitMs, reveal, toneOf }) {
  const meRef = useRef(null)
  const popped = useRef(-1)
  const byId = useMemo(() => Object.fromEntries((reveal || []).map((r) => [r.user_id, r])), [reveal])

  useEffect(() => {
    if (reveal && byId[meId]?.is_correct && popped.current !== idx) {
      popped.current = idx
      popFrom(meRef.current)
    }
  }, [reveal, byId, meId, idx])

  const secs = Math.ceil(remaining / 1000)
  const frac = inQuestion ? remaining / limitMs : 1
  const R = 26
  const C = 2 * Math.PI * R

  return (
    <div className="scoreboard-wrap">
      <div className="score-mid">
        <div className="score-round">Question {Math.min(idx + (inQuestion ? 1 : 0), total)} of {total}</div>
        <div className={`timer-ring ${inQuestion && secs <= 5 ? 'urgent' : ''}`}>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r={R} className="timer-track" />
            <circle cx="32" cy="32" r={R} className="timer-fill" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
          </svg>
          <span className="timer-num mono">{inQuestion ? secs : '·'}</span>
        </div>
      </div>
      <ul className="scoreboard">
        {standing(players).map((p, i) => {
          const r = byId[p.user_id]
          const isMe = p.user_id === meId
          return (
            <motion.li
              key={p.user_id}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className={`player-card tone-${toneOf(p.user_id)} ${isMe ? 'me' : ''}`}
              ref={isMe ? meRef : undefined}
            >
              <span className="player-rank mono">{i + 1}</span>
              <span className="avatar">{p.display_name.slice(0, 1).toUpperCase()}</span>
              <div className="player-info">
                <div className="player-name">{isMe ? 'You' : p.display_name}</div>
                <div className="player-state">
                  {reveal
                    ? r?.is_correct ? 'correct' : r?.selected ? 'wrong' : 'no answer'
                    : p.answered >= idx ? 'locked in' : 'thinking…'}
                </div>
              </div>
              <div className="player-score">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={p.score}
                    className="mono"
                    initial={{ y: -16, scale: 1.5, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 16, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  >
                    {p.score}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence>
                  {reveal && r?.is_correct && (
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
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

function QuestionCard({ duel, index, pick, reveal, meId, locked, onPick, waitingOn, toneOf, nextIn, last }) {
  const q = QUESTION_MAP[duel.question_ids[index]]
  const layout = useMemo(() => (q ? layoutWithHidden(q, duel.hidden[index] || null) : []), [q, duel.hidden, index])

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
  const correct = reveal?.[0]?.correct
  const mine = reveal ? reveal.find((r) => r.user_id === meId)?.selected : pick
  const pickedBy = (orig) => (reveal || []).filter((r) => r.selected === orig)

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
        {!reveal && (
          <span className={`opp-status ${waitingOn.length === 0 ? 'done' : ''}`}>
            {waitingOn.length === 0
              ? <><Icon name="check" /> everyone’s locked in</>
              : <>waiting on {waitingOn.map((p) => p.display_name).join(', ')}<span className="bounce-dots small" aria-hidden="true"><i /><i /><i /></span></>}
          </span>
        )}
      </div>
      <div className="q-text">{q.question}</div>
      <div className="q-options">
        {layout.map(({ shown, orig, text }, i) => {
          let cls = 'q-option'
          if (reveal) {
            if (orig === correct) cls += ' correct'
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
              {reveal && pickedBy(orig).length > 0 && (
                <span className="pick-tags">
                  {pickedBy(orig).map((r) => (
                    <span key={r.user_id} className={`pick-tag tone-${toneOf(r.user_id)}`}>
                      {r.user_id === meId ? 'You' : r.display_name}
                    </span>
                  ))}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
      <div className="duel-q-foot">
        {reveal ? (
          <span>
            {mine === correct ? 'Nice! You got it.' : mine ? 'Not this time.' : 'Out of time.'}
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

function Results({ duel, profile, players, reveals, toneOf, onExit }) {
  const table = standing(players.filter((p) => !p.left_at))
  const quitters = players.filter((p) => p.left_at)
  const won = duel.winner_id === profile.id
  const draw = !duel.winner_id
  const champion = table[0]
  const myPlace = table.findIndex((p) => p.user_id === profile.id) + 1
  const celebrated = useRef(false)

  useEffect(() => {
    if (won && !celebrated.current) {
      celebrated.current = true
      bigCelebration()
    }
  }, [won])

  const alone = table.length === 1 && quitters.length > 0
  const title = draw ? 'It’s a draw!' : won ? 'You win!' : `${champion?.display_name} wins`
  const sub = alone
    ? 'Everyone else left the match.'
    : draw
      ? 'Same score and same total time at the top.'
      : won
        ? `You finished first out of ${table.length}.`
        : myPlace ? `You came ${myPlace === 2 ? '2nd' : myPlace === 3 ? '3rd' : `${myPlace}th`} of ${table.length}.` : 'You left this match.'

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
        <ol className="standings">
          {table.map((p, i) => (
            <motion.li
              key={p.user_id}
              className={`standing-row ${p.user_id === profile.id ? 'me' : ''}`}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
            >
              <span className="standing-place mono">{i + 1}</span>
              <span className={`avatar tone-${toneOf(p.user_id)}`}>{p.display_name.slice(0, 1).toUpperCase()}</span>
              <span className="standing-name">{p.user_id === profile.id ? 'You' : p.display_name}</span>
              <span className="standing-score mono">{p.score}</span>
              <span className="standing-time">{(p.time_ms / 1000).toFixed(1)}s</span>
            </motion.li>
          ))}
          {quitters.map((p) => (
            <li key={p.user_id} className="standing-row out">
              <span className="standing-place">—</span>
              <span className="avatar">{p.display_name.slice(0, 1).toUpperCase()}</span>
              <span className="standing-name">{p.user_id === profile.id ? 'You' : p.display_name}</span>
              <span className="standing-score">left</span>
            </li>
          ))}
        </ol>
        <button className="next-btn big" onClick={onExit}>Play again</button>
      </motion.div>

      <h3 className="section-title">Question by question</h3>
      <ol className="exam-review duel-review">
        {duel.question_ids.map((qid, i) => {
          const q = QUESTION_MAP[qid]
          const rows = reveals[i] || []
          if (!q) return null
          const layout = layoutWithHidden(q, duel.hidden[i] || null)
          const shown = (orig) => layout.find((o) => o.orig === orig)?.shown ?? orig
          const myRow = rows.find((r) => r.user_id === profile.id)
          const myOk = myRow?.is_correct
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
                {rows.map((r) => (
                  <span key={r.user_id} className={`pick-result ${r.is_correct ? 'good' : 'bad'}`}>
                    {r.user_id === profile.id ? 'You' : r.display_name}: {r.selected ? shown(r.selected) : '—'}
                  </span>
                ))}
              </div>
              {/* Shown for every question, not only the missed ones — a
                  question you guessed right is still worth reading up on. */}
              <div className="er-correct">Correct: <strong>{shown(q.answer)}</strong> — {q.options[q.answer]}</div>
              <Explanation id={q.id} letter={shown(q.answer)} answerText={q.options[q.answer]} />
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
