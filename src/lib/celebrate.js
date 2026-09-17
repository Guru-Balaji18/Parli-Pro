import confetti from 'canvas-confetti'

const COLORS = ['#3d6bff', '#8b5cf6', '#ff4f8b', '#ff8a34', '#ffc83d', '#12b8a6', '#22b573']

function reduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// A small pop from an element, e.g. a correct answer button.
export function popFrom(el) {
  if (reduced() || !el) return
  const r = el.getBoundingClientRect()
  confetti({
    particleCount: 26,
    spread: 60,
    startVelocity: 26,
    scalar: 0.8,
    ticks: 90,
    colors: COLORS,
    origin: { x: (r.left + r.width * 0.15) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
  })
}

// A full celebration for wins and big scores.
export function bigCelebration() {
  if (reduced()) return
  const end = Date.now() + 1400
  ;(function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS })
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 120, spread: 100, startVelocity: 45, origin: { y: 0.45 }, colors: COLORS })
}
