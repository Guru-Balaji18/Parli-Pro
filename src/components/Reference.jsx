import { useEffect, useMemo, useState } from 'react'
import { MOTION_CLASSES, PRECEDENCE_FOOTNOTE, STUDY_TIERS } from '../data/motions'
import { GUIDE_PARTS, HOSA_SOURCE, MEETING_GUIDE } from '../data/meetingGuide'
import { capContext, guideContext, motionsContext } from '../lib/askContext'
import { slugify } from '../lib/lookup'
import AskAI from './AskAI'
import MotionMatch from './MotionMatch'

export default function Reference({ jumpTo, profile }) {
  const [tab, setTab] = useState('chart')

  useEffect(() => {
    if (!jumpTo) return
    setTab('chart')
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

  const askContextText = useMemo(
    () => capContext(`${motionsContext()}\n\n${guideContext()}`),
    [],
  )

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Table of Rules</div>
        <h2>Reference</h2>
        <p>
          The precedence chart is its own line item on the Round 1 test plan, the meeting
          walkthrough explains what all of it is actually for, the tier list orders your
          drilling by how often each topic shows up, and the match drill tests the chart
          from memory.
        </p>
      </div>

      <div className="tabs">
        <button className={tab === 'chart' ? 'on' : ''} onClick={() => setTab('chart')}>
          Motions chart
        </button>
        <button className={tab === 'guide' ? 'on' : ''} onClick={() => setTab('guide')}>
          How a meeting runs
        </button>
        <button className={tab === 'match' ? 'on' : ''} onClick={() => setTab('match')}>
          Match drill
        </button>
        <button className={tab === 'tiers' ? 'on' : ''} onClick={() => setTab('tiers')}>
          Study priority
        </button>
        <button className={tab === 'ask' ? 'on' : ''} onClick={() => setTab('ask')}>
          Ask AI
        </button>
      </div>

      {tab === 'chart' && (
        <>
          {MOTION_CLASSES.map((cls) => (
            <section key={cls.id} className="motion-class">
              <h3 className="section-title">{cls.label}</h3>
              <p className="class-note">{cls.note}</p>
              <div className="table-scroll">
                <table className="cat-table motion-table">
                  <thead>
                    <tr>
                      <th>Motion</th>
                      <th>Second</th>
                      <th>Debatable</th>
                      <th>Amendable</th>
                      <th>Vote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cls.motions.map((m) => (
                      <tr key={m.name} id={slugify(m.name)}>
                        <td>
                          {m.rank && <span className="rank mono">{m.rank}</span>}
                          {m.name}
                        </td>
                        <td className={m.second === 'No' ? 'dim' : ''}>{m.second}</td>
                        <td className={m.debatable === 'No' ? 'dim' : ''}>{m.debatable}</td>
                        <td className={m.amendable === 'No' ? 'dim' : ''}>{m.amendable}</td>
                        <td className={m.vote.includes('Two-thirds') ? 'emph' : ''}>{m.vote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          <p className="footnote">{PRECEDENCE_FOOTNOTE}</p>
        </>
      )}

      {tab === 'guide' && <MeetingGuide onAsk={() => setTab('ask')} />}

      {tab === 'match' && <MotionMatch />}

      {tab === 'ask' && (
        <AskAI
          profile={profile}
          context={askContextText}
          placeholder="Ask about a motion or a meeting…"
          intro="Ask about anything on this page — a row of the chart, a step of the meeting, or how the HOSA demonstration works."
          suggestions={[
            'What’s the difference between tabling and postponing?',
            'Walk me through making a main motion out loud',
            'Which motions need a two-thirds vote, and why those?',
          ]}
        />
      )}

      {tab === 'tiers' && (
        <div className="tier-list">
          {STUDY_TIERS.map((t) => (
            <section key={t.tier} className={`tier tier-${t.tier}`}>
              <div className="tier-head">
                <span className="tier-num mono">Tier {t.tier}</span>
                <h3>{t.label}</h3>
              </div>
              <p className="tier-blurb">{t.blurb}</p>
              <ul className="tier-topics">
                {t.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function MeetingGuide({ onAsk }) {
  const [part, setPart] = useState('meeting')
  const sections = MEETING_GUIDE.filter((s) => s.part === part)

  function jump(id) {
    const el = document.getElementById(`guide-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="guide">
      <div className="guide-switch">
        {GUIDE_PARTS.map((p) => (
          <button key={p.id} className={part === p.id ? 'on' : ''} onClick={() => setPart(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      <p className="guide-lead">
        {part === 'meeting'
          ? 'A meeting in plain English, from the gavel to adjournment — what each part is for, and what people actually say out loud. Written for this app; nothing here is copied out of the book.'
          : 'How the HOSA event itself is run, from the written test to the eleven minutes in front of the judges. Drawn from the official guidelines for this year — check your state’s, which can differ.'}
      </p>

      <nav className="guide-toc">
        {sections.map((s) => (
          <button key={s.id} onClick={() => jump(s.id)}>{s.title}</button>
        ))}
      </nav>

      {sections.map((s, i) => (
        <section key={s.id} id={`guide-${s.id}`} className="guide-section">
          <h3>
            <span className="guide-num mono">{String(i + 1).padStart(2, '0')}</span>
            {s.title}
          </h3>
          {s.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
        </section>
      ))}

      {part === 'hosa' && (
        <p className="footnote">
          Event details taken from the{' '}
          <a href={HOSA_SOURCE.url} target="_blank" rel="noreferrer">{HOSA_SOURCE.label}</a>. Rules
          change year to year and state conferences set their own — read the current guidelines
          before you rely on any number here.
        </p>
      )}

      <button className="guide-ask" onClick={onAsk}>
        Questions about any of this? Ask the AI tutor →
      </button>
    </div>
  )
}
