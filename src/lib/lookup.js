import { MOTION_CLASSES } from '../data/motions'
import { VOCAB_TERMS } from '../data/vocab'

export function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Every motion name from the reference chart, longest first so "Postpone to a
// Certain Time" matches before the shorter "Postpone Indefinitely" would.
const ALL_MOTIONS = MOTION_CLASSES.flatMap((c) => c.motions.map((m) => m.name))
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .sort((a, b) => b.length - a.length)

const ALL_VOCAB = VOCAB_TERMS.slice().sort((a, b) => b.term.length - a.term.length)

// Returns { type: 'reference'|'vocab', anchor: string, label: string } or null.
export function findLookup(question, options) {
  const text = (question + ' ' + Object.values(options).join(' ')).toLowerCase()

  for (const name of ALL_MOTIONS) {
    if (text.includes(name.toLowerCase())) {
      return { type: 'reference', anchor: slugify(name), label: name }
    }
  }
  // A couple of common aliases that don't appear verbatim in the chart.
  const aliases = [
    ['previous question', 'Previous Question'],
    ['call the question', 'Previous Question'],
    ['point of information', 'Request for Information'],
    ['discharge a committee', 'Discharge a Committee'],
    ['committee of the whole', 'officers-and-committees'],
  ]
  for (const [phrase, target] of aliases) {
    if (text.includes(phrase)) {
      const motion = ALL_MOTIONS.find((m) => m === target)
      if (motion) return { type: 'reference', anchor: slugify(motion), label: motion }
    }
  }

  for (const t of ALL_VOCAB) {
    if (text.includes(t.term.toLowerCase())) {
      return { type: 'vocab', anchor: `vocab-${t.id}`, label: t.term }
    }
  }
  return null
}
