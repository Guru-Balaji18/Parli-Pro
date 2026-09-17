import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import questions from '../data/questions.json'
import { hideableLetters, shuffle } from './quiz'

export const DUEL_KEY = 'ppa_active_duel'
export const QUESTION_MAP = Object.fromEntries(questions.map((q) => [q.id, q]))

// Picks the match's questions and, in three-choice mode, which wrong answer
// each player won't see (the same one for both).
export function buildDuel(categoryIds, count, threeChoice) {
  const pool = questions.filter((q) => categoryIds.includes(q.category_id))
  const picked = shuffle(pool).slice(0, count)
  return {
    p_question_ids: picked.map((q) => q.id),
    p_answers: picked.map((q) => q.answer),
    p_category_ids: picked.map((q) => q.category_id),
    p_hidden: picked.map((q) => {
      const wrong = threeChoice ? hideableLetters(q) : []
      return wrong.length ? wrong[Math.floor(Math.random() * wrong.length)] : ''
    }),
    p_three_choice: threeChoice,
    available: pool.length,
  }
}

// Milliseconds to add to Date.now() to get the database's clock. Question
// timing is decided by the server, so the countdown follows its clock.
let offsetPromise = null
export function useServerOffset() {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    if (!offsetPromise) {
      offsetPromise = (async () => {
        let best = null
        for (let i = 0; i < 3; i++) {
          const t0 = Date.now()
          const { data, error } = await supabase.rpc('server_now')
          const t1 = Date.now()
          if (error || !data) continue
          const sample = { rtt: t1 - t0, offset: new Date(data).getTime() - (t0 + t1) / 2 }
          if (!best || sample.rtt < best.rtt) best = sample
        }
        return best ? best.offset : 0
      })()
    }
    let live = true
    offsetPromise.then((o) => { if (live) setOffset(o) })
    return () => { live = false }
  }, [])
  return offset
}

export function errorText(error) {
  const msg = error?.message || ''
  if (msg.includes('no_such_match')) return 'No open match with that code. Check the letters and try again.'
  if (msg.includes('match_full')) return 'That match already has two players.'
  if (msg.includes('bad_questions')) return 'Pick between 3 and 50 questions.'
  if (msg.includes('unknown_player')) return 'Your account wasn’t found. Try logging out and back in.'
  return 'Couldn’t reach the server. Try again.'
}
