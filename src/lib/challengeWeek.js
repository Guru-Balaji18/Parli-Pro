// The challenge week runs Friday 00:00 to the next Friday 00:00, in the
// browser's local time zone.
export function currentWeekStart(now = new Date()) {
  const day = now.getDay() // 0 = Sun ... 5 = Fri ... 6 = Sat
  const diff = (day - 5 + 7) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - diff)
  start.setHours(0, 0, 0, 0)
  return start
}

export function nextWeekStart(now = new Date()) {
  const start = currentWeekStart(now)
  const next = new Date(start)
  next.setDate(start.getDate() + 7)
  return next
}

export function formatWeekRange(start) {
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const opts = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
}

export function formatCountdown(until, now = new Date()) {
  const ms = until - now
  if (ms <= 0) return 'resetting…'
  const hours = Math.floor(ms / 3600000)
  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  if (days > 0) return `${days}d ${remHours}h`
  const mins = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${mins}m`
}
