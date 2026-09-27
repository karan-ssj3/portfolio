import { useEffect, useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { store } from '../lib/trainingStore'

const EPOCHS = 40
const SEED = 4051
const PAD = { left: 4, right: 10, top: 10, bottom: 6 }
const HEAD_R = 3.5

function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Seeded synthetic decay, never a real model's metrics.
function buildSeries() {
  const rand = mulberry32(SEED)
  const train = []
  const val = []
  for (let e = 0; e <= EPOCHS; e += 1) {
    const noise = (rand() * 2 - 1) * 0.04 * Math.exp(-e / 20)
    const t = 0.08 + 2.2 * Math.exp(-e / 9) + noise
    train.push(t)
    val.push(t + 0.05 + 0.1 * Math.exp(-e / 12))
  }
  return { train, val }
}

const SERIES = buildSeries()
const Y_MAX = Math.max(...SERIES.val) * 1.05

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// Build pixel-space geometry for the current SVG size.
function layout(width, height) {
  const innerW = Math.max(1, width - PAD.left - PAD.right)
  const innerH = Math.max(1, height - PAD.top - PAD.bottom)
  const x = (e) => PAD.left + (e / EPOCHS) * innerW
  const y = (v) => PAD.top + (1 - v / Y_MAX) * innerH

  const train = SERIES.train.map((v, e) => [x(e), y(v)])
  const val = SERIES.val.map((v, e) => [x(e), y(v)])

  const cum = [0]
  for (let i = 1; i < train.length; i += 1) {
    const dx = train[i][0] - train[i - 1][0]
    const dy = train[i][1] - train[i - 1][1]
    cum.push(cum[i - 1] + Math.hypot(dx, dy))
  }

  return { width, height, train, val, cum, total: cum[cum.length - 1] }
}

const toPoints = (pts) => pts.map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join(' ')

const STYLES = `
.loss-hud {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 2;
  pointer-events: none;
  padding: 14px 16px 12px;
  border: 1px solid rgba(255, 255, 235, 0.15);
  border-radius: 20px;
  background: rgba(26, 26, 26, 0.6);
  color: #FFFFEB;
  font-family: 'Figtree', system-ui, sans-serif;
  opacity: 1;
  transition: opacity 240ms var(--ease-out);
}
.loss-hud__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}
.loss-hud__head .loss-hud__label {
  margin: 0;
  font-size: 12px;
  opacity: 1;
  color: rgba(255, 255, 235, 0.7);
}
.loss-hud__epoch {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.loss-hud__svg {
  display: block;
  width: 280px;
  height: 120px;
  overflow: visible;
}
.loss-hud__loss {
  margin: 8px 0 0;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  opacity: 0.8;
}
@media (max-width: 719px) {
  .loss-hud { left: 12px; right: 12px; bottom: 72px; padding: 12px 14px 10px; }
  .loss-hud__svg { width: 100%; height: 90px; }
}
`

/**
 * LossCurveHUD
 *
 * Decorative loss curve that draws itself as training epochs pass. The
 * curve is precomputed from a seeded PRNG; a rAF loop reads store.epoch and
 * writes straight to the SVG through refs, so there are no React renders
 * per frame. Under reduced motion the finished curve is drawn once.
 */
export default function LossCurveHUD() {
  const reducedMotion = useReducedMotion()

  const svgRef = useRef(null)
  const trainRef = useRef(null)
  const valRef = useRef(null)
  const headRef = useRef(null)
  const axisXRef = useRef(null)
  const axisYRef = useRef(null)
  const epochRef = useRef(null)
  const lossRef = useRef(null)
  const geomRef = useRef(null)
  const lastEpochRef = useRef(-1)
  const lastLabelRef = useRef(-1)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return undefined

    const draw = (epoch) => {
      const geom = geomRef.current
      if (!geom) return
      const e = clamp(Number.isFinite(epoch) ? epoch : 0, 0, EPOCHS)
      const i = Math.min(Math.floor(e), EPOCHS - 1)
      const f = e - i

      const len = geom.cum[i] + f * (geom.cum[i + 1] - geom.cum[i])
      const train = trainRef.current
      if (train) {
        train.style.strokeDasharray = `${geom.total} ${geom.total}`
        train.style.strokeDashoffset = `${Math.max(0, geom.total - len)}`
      }

      const a = geom.train[i]
      const b = geom.train[i + 1]
      if (headRef.current) {
        headRef.current.setAttribute('cx', (a[0] + (b[0] - a[0]) * f).toFixed(2))
        headRef.current.setAttribute('cy', (a[1] + (b[1] - a[1]) * f).toFixed(2))
      }

      const n = Math.min(EPOCHS, Math.floor(e + 1e-6))
      if (n !== lastLabelRef.current && epochRef.current) {
        epochRef.current.textContent = `EPOCH ${n} / ${EPOCHS}`
        lastLabelRef.current = n
      }

      const loss = SERIES.train[i] + (SERIES.train[i + 1] - SERIES.train[i]) * f
      if (lossRef.current) lossRef.current.textContent = `loss ${loss.toFixed(3)}`

      lastEpochRef.current = e
    }

    const applyLayout = () => {
      const rect = svg.getBoundingClientRect()
      const width = Math.round(rect.width) || 280
      const height = Math.round(rect.height) || 120
      const prev = geomRef.current
      if (prev && prev.width === width && prev.height === height) return

      const geom = layout(width, height)
      geomRef.current = geom
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      if (trainRef.current) trainRef.current.setAttribute('points', toPoints(geom.train))
      if (valRef.current) valRef.current.setAttribute('points', toPoints(geom.val))

      const baseY = (height - PAD.bottom).toFixed(2)
      if (axisXRef.current) {
        axisXRef.current.setAttribute('x1', `${PAD.left}`)
        axisXRef.current.setAttribute('x2', `${width - PAD.right}`)
        axisXRef.current.setAttribute('y1', baseY)
        axisXRef.current.setAttribute('y2', baseY)
      }
      if (axisYRef.current) {
        axisYRef.current.setAttribute('x1', `${PAD.left}`)
        axisYRef.current.setAttribute('x2', `${PAD.left}`)
        axisYRef.current.setAttribute('y1', `${PAD.top}`)
        axisYRef.current.setAttribute('y2', baseY)
      }

      const current = reducedMotion ? EPOCHS : lastEpochRef.current >= 0 ? lastEpochRef.current : store.epoch
      draw(current)
    }

    applyLayout()

    let observer = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(applyLayout)
      observer.observe(svg)
    } else {
      window.addEventListener('resize', applyLayout)
    }

    let raf = 0
    if (!reducedMotion) {
      const tick = () => {
        raf = requestAnimationFrame(tick)
        if (!store.inView) return
        const e = store.epoch
        if (Math.abs(e - lastEpochRef.current) > 1e-4) draw(e)
      }
      raf = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(raf)
      if (observer) observer.disconnect()
      else window.removeEventListener('resize', applyLayout)
      geomRef.current = null
    }
  }, [reducedMotion])

  return (
    <div className="loss-hud" data-testid="loss-hud" aria-hidden="true">
      <style>{STYLES}</style>
      <div className="loss-hud__head">
        <p className="eyebrow loss-hud__label">Illustrative training run</p>
        <span ref={epochRef} className="loss-hud__epoch tnum">
          {`EPOCH ${reducedMotion ? EPOCHS : 0} / ${EPOCHS}`}
        </span>
      </div>
      <svg ref={svgRef} className="loss-hud__svg" viewBox="0 0 280 120" focusable="false">
        <line ref={axisYRef} stroke="rgba(255, 255, 235, 0.15)" strokeWidth="1" />
        <line ref={axisXRef} stroke="rgba(255, 255, 235, 0.15)" strokeWidth="1" />
        <polyline
          ref={valRef}
          fill="none"
          stroke="#FFFFEB"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          ref={trainRef}
          fill="none"
          stroke="#FFFFEB"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle ref={headRef} r={HEAD_R} cx="0" cy="0" fill="#FF6C4C" />
      </svg>
      <p ref={lossRef} className="loss-hud__loss tnum">
        {`loss ${(reducedMotion ? SERIES.train[EPOCHS] : SERIES.train[0]).toFixed(3)}`}
      </p>
    </div>
  )
}
