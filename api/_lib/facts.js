// Ground truth handed to the model with every question.
//
// gpt-oss-120b confidently called Lay on the Table a privileged motion (it is
// subsidiary) on the first live answer it gave. Classification and handling
// rules are exactly what Round 1 tests, and this app already holds a chart
// that was checked against the Standard Descriptive Characteristics in RONR
// 12th ed. — so the model is given that chart rather than trusted to remember.
import { MOTION_CLASSES } from '../../src/data/motions.js'

const rows = MOTION_CLASSES.map((cls) => {
  const lines = cls.motions.map(
    (m) => `- ${m.name} | ${cls.label} | second: ${m.second} | debatable: ${m.debatable} | amendable: ${m.amendable} | vote: ${m.vote}`,
  )
  return `${cls.label} motions — ${cls.note}\n${lines.join('\n')}`
})

export const MOTIONS_REFERENCE = `REFERENCE — the motions chart from this app. It was checked against Robert's Rules of Order Newly Revised (12th ed.) and it is what the students are taught from, so treat it as correct and never contradict it. Each row is: motion | class | second required | debatable | amendable | vote needed.

${rows.join('\n\n')}`
