import { useState } from 'react'
import { supabase } from '../lib/supabase'
import questions from '../data/questions.json'
import { summarize } from '../lib/useRecord'

export default function Settings({ profile, record, onLogout }) {
  const { attempts, reload } = record
  const [confirmReset, setConfirmReset] = useState(false)
  const [busy, setBusy] = useState(false)

  async function resetHistory() {
    setBusy(true)
    await supabase.from('attempts').delete().eq('user_id', profile.id)
    await supabase.from('flags').delete().eq('user_id', profile.id)
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
    link.download = `${profile.display_name}-parlipro-history.csv`
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
        <h3>Your account</h3>
        <p>
          Signed in as <strong>{profile.display_name}</strong>
          {profile.role === 'captain' && <span className="captain-badge">captain</span>}
          {' '}
          {s ? `${s.total.toLocaleString()} answers across ${s.unique.toLocaleString()} of ${questions.length.toLocaleString()} questions.` : 'No activity recorded yet.'}
        </p>
        <div className="settings-actions" style={{ marginTop: 14 }}>
          <button className="ghost-btn" onClick={onLogout}>Log out</button>
        </div>
      </section>

      <section className="settings-block">
        <h3>The bank</h3>
        <p>
          {questions.length.toLocaleString()} unique questions, deduplicated from both
          Dunbar test-bank files in the project.
        </p>
        <h4 className="sub-head">How this lines up with the real HOSA test</h4>
        <ul className="calib-list">
          <li>
            HOSA doesn't release past tests. The only official questions published
            are three samples in the event guidelines — this bank agrees with two
            of three; the third (how special committee members are chosen) has a
            genuine wording difference worth knowing about.
          </li>
          <li>
            Every question is tagged to one of the 12 topics on HOSA's published
            Round 1 test plan, which is 100% NAP-authored.
          </li>
          <li>
            <strong>Answer-choice count:</strong> HOSA's sample questions offer three answer
            choices; this bank is four. Turn on "3 choices" in Practice or the Mock Test to
            hide one wrong answer and match the real format. Questions with answers like
            "All of the above" keep all four, since hiding one would break them.
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
        <h3>Your data</h3>
        <div className="settings-actions">
          <button className="ghost-btn" onClick={exportCsv} disabled={!attempts?.length}>
            Export your history as CSV
          </button>
          {!confirmReset ? (
            <button className="danger-btn" onClick={() => setConfirmReset(true)} disabled={!attempts?.length}>
              Clear my history
            </button>
          ) : (
            <span className="confirm-row">
              Delete everything you've recorded? This can't be undone.
              <button className="danger-btn" onClick={resetHistory} disabled={busy}>Yes, clear it</button>
              <button className="ghost-btn" onClick={() => setConfirmReset(false)}>Cancel</button>
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
