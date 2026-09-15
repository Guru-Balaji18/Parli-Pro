import { easternDayKey } from './challengeWeek.js'

export const REVIEW_CLEAR_DAYS = 2

// A missed question stays in review until it has been answered correctly on
// REVIEW_CLEAR_DAYS different Eastern calendar days since its most recent miss.
// Several right answers on one day count once, so a question answered right
// today waits until tomorrow. `attempts` must be newest first, as loaded.
export function reviewState(attempts, now = new Date()) {
  const today = easternDayKey(now)
  const seen = new Map()
  for (const a of attempts) {
    let s = seen.get(a.question_id)
    if (!s) seen.set(a.question_id, (s = { missed: false, days: new Set() }))
    if (s.missed) continue
    if (a.is_correct) s.days.add(easternDayKey(new Date(a.answered_at)))
    else s.missed = true
  }

  const due = new Set()
  const waiting = new Set()
  const progress = new Map()
  for (const [id, s] of seen) {
    if (!s.missed || s.days.size >= REVIEW_CLEAR_DAYS) continue
    progress.set(id, s.days.size)
    if (s.days.has(today)) waiting.add(id)
    else due.add(id)
  }
  return { due, waiting, progress }
}
