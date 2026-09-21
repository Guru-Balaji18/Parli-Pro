import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Icon from './Icons'

// The tutor panel. It posts to /api/ask, which holds the AI key server-side and
// checks the daily message allowance. `context` is the study material the
// question is about — the current quiz question, the vocabulary list, the
// motions chart — and the server passes it to the model as reference.
const MAX_LEN = 1200
const HISTORY_TURNS = 8

export default function AskAI({
  profile,
  context,
  suggestions = [],
  placeholder = 'Ask a question…',
  intro,
  collapsible = false,
  openLabel = 'Ask the AI tutor',
  // Optional: let the page own the input box, so a button elsewhere on the
  // page (a vocabulary term, say) can drop a question into it.
  draft: draftProp,
  onDraft,
}) {
  const [open, setOpen] = useState(!collapsible)
  const [messages, setMessages] = useState([])
  const [ownDraft, setOwnDraft] = useState('')
  const draft = draftProp === undefined ? ownDraft : draftProp
  const setDraft = onDraft || setOwnDraft
  const [busy, setBusy] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const threadRef = useRef(null)
  const inputRef = useRef(null)
  const nextId = useRef(1)

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  async function send(text) {
    const question = text.trim().slice(0, MAX_LEN)
    if (!question || busy) return
    const history = messages
      .filter((m) => m.role !== 'error')
      .slice(-HISTORY_TURNS)
      .map((m) => ({ role: m.role === 'bot' ? 'bot' : 'user', text: m.text }))

    setMessages((m) => [...m, { id: nextId.current++, role: 'you', text: question }])
    setDraft('')
    setBusy(true)
    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile?.id, question, context, history }),
      })
      const data = await r.json().catch(() => null)
      if (!r.ok || !data?.reply) {
        setMessages((m) => [
          ...m,
          { id: nextId.current++, role: 'error', text: data?.error || 'Something went wrong reaching the tutor.' },
        ])
      } else {
        setMessages((m) => [...m, { id: nextId.current++, role: 'bot', text: data.reply }])
        if (typeof data.remaining === 'number') setRemaining(data.remaining)
      }
    } catch {
      setMessages((m) => [
        ...m,
        { id: nextId.current++, role: 'error', text: 'No connection to the tutor. Check your internet and try again.' },
      ])
    } finally {
      setBusy(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  if (collapsible && !open) {
    return (
      <button className="ask-open" onClick={() => setOpen(true)}>
        <span className="ask-open-icon"><Icon name="sparkle" /></span>
        {openLabel}
      </button>
    )
  }

  return (
    <motion.section
      className="ask"
      initial={collapsible ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <header className="ask-head">
        <span className="ask-avatar"><Icon name="sparkle" /></span>
        <div className="ask-head-text">
          <h3>AI tutor</h3>
          <p>Ask follow-up questions. It can be wrong — check anything surprising against the book.</p>
        </div>
        {collapsible && (
          <button className="ask-close" onClick={() => setOpen(false)} title="Close the tutor">
            <Icon name="x" />
          </button>
        )}
      </header>

      <div className="ask-thread" ref={threadRef} aria-live="polite">
        {messages.length === 0 && intro && <p className="ask-intro">{intro}</p>}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              className={`bubble ${m.role}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              {m.role === 'bot' ? <Rich text={m.text} /> : <p>{m.text}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && (
          <div className="bubble bot thinking" aria-label="The tutor is typing">
            <span /><span /><span />
          </div>
        )}
      </div>

      {messages.length === 0 && suggestions.length > 0 && (
        <div className="ask-suggestions">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} disabled={busy}>{s}</button>
          ))}
        </div>
      )}

      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault()
          send(draft)
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          maxLength={MAX_LEN}
          onChange={(e) => setDraft(e.target.value)}
          // Some browsers won't do implicit form submission here, so Enter is
          // handled directly as well.
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(draft)
            }
          }}
          placeholder={placeholder}
          disabled={busy}
        />
        <button type="submit" className="ask-send" disabled={busy || !draft.trim()} title="Send">
          <Icon name="send" />
        </button>
      </form>

      <div className="ask-foot">
        {remaining !== null && <span>{remaining} message{remaining === 1 ? '' : 's'} left today</span>}
      </div>
    </motion.section>
  )
}

// The model writes plain text with the occasional bullet list or **bold** run.
// This renders that much and nothing else — no HTML ever reaches the page.
function Rich({ text }) {
  const blocks = []
  let list = null
  for (const raw of text.split('\n')) {
    const line = raw.replace(/^#{1,6}\s+/, '').trimEnd()
    const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/)
    if (bullet) {
      if (!list) {
        list = []
        blocks.push({ type: 'list', items: list })
      }
      list.push(bullet[1])
    } else if (line.trim()) {
      list = null
      blocks.push({ type: 'p', text: line.trim() })
    } else {
      list = null
    }
  }
  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'list' ? (
          <ul key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{inline(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{inline(b.text)}</p>
        ),
      )}
    </>
  )
}

function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g).map((piece, i) => {
    if (!piece) return null
    if (piece.startsWith('**') && piece.endsWith('**')) return <strong key={i}>{piece.slice(2, -2)}</strong>
    if (piece.startsWith('`') && piece.endsWith('`')) return <code key={i}>{piece.slice(1, -1)}</code>
    if (piece.length > 2 && piece.startsWith('*') && piece.endsWith('*')) return <em key={i}>{piece.slice(1, -1)}</em>
    return <span key={i}>{piece}</span>
  })
}
