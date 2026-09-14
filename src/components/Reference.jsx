import { useState } from 'react'
import { MOTION_CLASSES, PRECEDENCE_FOOTNOTE, STUDY_TIERS } from '../data/motions'

export default function Reference() {
  const [tab, setTab] = useState('chart')
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
                    <tr key={m.name}>
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
