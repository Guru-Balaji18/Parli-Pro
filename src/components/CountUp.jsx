import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'

// Counts up from 0 to `to` when it mounts or `to` changes.
export default function CountUp({ to, decimals = 0, suffix = '', duration = 0.9 }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const fmt = (v) => `${Number(v).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce) {
      el.textContent = fmt(to)
      return
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => { el.textContent = fmt(v) },
    })
    return () => controls.stop()
    // fmt only depends on decimals and suffix
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, decimals, suffix, duration, reduce])

  return <span ref={ref}>{fmt(reduce ? to : 0)}</span>
}
