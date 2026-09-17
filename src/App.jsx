import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import './App.css'
import TeamAuth from './components/TeamAuth'
import Dashboard from './components/Dashboard'
import Practice from './components/Practice'
import Duel from './components/Duel'
import Vocab from './components/Vocab'
import Reference from './components/Reference'
import Team from './components/Team'
import Settings from './components/Settings'
import Admin from './components/Admin'
import { useRecord } from './lib/useRecord'
import BrandMark from './components/BrandMark'
import Icon from './components/Icons'

const PROFILE_KEY = 'ppa_profile'

// Each section has its own color, used for its nav tile and page banner.
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', color: 'blue' },
  { id: 'practice', label: 'Practice', icon: 'practice', color: 'violet' },
  { id: 'duel', label: 'Battle', icon: 'duel', color: 'pink' },
  { id: 'exam', label: 'Mock Test', icon: 'exam', color: 'orange' },
  { id: 'review', label: 'Missed', icon: 'review', color: 'red' },
  { id: 'team', label: 'Team', icon: 'team', color: 'teal' },
  { id: 'vocab', label: 'Vocabulary', icon: 'vocab', color: 'green' },
  { id: 'reference', label: 'Reference', icon: 'reference', color: 'blue' },
  { id: 'settings', label: 'Settings', icon: 'settings', color: 'violet' },
]
const ADMIN_NAV = { id: 'admin', label: 'Admin', icon: 'admin', color: 'red' }

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
    setView('dashboard')
  }

  function handleLookup(type, anchor) {
    setView(type === 'reference' ? 'reference' : 'vocab')
    setJumpAnchor(anchor)
  }

  if (!profile) {
    return (
      <MotionConfig reducedMotion="user">
        <TeamAuth onAuth={handleAuth} />
      </MotionConfig>
    )
  }

  const isAdmin = profile.role === 'admin'
  const nav = isAdmin ? [...NAV, ADMIN_NAV] : NAV
  const drillModes = ['practice', 'exam', 'review']
  const color = nav.find((n) => n.id === view)?.color || 'blue'

  return (
    <MotionConfig reducedMotion="user">
      <div className="shell">
        <nav className="rail">
          <div className="rail-brand">
            <BrandMark className="brand-mark" />
            <div>
              <h1>Parli Pro</h1>
              <div className="kicker">HOSA study squad</div>
            </div>
          </div>
          <ul className="agenda">
            {nav.map((n) => (
              <li key={n.id}>
                <button
                  className={`agenda-item tone-${n.color} ${view === n.id ? 'active' : ''}`}
                  onClick={() => setView(n.id)}
                  aria-current={view === n.id ? 'page' : undefined}
                >
                  {view === n.id && (
                    <motion.span
                      className="agenda-active"
                      layoutId="agenda-active"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="agenda-icon"><Icon name={n.icon} /></span>
                  <span className="agenda-label">{n.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="rail-foot">
            <div className="rail-user">
              <span className="avatar">{profile.display_name.slice(0, 1).toUpperCase()}</span>
              <span className="rail-user-name">{profile.display_name}</span>
              {profile.role !== 'member' && <span className="captain-badge">{profile.role}</span>}
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Log out">
              <Icon name="logout" />
              <span>Log out</span>
            </button>
          </div>
        </nav>
        <main className={`stage tone-${color}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              className="page-panel"
              initial={{ opacity: 0, y: 18, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {view === 'dashboard' && <Dashboard record={record} goTo={setView} />}
              {drillModes.includes(view) && (
                <Practice mode={view} record={record} profile={profile} onLookup={handleLookup} />
              )}
              {view === 'duel' && <Duel profile={profile} record={record} />}
              {view === 'team' && <Team profile={profile} />}
              {view === 'vocab' && <Vocab jumpTo={jumpAnchor} />}
              {view === 'reference' && <Reference jumpTo={jumpAnchor} />}
              {view === 'settings' && <Settings profile={profile} record={record} onLogout={handleLogout} />}
              {view === 'admin' && isAdmin && <Admin profile={profile} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}

export default App
