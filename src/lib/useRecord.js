import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useRecord() {
  const [attempts, setAttempts] = useState(null)
  const [flags, setFlags] = useState(null)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    const [a, f] = await Promise.all([
      supabase
        .from('attempts')
        .select('question_id, category_id, is_correct, time_seconds, answered_at, mode')
        .order('answered_at', { ascending: false })
        .limit(20000),
      supabase.from('flags').select('question_id'),
    ])
    if (a.error || f.error) {
      setError('Could not load your record.')
      return
    }
    setAttempts(a.data)
    setFlags(new Set(f.data.map((r) => r.question_id)))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { attempts, flags, error, reload, setFlags }
}

// Questions answered wrong on the most recent attempt for that question.
export function missedQuestionIds(attempts) {
  const latest = new Map()
  for (const a of attempts) {
    if (!latest.has(a.question_id)) latest.set(a.question_id, a.is_correct)
  }
  return new Set([...latest.entries()].filter(([, ok]) => !ok).map(([id]) => id))
}

export function summarize(attempts) {
  if (!attempts.length) return null
  const total = attempts.length
  const correct = attempts.filter((a) => a.is_correct).length
  const time = attempts.reduce((s, a) => s + Number(a.time_seconds), 0)
  return {
    total,
    correct,
    accuracy: Math.round((correct / total) * 100),
    avgTime: time / total,
    unique: new Set(attempts.map((a) => a.question_id)).size,
  }
}

// Consecutive days with at least one attempt, counting back from today.
export function currentStreak(attempts) {
  if (!attempts.length) return 0
  const days = new Set(
    attempts.map((a) => new Date(a.answered_at).toLocaleDateString('en-CA'))
  )
  let streak = 0
  const cursor = new Date()
  // Allow the streak to stand if today has no activity yet but yesterday does.
  if (!days.has(cursor.toLocaleDateString('en-CA'))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(cursor.toLocaleDateString('en-CA'))) return 0
  }
  while (days.has(cursor.toLocaleDateString('en-CA'))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// Accuracy grouped by calendar day, oldest first.
export function dailyAccuracy(attempts, maxDays = 21) {
  const byDay = new Map()
  for (const a of attempts) {
    const d = new Date(a.answered_at).toLocaleDateString('en-CA')
    const e = byDay.get(d) || { count: 0, correct: 0 }
    e.count += 1
    e.correct += a.is_correct ? 1 : 0
    byDay.set(d, e)
  }
  return [...byDay.entries()]
    .sort((x, y) => (x[0] < y[0] ? -1 : 1))
    .slice(-maxDays)
    .map(([day, e]) => ({
      day: day.slice(5),
      accuracy: Math.round((e.correct / e.count) * 100),
      count: e.count,
    }))
}
