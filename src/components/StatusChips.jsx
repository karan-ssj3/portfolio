import { useEffect, useRef, useState } from 'react'
import WaveformPill from './WaveformPill'
import useReducedMotion from '../hooks/useReducedMotion'

// Real status chips, rendered as a curved pipeline log along an SVG textPath.
const CHIPS = [
  { label: 'Pipeline deployed', sub: 'Airflow · dbt · just now' },
  { label: 'Eval suite passed', sub: 'Hit Rate@K · MRR' },
  { label: 'Job Card drafted', sub: '30 min · was 3 days' },
  { label: 'Self-healing loop closed', sub: 'LangGraph · 2m ago' },
  { label: 'Recommendations live', sub: '3.2M+ profiles · Sydney' },
]

const INK = '#1A1A1A'
const AMBER = '#FFA946'
const VIEW_W = 1200
const VIEW_H = 160
const CYCLE_MS = 60000
const NBSP = '\u00A0'

// Quadratic arcs; apex y = 0.25*y0 + 0.5*yc + 0.25*y2.
const ARCS = {
  desktop: { d: 'M 0 30 Q 600 150 1200 30', apex: 90 },
  mobile: { d: 'M 0 60 Q 600 110 1200 60', apex: 85 },
}

const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

function useIsMobile() {
  const query = '(max-width: 719px)'
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches
  )
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mql = window.matchMedia(query)
    const onChange = () => setMobile(mql.matches)
    onChange()
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else mql.addListener(onChange)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else mql.removeListener(onChange)
    }
  }, [])
  return mobile
}

function renderCopy(copy) {
  return CHIPS.map((chip, i) => [
    <tspan key={`${copy}-t-${i}`} fontWeight="600" fill={INK} fillOpacity="0.6">
      {chip.label}
    </tspan>,
    <tspan key={`${copy}-s-${i}`} fill={INK} fillOpacity="0.6">
      {`${NBSP}·${NBSP}${chip.sub.split(' ').join(NBSP)}${NBSP}`}
    </tspan>,
    <tspan key={`${copy}-g-${i}`} fill={AMBER} fillOpacity="1">
      {`✦${NBSP}`}
    </tspan>,
  ])
}

export default function StatusChips() {
  const reduced = useReducedMotion()
  const mobile = useIsMobile()
  const wrapRef = useRef(null)
  const textRef = useRef(null)
  const textPathRef = useRef(null)
  const copyLenRef = useRef(0)
  const [fontSize, setFontSize] = useState(15)

  const arc = mobile ? ARCS.mobile : ARCS.desktop
  const pxSize = mobile ? 13 : 15

  // Convert the target on-screen px size into viewBox units.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const update = () => {
      const w = el.getBoundingClientRect().width || VIEW_W
      setFontSize((pxSize * VIEW_W) / w)
    }
    update()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pxSize])

  // Font size changes the text length, so re-measure on the next frame.
  useEffect(() => {
    copyLenRef.current = 0
  }, [fontSize, mobile])

  // Loop startOffset from 0 to minus one copy length (half of the duplicated text).
  useEffect(() => {
    const tp = textPathRef.current
    if (!tp) return undefined
    if (reduced) {
      tp.setAttribute('startOffset', '0')
      return undefined
    }
    let raf = 0
    const start = performance.now()
    const tick = (now) => {
      if (!copyLenRef.current && textRef.current) {
        try {
          copyLenRef.current = textRef.current.getComputedTextLength() / 2
        } catch (e) {
          copyLenRef.current = 0
        }
      }
      const progress = ((now - start) % CYCLE_MS) / CYCLE_MS
      const offset = copyLenRef.current
        ? `${-(progress * copyLenRef.current)}`
        : `${-(progress * 50)}%`
      tp.setAttribute('startOffset', offset)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const pathId = mobile ? 'status-arc-mobile' : 'status-arc'

  return (
    <div
      ref={wrapRef}
      className="status-chips"
      style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ display: 'block', width: '100%', height: 'auto', overflow: 'hidden' }}
      >
        <defs>
          <path id={pathId} d={arc.d} fill="none" />
        </defs>
        <text
          ref={textRef}
          fontFamily="'Figtree', system-ui, sans-serif"
          fontSize={fontSize}
          fontWeight="400"
        >
          <textPath ref={textPathRef} href={`#${pathId}`} startOffset="0">
            {renderCopy('a')}
            {renderCopy('b')}
          </textPath>
        </text>
      </svg>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: `${(arc.apex / VIEW_H) * 100}%`,
          transform: 'translate(-50%, -50%)',
          lineHeight: 0,
          pointerEvents: 'none',
        }}
      >
        <WaveformPill tone="ink" />
      </div>

      <ul aria-label="Pipeline status log" style={srOnly}>
        {CHIPS.map((chip) => (
          <li key={chip.label}>
            {chip.label}: {chip.sub}
          </li>
        ))}
      </ul>
    </div>
  )
}
