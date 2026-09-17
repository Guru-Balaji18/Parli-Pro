import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { CATEGORIES, CATEGORY_MAP } from '../data/categories'
import questions from '../data/questions.json'
import { currentStreak, dailyAccuracy, summarize } from '../lib/useRecord'
import { reviewState } from '../lib/review'
import CountUp from './CountUp'

const TOTAL_Q = questions.length
const TOOLTIP = { fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, border: '2px solid #e1e5f7', borderRadius: 12 }

export default function Dashboard({ record, goTo }) {
  const { attempts, flags, error } = record

  if (error) return <Shell><div className="empty-state">{error}</div></Shell>
  if (!attempts) return <Shell><div className="empty-state">Loading your record…</div></Shell>
  if (attempts.length === 0) {
    return (
      <Shell blurb="Nothing recorded yet.">
        <div className="empty-state">
          <p>Answer your first question and your accuracy, timing and weak
          categories start building here.</p>
          <button className="next-btn" onClick={() => goTo('practice')}>
            Start practicing →
          </button>
        </div>
      </Shell>
    )
  }

  const s = summarize(attempts)
  const streak = currentStreak(attempts)
  const review = reviewState(attempts)
  const trend = dailyAccuracy(attempts)

  const byCat = {}
  for (const a of attempts) {
    const c = (byCat[a.category_id] ||= { count: 0, correct: 0, time: 0 })
    c.count += 1
    c.correct += a.is_correct ? 1 : 0
    c.time += Number(a.time_seconds)
  }

  const catRows = CATEGORIES.map((c) => {
    const st = byCat[c.id]
    if (!st) return null
    return {
      id: c.id,
      name: c.short,
      fullName: c.name,
      count: st.count,
      accuracy: Math.round((st.correct / st.count) * 100),
      avgTime: st.time / st.count,
    }
  }).filter(Boolean)

  const chartData = catRows.slice().sort((a, b) => b.accuracy - a.accuracy)
  const weakest = catRows.slice().sort((a, b) => a.accuracy - b.accuracy)[0]

  const barColor = (v) => (v >= 80 ? '#22b573' : v >= 60 ? '#ffc83d' : '#ff5a5f')

  return (
    <Shell blurb="Your record, synced across every device.">
      <div className="stat-row">
        <Stat value={<CountUp to={s.accuracy} suffix="%" />} label="Overall accuracy" />
        <Stat value={<CountUp to={s.avgTime} decimals={1} suffix="s" />} label="Average time / question" />
        <Stat value={<CountUp to={s.total} />} label="Questions answered" />
        <Stat value={<><CountUp to={s.unique} /><span className="stat-of"> / {TOTAL_Q.toLocaleString()}</span></>} label="Bank covered" />
      </div>

      <div className="callout-row">
        <div className="callout">
          <div className="callout-num mono"><CountUp to={streak} /></div>
          <div>day{streak === 1 ? '' : 's'} in a row</div>
        </div>
        <button className="callout clickable" onClick={() => goTo('review')}>
          <div className="callout-num mono">{review.due.size}</div>
          <div>due for review →</div>
        </button>
        <button className="callout clickable" onClick={() => goTo('flagged')}>
          <div className="callout-num mono">{flags?.size ?? 0}</div>
          <div>flagged →</div>
        </button>
        {weakest && (
          <div className="callout wide">
            <div className="callout-label">Weakest category</div>
            <div className="callout-strong">{weakest.fullName}</div>
            <div className="callout-sub">{weakest.accuracy}% over {weakest.count} questions</div>
          </div>
        )}
      </div>

      {trend.length > 1 && (
        <>
          <h3 className="section-title">Accuracy over time</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e5f7" />
                <XAxis dataKey="day" stroke="#62678a" fontSize={12} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#62678a" fontSize={12} />
                <Tooltip
                  formatter={(v, n, p) => [`${v}% (${p.payload.count} questions)`, 'Accuracy']}
                  contentStyle={TOOLTIP}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 5, fill: '#ff4f8b', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }} animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <h3 className="section-title">Accuracy by category</h3>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 34)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e5f7" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#62678a" fontSize={12} />
            <YAxis type="category" dataKey="name" width={150} stroke="#62678a" fontSize={12} />
            <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP} />
            <Bar dataKey="accuracy" radius={[0, 10, 10, 0]} animationDuration={900}>
              {chartData.map((e, i) => <Cell key={i} fill={barColor(e.accuracy)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 className="section-title">By category, weakest first</h3>
      <div className="table-scroll">
        <table className="cat-table">
          <thead>
            <tr><th>Category</th><th>Answered</th><th>Accuracy</th><th>Avg time</th></tr>
          </thead>
          <tbody>
            {catRows.slice().sort((a, b) => a.accuracy - b.accuracy).map((r) => (
              <tr key={r.id}>
                <td>{r.fullName}</td>
                <td className="mono">{r.count}</td>
                <td className="mono">
                  <span className={r.accuracy >= 80 ? 'pill good' : r.accuracy >= 60 ? 'pill mid' : 'pill low'}>
                    {r.accuracy}%
                  </span>
                </td>
                <td className="mono">{r.avgTime.toFixed(1)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="section-title">Recent activity</h3>
      <ul className="recent-list">
        {attempts.slice(0, 10).map((a, i) => (
          <li key={i}>
            <span className={a.is_correct ? 'dot correct' : 'dot incorrect'} />
            <span className="recent-cat">{CATEGORY_MAP[a.category_id]?.short || a.category_id}</span>
            {a.mode && a.mode !== 'practice' && <span className="mode-tag">{a.mode}</span>}
            <span className="mono recent-time">{Number(a.time_seconds).toFixed(1)}s</span>
            <span className="recent-when">{new Date(a.answered_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </Shell>
  )
}

function Shell({ children, blurb }) {
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Reports of officers</div>
        <h2>Dashboard</h2>
        {blurb && <p>{blurb}</p>}
      </div>
      {children}
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-value mono">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
