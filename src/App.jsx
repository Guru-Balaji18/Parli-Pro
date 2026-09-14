import { useState } from 'react'
import './App.css'
import TeamAuth from './components/TeamAuth'
import Dashboard from './components/Dashboard'
import Practice from './components/Practice'
import Vocab from './components/Vocab'
import Reference from './components/Reference'
import Team from './components/Team'
import Settings from './components/Settings'
import { useRecord } from './lib/useRecord'

const PROFILE_KEY = 'ppa_profile'

const NAV = [
  { id: 'dashboard', num: 'I.', label: 'Dashboard' },
  { id: 'practice', num: 'II.', label: 'Practice' },
  { id: 'exam', num: 'III.', label: 'Mock Test' },
  { id: 'review', num: 'IV.', label: 'Missed' },
  { id: 'flagged', num: 'V.', label: 'Flagged' },
  { id: 'team', num: 'VI.', label: 'Team' },
  { id: 'vocab', num: 'VII.', label: 'Vocabulary' },
  { id: 'reference', num: 'VIII.', label: 'Reference' },
  { id: 'settings', num: 'IX.', label: 'Settings' },
]

function App() {
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [view, setView] = useState('dashboard')
  const record = useRecord(profile)

  function handleAuth(p) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
    setProfile(p)
  }

  function handleLogout() {
    localStorage.removeItem(PROFILE_KEY)
    setProfile(null)
  }

  if (!profile) {
    return <TeamAuth onAuth={handleAuth} />
  }

  const drillModes = ['practice', 'exam', 'review', 'flagged']

  return (
    <div className="shell">
      <nav className="rail">
        <div className="rail-brand">
          <div className="kicker">HOSA · Parliamentary Procedure</div>
          <h1>Order of Business</h1>
          <div className="rail-user">
            {profile.display_name}{profile.role === 'captain' ? ' · captain' : ''}
          </div>
        </div>
        <ul className="agenda">
          {NAV.map((n) => (
            <li key={n.id}>
              <button
                className={`agenda-item ${view === n.id ? 'active' : ''}`}
                onClick={() => setView(n.id)}
              >
                <span className="num">{n.num}</span> {n.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="rail-foot">
          <button onClick={handleLogout}>Log out</button>
        </div>
      </nav>
      <main className="stage">
        {view === 'dashboard' && <Dashboard record={record} goTo={setView} />}
        {drillModes.includes(view) && (
          <Practice key={view} mode={view} record={record} profile={profile} />
        )}
        {view === 'team' && <Team profile={profile} />}
        {view === 'vocab' && <Vocab />}
        {view === 'reference' && <Reference />}
        {view === 'settings' && <Settings profile={profile} record={record} onLogout={handleLogout} />}
      </main>
    </div>
  )
}

export default App
