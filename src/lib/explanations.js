import { useEffect, useState } from 'react'

// The explanations file is large (~550KB), so it loads on first use instead of
// with the app bundle.
let cache = null
let promise = null

export function loadExplanations() {
  if (!promise) {
    promise = import('../data/explanations.json').then((m) => {
      cache = m.default
      return cache
    })
  }
  return promise
}

export function useExplanation(id) {
  const [all, setAll] = useState(cache)
  useEffect(() => {
    if (all) return
    let live = true
    loadExplanations().then((data) => { if (live) setAll(data) }).catch(() => {})
    return () => { live = false }
  }, [all])
  return all ? all[id] : null
}

// Where a source sits in the book: a numbered paragraph ("46:6"), a footnote
// ("3:16n3"), a row of Table II ("T2-28"), one of the tinted-page lists ("L-V"),
// or the unnumbered Introduction.
export function citation(s) {
  if (s.ref === 'Intro') return 'the Introduction'
  if (s.ref.startsWith('T2-')) return `Table II (Table of Rules Relating to Motions), entry ${s.ref.slice(3)}`
  if (s.ref.startsWith('L-')) return s.section
  const fn = s.ref.match(/^(\d+:\d+)n(\d+)$/)
  if (fn) return `${s.section}, footnote ${fn[2]} to paragraph ${fn[1]}`
  return `${s.section}, paragraph ${s.ref}`
}

// The same explanation as flat text, for handing to the AI tutor as context.
export function explanationText(note) {
  if (!note) return ''
  const lines = note.sources.map((s) => `- RONR 12th ed., ${citation(s)} (paraphrased): ${s.says}`)
  if (note.answer) lines.push(`So: ${note.answer}`)
  if (note.conflict) lines.push(`Caveat the app shows: ${note.conflict}`)
  return lines.join('\n')
}
