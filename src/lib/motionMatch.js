import { MOTION_CLASSES } from '../data/motions.js'

export const ROUNDS = 10
export const ROUND_SIZE = 5

const COLUMNS = [
  { key: 'second', prompt: 'Requires a second?' },
  { key: 'debatable', prompt: 'Debatable?' },
  { key: 'amendable', prompt: 'Amendable?' },
  { key: 'vote', prompt: 'Vote required?' },
]

// The chart's shorthand, spelled out so each answer tile reads on its own.
const ANSWER_TEXT = {
  debatable: {
    'No*': 'No',
    'Yes (limited)': 'Yes, but limited',
    'If motion is': 'Only if the motion it amends is',
    'If motion was': 'Only if the motion being reconsidered is',
  },
  amendable: {
    'Yes (once)': 'Yes',
  },
  vote: {
    'Majority (tie sustains chair)': 'Majority or tie sustains the chair',
    'Two-thirds against': 'Two-thirds against consideration',
    'No vote — right of one member': 'No vote: one member can demand it',
    'Demand of one member': 'No vote: one member can demand it',
    'Majority / consent': 'Majority, or unanimous consent',
    'Two-thirds, or majority w/ notice': 'Two-thirds, or majority with notice',
  },
}

export const MOTIONS = MOTION_CLASSES.flatMap((c) =>
  c.motions.map((m) => ({ ...m, classLabel: c.label }))
)

export function answerFor(motion, key) {
  const raw = motion[key]
  return ANSWER_TEXT[key]?.[raw] ?? raw
}

const MAX_DISTINCT = Object.fromEntries(
  COLUMNS.map((c) => [c.key, new Set(MOTIONS.map((m) => answerFor(m, c.key))).size])
)

function shuffle(arr, rand) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// One round: a chart column and five motions whose answers aren't all the
// same, so the round is a real match rather than tapping "No" five times.
export function makeRound(rand = Math.random, previousKey = null) {
  const columns = COLUMNS.filter((c) => c.key !== previousKey)
  const column = columns[Math.floor(rand() * columns.length)]
  const target = Math.min(3, MAX_DISTINCT[column.key])
  let best = null
  for (let i = 0; i < 60; i++) {
    const picks = shuffle(MOTIONS, rand).slice(0, ROUND_SIZE)
    const distinct = new Set(picks.map((m) => answerFor(m, column.key))).size
    if (!best || distinct > best.distinct) best = { picks, distinct }
    if (distinct >= target) break
  }
  const motions = best.picks.map((m) => ({ name: m.name, classLabel: m.classLabel, answer: answerFor(m, column.key) }))
  const tiles = shuffle(motions.map((m) => m.answer), rand)
  return { column, motions, tiles }
}
