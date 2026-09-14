import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Practice from './components/Practice'
import Vocab from './components/Vocab'
import Reference from './components/Reference'
import Settings from './components/Settings'
import { useRecord } from './lib/useRecord'

const UNLOCK_KEY = 'ppa_unlocked'

const NAV = [
  { id: 'dashboard', num: 'I.', label: 'Dashboard' },
  { id: 'practice', num: 'II.', label: 'Practice' },
  { id: 'exam', num: 'III.', label: 'Mock Test' },
  { id: 'review', num: 'IV.', label: 'Missed' },
  { id: 'flagged', num: 'V.', label: 'Flagged' },
  { id: 'vocab', num: 'VI.', label: 'Vocabulary' },
  { id: 'reference', num: 'VII.', label: 'Reference' },
  { id: 'settings', num: 'VIII.', label: 'Settings' },
]

function App() {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(UNLOCK_KEY) === 'true'
  )
  const [view, setView] = useState('dashboard')
  const record = useRecord()

  if (!unlocked) {
    return (
      <Login
        onUnlock={() => {
          localStorage.setItem(UNLOCK_KEY, 'true')
          setUnlocked(true)
        }}
      />
    )
  }

  const drillModes = ['practice', 'exam', 'review', 'flagged']

  return (
    <div className="shell">
      <nav className="rail">
        <div className="rail-brand">
          <div className="kicker">HOSA · Parliamentary Procedure</div>
          <h1>Order of Business</h1>
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
          <button
            onClick={() => {
              localStorage.removeItem(UNLOCK_KEY)
              setUnlocked(false)
            }}
          >
            Lock
          </button>
        </div>
      </nav>
      <main className="stage">
        {view === 'dashboard' && <Dashboard record={record} goTo={setView} />}
        {drillModes.includes(view) && (
          <Practice key={view} mode={view} record={record} />
        )}
        {view === 'vocab' && <Vocab />}
        {view === 'reference' && <Reference />}
        {view === 'settings' && <Settings record={record} />}
      </main>
    </div>
  )
}

export default App
