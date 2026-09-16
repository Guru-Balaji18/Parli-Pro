import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORY_MAP } from '../data/categories'
import questions from '../data/questions.json'

const QUESTIONS = new Map(questions.map((q) => [q.id, q]))
const COLS = 11

function errorText(err) {
  const msg = err?.message || ''
  if (msg.includes('not_authorized')) return "That PIN didn't work, or this account isn't an admin. If you were just made admin, log out and back in first."
  if (msg.includes('cannot_remove_self')) return "You can't remove your own account."
  if (msg.includes('cannot_remove_admin')) return "Admin accounts can't be removed here."
  if (msg.includes('member_not_found')) return 'That member no longer exists.'
  return "Couldn't reach the server. Try again."
}

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—')
const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : '—')
const pillClass = (acc) => (acc >= 80 ? 'pill good' : acc >= 60 ? 'pill mid' : 'pill low')
const plural = (n, word) => `${n} ${word}${Number(n) === 1 ? '' : 's'}`

export default function Admin({ profile }) {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [members, setMembers] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [history, setHistory] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const call = (fn, args = {}) => supabase.rpc(fn, { p_name: profile.display_name, p_pin: pin, ...args })

  async function loadMembers() {
    const { data, error: err } = await call('admin_members')
    if (err) {
      setError(errorText(err))
      return false
    }
    setMembers(data)
    setError('')
    return true
  }

  async function unlock(e) {
    e.preventDefault()
    if (!pin) return
    setBusy(true)
    const ok = await loadMembers()
    setBusy(false)
    if (ok) setUnlocked(true)
  }

  function lock() {
    setPin('')
    setUnlocked(false)
    setMembers(null)
    setOpenId(null)
    setHistory(null)
    setConfirmId(null)
    setNotice('')
    setError('')
  }

  async function toggleHistory(id) {
    setConfirmId(null)
    if (openId === id) {
      setOpenId(null)
      setHistory(null)
      return
    }
    setOpenId(id)
    setHistory(null)
    const { data, error: err } = await call('admin_member_history', { p_member: id })
    if (err) {
      setError(errorText(err))
      setOpenId(null)
      return
    }
    setHistory(data)
  }

  async function remove(member) {
    setBusy(true)
    const { data, error: err } = await call('admin_remove_member', { p_member: member.id })
    setBusy(false)
    setConfirmId(null)
    if (err) {
      setError(errorText(err))
      return
    }
    if (openId === member.id) {
      setOpenId(null)
      setHistory(null)
    }
    setNotice(`Removed ${data.removed}. Deleted ${plural(data.attempts, 'answer')}, ${plural(data.exams, 'mock test')} and ${plural(data.flags, 'flag')}.`)
    await loadMembers()
  }

  const head = (
    <div className="page-head">
      <div className="eyebrow">Chair’s desk</div>
      <h2>Admin</h2>
      <p>
        Every member’s record, and the power to remove members. Each action re-checks your
        PIN with the database, so only an admin account can use this page.
      </p>
    </div>
  )

  if (!unlocked) {
    return (
      <div>
        {head}
        <form className="settings-block admin-unlock" onSubmit={unlock}>
          <h3>Enter your PIN</h3>
          <p>Your PIN stays in this tab only. It’s forgotten when you lock admin or leave this page.</p>
          <div className="settings-form">
            <input
              type="password"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Your PIN"
              autoFocus
            />
            <button type="submit" className="next-btn" disabled={busy || !pin}>
              {busy ? 'Checking…' : 'Open admin tools'}
            </button>
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
        </form>
      </div>
    )
  }

  const totalAnswers = members.reduce((s, m) => s + Number(m.total), 0)
  const totalCorrect = members.reduce((s, m) => s + Number(m.correct), 0)
  const totalExams = members.reduce((s, m) => s + Number(m.exams), 0)

  return (
    <div>
      {head}

      <div className="admin-bar">
        <span className="footnote">Signed in as admin: {profile.display_name}</span>
        <button className="ghost-btn small" onClick={lock}>Lock admin</button>
      </div>

      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="login-error" role="alert">{error}</p>}

      <div className="stat-row">
        <div className="stat-card"><div className="stat-value mono">{members.length}</div><div className="stat-label">Members</div></div>
        <div className="stat-card"><div className="stat-value mono">{totalAnswers.toLocaleString()}</div><div className="stat-label">Answers recorded</div></div>
        <div className="stat-card"><div className="stat-value mono">{totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0}%</div><div className="stat-label">Team accuracy</div></div>
        <div className="stat-card"><div className="stat-value mono">{totalExams}</div><div className="stat-label">Mock tests finished</div></div>
      </div>

      <h3 className="section-title">Members</h3>
      <div className="table-scroll">
        <table className="cat-table admin-table">
          <thead>
            <tr>
              <th>Name</th><th>Role</th><th>Joined</th><th>Answered</th><th>Accuracy</th><th>Avg time</th>
              <th>Weakest category</th><th>Mock tests</th><th>Flags</th><th>Last active</th><th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isSelf = m.id === profile.id
              const removable = !isSelf && m.role !== 'admin'
              return [
                <tr key={m.id} className={openId === m.id ? 'admin-open' : ''}>
                  <td className="team-name">{m.display_name}{isSelf ? ' (you)' : ''}</td>
                  <td>{m.role}</td>
                  <td className="recent-when">{fmtDate(m.joined)}</td>
                  <td className="mono">{m.total}</td>
                  <td className="mono">{m.accuracy === null ? '—' : <span className={pillClass(m.accuracy)}>{m.accuracy}%</span>}</td>
                  <td className="mono">{Number(m.total) ? `${Number(m.avg_time).toFixed(1)}s` : '—'}</td>
                  <td>
                    {m.weakest_category
                      ? `${CATEGORY_MAP[m.weakest_category]?.short || m.weakest_category} (${m.weakest_accuracy}%)`
                      : '—'}
                  </td>
                  <td className="mono">{Number(m.exams) ? `${m.exams} · best ${m.best_exam_pct}%` : '0'}</td>
                  <td className="mono">{m.flagged}</td>
                  <td className="recent-when">{fmtDate(m.last_active)}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="ghost-btn small" onClick={() => toggleHistory(m.id)} aria-expanded={openId === m.id}>
                        {openId === m.id ? 'Hide history' : 'History'}
                      </button>
                      {removable && (
                        <button className="danger-btn small" onClick={() => setConfirmId(confirmId === m.id ? null : m.id)}>
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>,
                confirmId === m.id && (
                  <tr key={`${m.id}-confirm`} className="admin-confirm">
                    <td colSpan={COLS}>
                      <div className="confirm-row">
                        <span>
                          Remove <strong>{m.display_name}</strong>? This permanently deletes their account
                          along with {plural(m.total, 'answer')}, {plural(m.exams, 'mock test')} and{' '}
                          {plural(m.flagged, 'flag')}. It can’t be undone.
                        </span>
                        <button className="danger-btn" onClick={() => remove(m)} disabled={busy}>
                          {busy ? 'Removing…' : 'Yes, remove'}
                        </button>
                        <button className="ghost-btn" onClick={() => setConfirmId(null)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ),
                openId === m.id && (
                  <tr key={`${m.id}-history`} className="admin-detail">
                    <td colSpan={COLS}>
                      <MemberHistory history={history} />
                    </td>
                  </tr>
                ),
              ]
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MemberHistory({ history }) {
  if (!history) return <div className="admin-history footnote">Loading history…</div>
  const { attempts, exams, flags } = history

  const byCat = {}
  for (const a of attempts) {
    const c = (byCat[a.category_id] ||= { count: 0, correct: 0 })
    c.count += 1
    c.correct += a.is_correct ? 1 : 0
  }
  const categories = Object.entries(byCat)
    .map(([id, c]) => ({ id, count: c.count, accuracy: Math.round((c.correct / c.count) * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy)

  return (
    <div className="admin-history">
      <div className="admin-history-cols">
        <section>
          <h4 className="sub-head">By category, weakest first</h4>
          {categories.length ? (
            <ul className="admin-mini">
              {categories.map((c) => (
                <li key={c.id}>
                  <span>{CATEGORY_MAP[c.id]?.name || c.id}</span>
                  <span className="mono">{c.accuracy}% of {c.count}</span>
                </li>
              ))}
            </ul>
          ) : <p className="footnote">No answers yet.</p>}
        </section>
        <section>
          <h4 className="sub-head">Mock tests</h4>
          {exams.length ? (
            <ul className="admin-mini">
              {exams.map((e, i) => (
                <li key={i}>
                  <span>{fmtDate(e.finished_at)}</span>
                  <span className="mono">
                    {e.correct_count}/{e.question_count} ({Math.round((e.correct_count / e.question_count) * 100)}%) in {Math.round(e.duration_seconds / 60)} min
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="footnote">None finished yet.</p>}
          <h4 className="sub-head">Flagged questions</h4>
          <p className="footnote">{flags.length ? flags.join(', ') : 'None.'}</p>
        </section>
      </div>

      <h4 className="sub-head">Every answer ({attempts.length})</h4>
      {attempts.length ? (
        <div className="table-scroll">
          <table className="cat-table admin-answers">
            <thead>
              <tr><th>When</th><th>Question</th><th>Chose</th><th>Correct</th><th>Result</th><th>Time</th><th>Mode</th></tr>
            </thead>
            <tbody>
              {attempts.map((a, i) => {
                const q = QUESTIONS.get(a.question_id)
                return (
                  <tr key={i}>
                    <td className="recent-when">{fmtDateTime(a.answered_at)}</td>
                    <td className="admin-q">{q ? q.question : a.question_id}</td>
                    <td className="mono">{a.selected_answer}</td>
                    <td className="mono">{q?.answer ?? '—'}</td>
                    <td><span className={a.is_correct ? 'pill good' : 'pill low'}>{a.is_correct ? 'Right' : 'Wrong'}</span></td>
                    <td className="mono">{Number(a.time_seconds).toFixed(1)}s</td>
                    <td>{a.mode || 'practice'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : <p className="footnote">No answers yet.</p>}
    </div>
  )
}
