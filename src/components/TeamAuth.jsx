import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TeamAuth({ onAuth }) {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || !pin) return
    setBusy(true)
    setError('')
    const fn = tab === 'login' ? 'team_login' : 'team_sign_up'
    const { data, error: rpcError } = await supabase.rpc(fn, { name: name.trim(), pin })
    setBusy(false)

    if (rpcError) {
      const msg = rpcError.message || ''
      if (msg.includes('name_taken')) setError('That name is already taken. Try logging in instead, or pick another name.')
      else if (msg.includes('name_too_short')) setError('Name needs to be at least 2 characters.')
      else if (msg.includes('pin_too_short')) setError('PIN needs to be at least 4 characters.')
      else setError("Couldn't reach the server. Try again.")
      return
    }
    if (!data || data.length === 0) {
      setError(tab === 'login' ? 'No account with that name and PIN.' : 'Something went wrong.')
      return
    }
    onAuth(data[0])
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-kicker">Parliamentary Procedure · Team</div>
        <h1>Order in the Chamber</h1>
        <p>
          {tab === 'login'
            ? 'Log in to see your own record.'
            : 'Pick a name your teammates will recognize, and a PIN only you know.'}
        </p>
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button className={tab === 'login' ? 'on' : ''} onClick={() => { setTab('login'); setError('') }}>
            Log in
          </button>
          <button className={tab === 'signup' ? 'on' : ''} onClick={() => { setTab('signup'); setError('') }}>
            Sign up
          </button>
        </div>
        <form onSubmit={submit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
          />
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN (4+ characters)"
          />
          <button type="submit" disabled={busy}>
            {busy ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
        {error && <div className="login-error">{error}</div>}
        <p className="login-footnote">
          Team accounts share this app, not a login server — a teammate with
          your name and PIN could see your record. Don't reuse a real password here.
        </p>
      </div>
    </div>
  )
}
