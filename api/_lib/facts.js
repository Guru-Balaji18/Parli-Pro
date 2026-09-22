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

// The chart drills the motions students are tested on and says nothing about
// the rest of the book. Told only "trust the chart", the model decided an
// incidental main motion was not a real thing — so the concepts the chart
// leaves out, but the written test asks about, are spelled out here. Each one
// is checked against RONR 12th ed. (§6:2, §6:9, §6:13, §10:4-5).
export const BEYOND_CHART = `NOT ON THE CHART — the chart lists the motions students drill, not every idea in the book. Something missing from it is not thereby untrue; explain it from the 12th edition and say the chart doesn't cover it.

- Main motions come in two subclasses. An ORIGINAL main motion brings a new substantive question before the assembly. An INCIDENTAL main motion is a main motion that is incidental to, or relates to, the assembly's business or its past or future action — for example moving to adopt a committee's recommendations, or to ratify something already done. Amend, Commit, Postpone to a Certain Time and Limit or Extend Limits of Debate each have a matching incidental main motion of the same name, used when nothing is pending; so do Recess, Adjourn and Fix the Time to Which to Adjourn.
- Incidental main motions are main motions. They are a completely separate category from the incidental motions class, and they are handled under the rules for main motions. Saying no such thing exists is wrong.
- One consequence worth knowing: Objection to the Consideration of a Question applies only to an original main motion, never to an incidental main motion.
- The five classes of motions are main, subsidiary, privileged, incidental, and the motions that bring a question again before the assembly.`

export const MOTIONS_REFERENCE = `REFERENCE — the motions chart from this app. It was checked against Robert's Rules of Order Newly Revised (12th ed.) and it is what the students are taught from, so treat it as correct and never contradict it. Each row is: motion | class | second required | debatable | amendable | vote needed.

${rows.join('\n\n')}`
