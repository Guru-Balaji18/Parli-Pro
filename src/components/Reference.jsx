import { useEffect, useState } from 'react'
import { MOTION_CLASSES, PRECEDENCE_FOOTNOTE, STUDY_TIERS } from '../data/motions'
import { slugify } from '../lib/lookup'

export default function Reference({ jumpTo }) {
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

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Table of Rules</div>
        <h2>Reference</h2>
        <p>
          The precedence chart is its own line item on the Round 1 test plan, and
          the tier list orders your drilling by how often each topic actually shows up.
        </p>
      </div>

      <div className="tabs">
        <button className={tab === 'chart' ? 'on' : ''} onClick={() => setTab('chart')}>
          Motions chart
        </button>
        <button className={tab === 'tiers' ? 'on' : ''} onClick={() => setTab('tiers')}>
          Study priority
        </button>
      </div>

      {tab === 'chart' ? (
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
      ) : (
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
