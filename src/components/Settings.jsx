import { useState } from 'react'
import { supabase } from '../lib/supabase'
import questions from '../data/questions.json'
import { summarize } from '../lib/useRecord'

export default function Settings({ record }) {
  const { attempts, reload } = record
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [msg, setMsg] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const [busy, setBusy] = useState(false)

  async function changePass(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { data, error } = await supabase.rpc('change_passcode', {
      old_pass: oldPass,
      new_pass: newPass,
    })
    setBusy(false)
    if (error) setMsg('Something went wrong. Try again.')
    else if (data === true) {
      setMsg('Passcode updated.')
      setOldPass('')
      setNewPass('')
    } else {
      setMsg('Current passcode is wrong, or the new one is under 4 characters.')
    }
  }

  async function resetHistory() {
    setBusy(true)
    await supabase.from('attempts').delete().neq('question_id', '')
    setBusy(false)
    setConfirmReset(false)
    reload()
  }

  function exportCsv() {
    if (!attempts?.length) return
    const rows = [
      ['question_id', 'category_id', 'is_correct', 'time_seconds', 'mode', 'answered_at'],
      ...attempts.map((a) => [
        a.question_id, a.category_id, a.is_correct, a.time_seconds, a.mode || 'practice', a.answered_at,
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'parlipro-history.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const s = attempts?.length ? summarize(attempts) : null

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Housekeeping</div>
        <h2>Settings</h2>
      </div>

      <section className="settings-block">
        <h3>The bank</h3>
        <p>
          {questions.length.toLocaleString()} unique questions, deduplicated from both
          Dunbar test-bank files in the project. {s ? `You've answered ${s.total.toLocaleString()} times across ${s.unique.toLocaleString()} of them.` : ''}
        </p>
        <h4 className="sub-head">How this lines up with the real HOSA test</h4>
        <ul className="calib-list">
          <li>
            HOSA doesn't release past tests. The only official questions published
            are three samples in the event guidelines — this bank agrees with all three.
          </li>
          <li>
            Every question is tagged to one of the 12 topics on HOSA's published
            Round 1 test plan, which is 100% NAP-authored.
          </li>
          <li>
            <strong>Answer-choice count:</strong> HOSA's sample questions offer three answer
            choices; this bank is four. Harder to guess here than on the real test.
          </li>
          <li>
            <strong>Watch the terminology:</strong> RONR's 12th edition renamed
            "Point of Information" to "Request for Information." 25 questions here
            still use the old name. Both are in the Vocabulary section.
          </li>
          <li>
            <strong>Known gap:</strong> nothing here covers electronic or
            videoconference meetings, which the 12th edition added. Worth reading
            separately.
          </li>
        </ul>
      </section>

      <section className="settings-block">
        <h3>Change passcode</h3>
        <form className="settings-form" onSubmit={changePass}>
          <input
            type="password" value={oldPass} placeholder="Current passcode"
            onChange={(e) => setOldPass(e.target.value)}
          />
          <input
            type="password" value={newPass} placeholder="New passcode (4+ characters)"
            onChange={(e) => setNewPass(e.target.value)}
          />
          <button type="submit" className="next-btn" disabled={busy}>Update</button>
        </form>
        {msg && <div className="settings-msg">{msg}</div>}
      </section>

      <section className="settings-block">
        <h3>Your data</h3>
        <div className="settings-actions">
          <button className="ghost-btn" onClick={exportCsv} disabled={!attempts?.length}>
            Export history as CSV
          </button>
          {!confirmReset ? (
            <button className="danger-btn" onClick={() => setConfirmReset(true)} disabled={!attempts?.length}>
              Clear all history
            </button>
          ) : (
            <span className="confirm-row">
              Delete every recorded answer? This can't be undone.
              <button className="danger-btn" onClick={resetHistory} disabled={busy}>Yes, clear it</button>
              <button className="ghost-btn" onClick={() => setConfirmReset(false)}>Cancel</button>
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
