import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onUnlock }) {
  const [passcode, setPasscode] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!passcode.trim()) return
    setChecking(true)
    setError('')
    const { data, error: rpcError } = await supabase.rpc('check_passcode', {
      input: passcode.trim(),
    })
    setChecking(false)
    if (rpcError) {
      setError("Couldn't reach the server. Try again.")
      return
    }
    if (data === true) {
      onUnlock()
    } else {
      setError('Incorrect passcode.')
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-kicker">Parliamentary Procedure</div>
        <h1>Order in the Chamber</h1>
        <p>Enter the passcode to open your study record.</p>
        <form onSubmit={submit}>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            autoFocus
          />
          <button type="submit" disabled={checking}>
            {checking ? 'Checking…' : 'Enter'}
          </button>
        </form>
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  )
}
