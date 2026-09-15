// The challenge week runs Friday 00:00 to the next Friday 00:00 US Eastern
// time, whatever time zone the viewer's device is in, so every teammate sees
// the same week. Boundaries are resolved as Eastern wall-clock midnight rather
// than by adding 24h steps, because weeks spanning a DST change are 167h/169h.
const TZ = 'America/New_York'
const RESET_WEEKDAY = 5 // Friday

const partsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
})

const labelFormat = new Intl.DateTimeFormat(undefined, { timeZone: TZ, month: 'short', day: 'numeric' })

function easternParts(date) {
  const p = {}
  for (const { type, value } of partsFormat.formatToParts(date)) p[type] = Number(value)
  return p
}

// Eastern wall-clock time minus UTC, in ms, at the given instant.
function easternOffsetMs(date) {
  const p = easternParts(date)
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return wall - (date.getTime() - date.getMilliseconds())
}

// The instant Eastern clocks read 00:00 on a calendar date (month 1-based;
// out-of-range days roll over the way Date.UTC does). The second pass settles
// the offset if the first guess landed on the other side of a DST change.
function easternMidnight(year, month, day) {
  const wall = Date.UTC(year, month - 1, day)
  let t = wall - easternOffsetMs(new Date(wall))
  t = wall - easternOffsetMs(new Date(t))
  return new Date(t)
}

// YYYY-MM-DD of the Eastern calendar day containing the instant.
export function easternDayKey(date) {
  const { year, month, day } = easternParts(date)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function currentWeekStart(now = new Date()) {
  const { year, month, day } = easternParts(now)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  const daysBack = (weekday - RESET_WEEKDAY + 7) % 7
  return easternMidnight(year, month, day - daysBack)
}

export function nextWeekStart(now = new Date()) {
  const { year, month, day } = easternParts(currentWeekStart(now))
  return easternMidnight(year, month, day + 7)
}

export function formatWeekRange(start) {
  const { year, month, day } = easternParts(start)
  return `${labelFormat.format(start)} – ${labelFormat.format(easternMidnight(year, month, day + 6))}`
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
