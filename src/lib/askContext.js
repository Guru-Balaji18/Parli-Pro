// Builds the study material each page hands to the AI tutor. Keep these under
// a few thousand characters — api/ask.js truncates anything past 12,000.
import { LETTERS } from './quiz'
import { explanationText } from './explanations'
import { MOTION_CLASSES } from '../data/motions'
import { MEETING_GUIDE } from '../data/meetingGuide'

const VOCAB_DEF_LIMIT = 45

export function questionContext(q, picked, note) {
  const choices = LETTERS.filter((l) => q.options[l]).map((l) => `${l}. ${q.options[l]}`)
  const lines = [
    'The student is working through a practice question in this app. The question bank comes from Dunbar’s Manual of Parliamentary Procedure, which HOSA’s event is based on.',
    '',
    `Question: ${q.question}`,
    ...choices,
    `Answer key: ${q.answer}. ${q.options[q.answer]}`,
  ]
  if (picked) {
    lines.push(
      picked === q.answer
        ? `The student answered ${picked}, which is correct.`
        : `The student answered ${picked}. ${q.options[picked]} — which the key counts as wrong.`,
    )
  }
  lines.push(`Topic category: ${q.category}`)
  const explanation = explanationText(note)
  if (explanation) lines.push('', 'The explanation this app shows underneath the question:', explanation)
  return lines.join('\n')
}

export function vocabContext(visible, all) {
  const detailed = (visible.length ? visible : all).slice(0, VOCAB_DEF_LIMIT)
  const shown = new Set(detailed.map((t) => t.term))
  const rest = all.map((t) => t.term).filter((t) => !shown.has(t))
  const lines = [
    'The student is on the Vocabulary page of this app. These definitions were written for the app from the principles in Robert’s Rules of Order Newly Revised (12th ed.), not copied from a glossary.',
    '',
    ...detailed.map((t) => `${t.term} (${t.groupLabel}): ${t.def}`),
  ]
  if (rest.length) lines.push('', `Other terms on the page, without definitions here: ${rest.join(', ')}.`)
  return lines.join('\n')
}

export function motionsContext() {
  const lines = [
    'The student is on the Reference page of this app, looking at its motions chart. Each row lists: motion — second required / debatable / amendable / vote needed.',
  ]
  for (const cls of MOTION_CLASSES) {
    lines.push('', `${cls.label} motions — ${cls.note}`)
    for (const m of cls.motions) {
      const rank = m.rank ? `${m.rank}. ` : ''
      lines.push(`${rank}${m.name} — second: ${m.second}; debatable: ${m.debatable}; amendable: ${m.amendable}; vote: ${m.vote}`)
    }
  }
  return lines.join('\n')
}

// The general parliamentary sections of the guide are ordinary RONR material
// the model already knows, so only their titles go in. The HOSA event details
// are specific enough to be worth sending in full — and are the part a model
// is most likely to get wrong from memory.
export function guideContext() {
  const titles = MEETING_GUIDE.filter((s) => s.part === 'meeting').map((s) => s.title)
  const hosa = MEETING_GUIDE.filter((s) => s.part === 'hosa')
  const lines = [
    'The student is reading this app’s written walkthrough of how a meeting is run. Its sections are: ' +
      titles.join('; ') +
      '. You can point them to a section by name.',
    '',
    'The same page describes the HOSA event. These details come from the official HOSA ILC guidelines dated August 2025 — trust them over your own memory of the event, and mention that a state conference may differ:',
  ]
  for (const s of hosa) lines.push('', `## ${s.title}`, ...s.paragraphs)
  return lines.join('\n')
}

// Belt and braces: the server truncates too, but a clean cut with a note is
// better than a sentence chopped in half.
export function capContext(text, limit = 11000) {
  if (text.length <= limit) return text
  return `${text.slice(0, limit)}\n\n[…trimmed]`
}
