import { MOTION_CLASSES } from '../data/motions.js'

const ranked = (id) =>
  MOTION_CLASSES.find((c) => c.id === id).motions.slice().sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

// The thirteen ranking motions in order of precedence, highest first.
export const LADDER = [...ranked('privileged'), ...ranked('subsidiary'), ...ranked('main')].map((m, i) => ({
  name: m.name,
  rank: i + 1,
  amendable: m.amendable.startsWith('Yes'),
}))

const MAIN = 'Main Motion'
const AMEND = 'Amend'
const PQ = 'Previous Question'

// Whether these are in order turns on facts a drill card can't show: a genuine
// matter of privilege, or an order of the day that is actually due.
const CIRCUMSTANTIAL = new Set(['Raise a Question of Privilege', 'Call for the Orders of the Day'])
const PLAYABLE = LADDER.filter((m) => !CIRCUMSTANTIAL.has(m.name))
const MAIN_MOTION = LADDER.find((m) => m.name === MAIN)

const capitalize = (s) => s[0].toUpperCase() + s.slice(1)

// An amendment ranks just above the motion it amends, capped at Amend's own
// rank — so an amendment to the main motion still outranks Postpone Indefinitely,
// while an amendment to Limit Debate outranks Commit.
function effectiveRanks(stack) {
  const out = []
  stack.forEach((m, i) => out.push(m.name === AMEND && i > 0 ? Math.min(m.rank, out[i - 1] - 0.5) : m.rank))
  return out
}

// "the amendment to the motion to Commit or Refer", etc. Stack is bottom first.
export function describe(stack, i) {
  const m = stack[i]
  if (m.name === MAIN) return 'the main motion'
  if (m.name === PQ) return 'the Previous Question'
  if (m.name === AMEND) {
    return stack[i - 1].name === AMEND ? 'the secondary amendment' : `the amendment to ${describe(stack, i - 1)}`
  }
  return `the motion to ${m.name}`
}

export function stackLabel(stack, i) {
  return capitalize(describe(stack, i).replace(/^the /, ''))
}

// Completes "A member moves …"
export function proposalText(m) {
  if (m.name === MAIN) return 'a new main motion'
  if (m.name === PQ) return 'the Previous Question'
  if (m.name === AMEND) return 'to amend'
  return `to ${m.name}`
}

function proposalNoun(m) {
  if (m.name === PQ) return 'The Previous Question'
  return `The motion to ${m.name}`
}

// Whether `motion` may be made while `stack` (bottom first) is pending, and why.
export function judge(stack, motion) {
  const top = stack.length - 1
  const pending = describe(stack, top)
  const eff = effectiveRanks(stack)

  if (motion.name === MAIN) {
    return { inOrder: false, reason: 'A new main motion can only be made when no other business is pending.' }
  }

  if (motion.name === AMEND) {
    let degree = 0
    for (let i = top; i >= 0 && stack[i].name === AMEND; i--) degree++
    if (degree >= 2) {
      return { inOrder: false, reason: 'A secondary amendment is already pending. Amending it would be a third-degree amendment, which isn’t allowed.' }
    }
    if (degree === 1) {
      return { inOrder: true, reason: `This would be a secondary amendment, an amendment to ${pending}. An amendment can be amended once.` }
    }
    if (motion.rank < eff[top]) {
      return {
        inOrder: true,
        reason: stack[top].name === MAIN
          ? 'Amend outranks the main motion, so it can be moved while the main motion is pending.'
          : `Amend outranks ${pending}, so it takes precedence. The amendment applies to the main motion.`,
      }
    }
    if (stack[top].amendable) {
      return { inOrder: true, reason: `Amend ranks below ${pending}, but that motion can itself be amended, so this is in order as an amendment to it. An amendment to the main motion would have to wait until it’s decided.` }
    }
    return { inOrder: false, reason: `${capitalize(pending)} outranks Amend and can’t be amended, so it has to be decided first.` }
  }

  const already = stack.findIndex((m) => m.name === motion.name)
  if (already >= 0) {
    return { inOrder: false, reason: `${capitalize(describe(stack, already))} is already pending. The assembly has to decide it before the same motion can be made again.` }
  }
  if (motion.rank < eff[top]) {
    return { inOrder: true, reason: `${proposalNoun(motion)} outranks ${pending}, so it takes precedence and can be moved now.` }
  }
  return { inOrder: false, reason: `${proposalNoun(motion)} ranks below ${pending}, so ${pending} has to be decided first.` }
}

const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)]

export function makeScenario(rand = Math.random) {
  const stack = [MAIN_MOTION]
  const depth = rand() < 0.15 ? 0 : 1 + Math.floor(rand() * 2)
  for (let i = 0; i < depth; i++) {
    const options = PLAYABLE.filter((m) => m.name !== MAIN && judge(stack, m).inOrder)
    if (!options.length) break
    stack.push(pick(options, rand))
  }
  const wantInOrder = rand() < 0.5
  const candidates = PLAYABLE.filter((m) => judge(stack, m).inOrder === wantInOrder)
  const motion = pick(candidates.length ? candidates : PLAYABLE, rand)
  return { stack, motion, ...judge(stack, motion) }
}
