// Question helpers shared by Practice and 1v1.

export const LETTERS = ['A', 'B', 'C', 'D']

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Hiding a choice and re-lettering the rest breaks answers like "All of the
// above" or "Both A and C", so questions with those always keep all four.
const REFERS_TO_WORDS = /\b(above|below|both|neither|all of these|none of these)\b/i
const REFERS_TO_LETTERS = /\b[A-D]\b\s*(,|and|or|&)\s*(and\s+|or\s+)?\b[A-D]\b|\banswers? [A-D]\b/

// The wrong letters that could be hidden in three-choice mode, or [] when the
// question has to keep all of its choices.
export function hideableLetters(q) {
  const letters = LETTERS.filter((l) => q.options[l])
  const canHide = letters.length === 4 &&
    !letters.some((l) => REFERS_TO_WORDS.test(q.options[l]) || REFERS_TO_LETTERS.test(q.options[l]))
  return canHide ? letters.filter((l) => l !== q.answer) : []
}

// `shown` is the on-screen letter, `orig` the bank's own letter.
export function layoutWithHidden(q, hidden) {
  return LETTERS.filter((l) => q.options[l] && l !== hidden)
    .map((orig, i) => ({ shown: LETTERS[i], orig, text: q.options[orig] }))
}

// In three-choice mode one wrong answer is hidden — the same one for the rest
// of the session, picked from the seed.
export function layoutOptions(q, threeChoice, seed) {
  const wrong = threeChoice ? hideableLetters(q) : []
  const hidden = wrong.length ? wrong[hash(`${seed}:${q.id}`) % wrong.length] : null
  return layoutWithHidden(q, hidden)
}
