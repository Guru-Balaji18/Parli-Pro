import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../data/categories'
import { currentWeekStart, formatCountdown, formatWeekRange, nextWeekStart } from '../lib/challengeWeek'

export default function Team({ profile }) {
  const [range, setRange] = useState('week') // 'week' | 'all'
  const [board, setBoard] = useState(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [now, setNow] = useState(() => new Date())

  // Keyed on the timestamp so the board refetches when the week rolls over, not on every clock tick.
  const weekStartMs = currentWeekStart(now).getTime()
  const weekStart = useMemo(() => new Date(weekStartMs), [weekStartMs])
  const weekEnd = useMemo(() => nextWeekStart(new Date(weekStartMs)), [weekStartMs])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    setBoard(null)
    const query = range === 'week'
      ? supabase.rpc('team_leaderboard_since', { since: weekStart.toISOString() })
      : supabase.from('team_leaderboard').select('*')
    query.then(({ data, error: err }) => {
      if (cancelled) return
      if (err) setError('Could not load the team leaderboard.')
      else setBoard(data)
    })
    return () => { cancelled = true }
  }, [range, weekStart])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    let q = supabase
      .from('attempts')
      .select('category_id, is_correct, time_seconds')
      .eq('user_id', selected.user_id)
    if (range === 'week') q = q.gte('answered_at', weekStart.toISOString())
    q.then(({ data, error: err }) => {
      if (cancelled) return
      if (err) { setDetail(null); return }
      const byCat = {}
      for (const a of data) {
        const c = (byCat[a.category_id] ||= { count: 0, correct: 0, time: 0 })
        c.count += 1
        c.correct += a.is_correct ? 1 : 0
        c.time += Number(a.time_seconds)
      }
      const rows = CATEGORIES.map((c) => {
        const s = byCat[c.id]
        if (!s) return null
        return { name: c.short, fullName: c.name, count: s.count, accuracy: Math.round((s.correct / s.count) * 100) }
      }).filter(Boolean).sort((a, b) => a.accuracy - b.accuracy)
      setDetail(rows)
    })
    return () => { cancelled = true }
  }, [selected, range, weekStart])

  const isCaptain = profile.role === 'captain'

  if (error) return <Shell><div className="empty-state">{error}</div></Shell>

  const active = board ? board.filter((b) => b.total > 0) : []
  const inactive = board ? board.filter((b) => b.total === 0) : []

  return (
    <Shell captain={isCaptain}>
      <div className="week-bar">
        <div className="tabs week-tabs">
          <button className={range === 'week' ? 'on' : ''} onClick={() => { setRange('week'); setSelected(null) }}>
            This Week
          </button>
          <button className={range === 'all' ? 'on' : ''} onClick={() => { setRange('all'); setSelected(null) }}>
            All-Time
          </button>
        </div>
        {range === 'week' && (
          <div className="week-meta">
            <span>{formatWeekRange(weekStart)}</span>
            <span className="week-countdown mono">resets in {formatCountdown(weekEnd, now)}</span>
          </div>
        )}
      </div>

      {!board ? (
        <div className="empty-state">Loading the team…</div>
      ) : (
        <>
          <div className="table-scroll">
          <table className="cat-table team-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Answered</th>
                <th>Accuracy</th>
                <th>Avg time</th>
                <th>Last active</th>
                {isCaptain && <th></th>}
              </tr>
            </thead>
            <tbody>
              {active.map((b) => (
                <tr key={b.user_id} className={b.user_id === profile.id ? 'is-me' : ''}>
                  <td className="team-name">{b.display_name}{b.user_id === profile.id ? ' (you)' : ''}</td>
                  <td className="mono">{b.total}</td>
                  <td className="mono">
                    <span className={b.accuracy >= 80 ? 'pill good' : b.accuracy >= 60 ? 'pill mid' : 'pill low'}>
                      {b.accuracy}%
                    </span>
                  </td>
                  <td className="mono">{Number(b.avg_time).toFixed(1)}s</td>
                  <td className="recent-when">{b.last_active ? new Date(b.last_active).toLocaleDateString() : '—'}</td>
                  {isCaptain && (
                    <td>
                      <button className="ghost-btn small" onClick={() => setSelected(b)}>
                        Breakdown
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {inactive.length > 0 && (
            <p className="footnote" style={{ marginTop: 12 }}>
              {range === 'week' ? "Hasn't practiced this week: " : 'Not started yet: '}
              {inactive.map((b) => b.display_name).join(', ')}
            </p>
          )}
        </>
      )}

      {isCaptain && selected && (
        <div className="drill-down">
          <div className="drill-head">
            <h3>{selected.display_name}'s weak categories {range === 'week' ? '(this week)' : '(all time)'}</h3>
            <button className="ghost-btn small" onClick={() => { setSelected(null); setDetail(null) }}>
              Close
            </button>
          </div>
          {!detail ? (
            <div className="empty-state">Loading…</div>
          ) : detail.length === 0 ? (
            <div className="empty-state">No practice recorded in this range.</div>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={Math.max(180, detail.length * 34)}>
                <BarChart data={detail} layout="vertical" margin={{ left: 12, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,26,23,0.1)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="rgba(27,26,23,0.5)" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={150} stroke="rgba(27,26,23,0.5)" fontSize={12} />
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontFamily: 'IBM Plex Sans', fontSize: 13 }} />
                  <Bar dataKey="accuracy" radius={[0, 3, 3, 0]}>
                    {detail.map((e, i) => (
                      <Cell key={i} fill={e.accuracy >= 80 ? '#2d5a38' : e.accuracy >= 60 ? '#8a6413' : '#8c2f2f'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </Shell>
  )
}

function Shell({ children, captain }) {
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">The chapter</div>
        <h2>Team</h2>
        <p>
          {captain
            ? "This week's leaderboard resets every Friday at 12:00 AM Eastern. Everyone sees name and accuracy; as captain, click a teammate for their category breakdown."
            : "This week's leaderboard resets every Friday at 12:00 AM Eastern. Everyone sees name and overall accuracy — your own category breakdown stays on your Dashboard."}
        </p>
      </div>
      {children}
    </div>
  )
}
