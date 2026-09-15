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
import BrandMark from './components/BrandMark'

const PROFILE_KEY = 'ppa_profile'

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'practice', label: 'Practice' },
  { id: 'exam', label: 'Mock Test' },
  { id: 'review', label: 'Missed' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'team', label: 'Team' },
  { id: 'vocab', label: 'Vocabulary' },
  { id: 'reference', label: 'Reference' },
  { id: 'settings', label: 'Settings' },
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
  const [jumpAnchor, setJumpAnchor] = useState(null)
  const record = useRecord(profile)

  function handleAuth(p) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
    setProfile(p)
  }

  function handleLogout() {
    localStorage.removeItem(PROFILE_KEY)
    setProfile(null)
  }

  function handleLookup(type, anchor) {
    setView(type === 'reference' ? 'reference' : 'vocab')
    setJumpAnchor(anchor)
  }

  if (!profile) {
    return <TeamAuth onAuth={handleAuth} />
  }

  const drillModes = ['practice', 'exam', 'review', 'flagged']

  return (
    <div className="shell">
      <nav className="rail">
        <div className="rail-brand">
          <BrandMark className="brand-mark" />
          <div className="kicker">HOSA Parliamentary Procedure</div>
          <h1>Order of Business</h1>
          <div className="rail-user">
            {profile.display_name}
            {profile.role === 'captain' && <span className="captain-badge">captain</span>}
          </div>
        </div>
        <ul className="agenda">
          {NAV.map((n) => (
            <li key={n.id}>
              <button
                className={`agenda-item ${view === n.id ? 'active' : ''}`}
                onClick={() => setView(n.id)}
              >
                {n.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="rail-foot">
          <button onClick={handleLogout}>Log out</button>
        </div>
      </nav>
      <main className="stage">
        <div className="page-panel">
          {view === 'dashboard' && <Dashboard record={record} goTo={setView} />}
          {drillModes.includes(view) && (
            <Practice key={view} mode={view} record={record} profile={profile} onLookup={handleLookup} />
          )}
          {view === 'team' && <Team profile={profile} />}
          {view === 'vocab' && <Vocab jumpTo={view === 'vocab' ? jumpAnchor : null} />}
          {view === 'reference' && <Reference jumpTo={view === 'reference' ? jumpAnchor : null} />}
          {view === 'settings' && <Settings profile={profile} record={record} onLogout={handleLogout} />}
        </div>
      </main>
    </div>
  )
}

export default App
