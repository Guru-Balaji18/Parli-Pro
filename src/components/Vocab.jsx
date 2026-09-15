import { useEffect, useMemo, useState } from 'react'
import { VOCAB_GROUPS, VOCAB_TERMS } from '../data/vocab'

function shuffle(a) {
  const x = a.slice()
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[x[i], x[j]] = [x[j], x[i]]
  }
  return x
}

export default function Vocab({ jumpTo }) {
  const [tab, setTab] = useState('browse')
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')

  useEffect(() => {
    if (!jumpTo) return
    setTab('browse')
    setQuery('')
    setGroup('all')
    const t = setTimeout(() => {
      const el = document.getElementById(jumpTo)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('flash-highlight')
        setTimeout(() => el.classList.remove('flash-highlight'), 2200)
      }
    }, 60)
    return () => clearTimeout(t)
  }, [jumpTo])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return VOCAB_TERMS.filter((t) => {
      if (group !== 'all' && t.groupId !== group) return false
      if (!q) return true
      return t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
    })
  }, [query, group])

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Terminology</div>
        <h2>Vocabulary</h2>
        <p>
          {VOCAB_TERMS.length} terms judges listen for. Section C of the Round 2
          rubric scores "proper use of parliamentary terms" directly — knowing
          the word is worth points on its own.
        </p>
      </div>

      <div className="tabs">
        <button className={tab === 'browse' ? 'on' : ''} onClick={() => setTab('browse')}>
          Browse
        </button>
        <button className={tab === 'cards' ? 'on' : ''} onClick={() => setTab('cards')}>
          Flashcards
        </button>
      </div>

      {tab === 'browse' ? (
        <>
          <div className="vocab-controls">
            <input
              className="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms and definitions"
            />
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="all">All groups</option>
              {VOCAB_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>
          {filtered.length === 0 && <div className="empty-state">No terms match that search.</div>}
          <dl className="vocab-list">
            {filtered.map((t) => (
              <div key={t.id} id={`vocab-${t.id}`} className="vocab-item">
                <dt>{t.term}</dt>
                <dd>{t.def}</dd>
                <div className="vocab-group">{t.groupLabel}</div>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <Flashcards pool={filtered.length ? filtered : VOCAB_TERMS} group={group} setGroup={setGroup} />
      )}
    </div>
  )
}

function Flashcards({ pool, group, setGroup }) {
  const [deck, setDeck] = useState(() => shuffle(pool))
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(new Set())

  function reshuffle(source) {
    setDeck(shuffle(source))
    setI(0)
    setFlipped(false)
    setKnown(new Set())
  }

  const card = deck[i]

  function advance(markKnown) {
    if (markKnown && card) setKnown((k) => new Set(k).add(card.id))
    if (i + 1 >= deck.length) reshuffle(pool)
    else {
      setI(i + 1)
      setFlipped(false)
    }
  }

  return (
    <>
      <div className="vocab-controls">
        <select
          value={group}
          onChange={(e) => {
            setGroup(e.target.value)
            reshuffle(pool)
          }}
        >
          <option value="all">All groups</option>
          {VOCAB_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
        <button className="ghost-btn" onClick={() => reshuffle(pool)}>Reshuffle</button>
        <span className="deck-pos mono">{i + 1} / {deck.length}</span>
        <span className="deck-known">{known.size} known</span>
      </div>

      {card && (
        <button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
          <div className="fc-face">
            {flipped ? (
              <p className="fc-def">{card.def}</p>
            ) : (
              <h3 className="fc-term">{card.term}</h3>
            )}
          </div>
          <div className="fc-hint">{flipped ? card.term : 'Click to reveal'}</div>
        </button>
      )}

      <div className="fc-actions">
        <button className="ghost-btn" onClick={() => advance(false)}>Study again</button>
        <button className="next-btn" onClick={() => advance(true)}>Got it →</button>
      </div>
    </>
  )
}
