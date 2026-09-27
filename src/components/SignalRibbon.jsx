import { useEffect, useRef } from 'react'
import useReducedMotion from '../hooks/useReducedMotion'
import { PROJECTS } from '../data/projects'
import { EXPERIENCE } from '../data/experience'
import '../styles/signal-ribbon.css'

// Raw signal in, structured value out: a loopy sound wave flows into the pill,
// and real skills / project names leave it along a thick ink band.

const SVGNS = 'http://www.w3.org/2000/svg'
const BASE_SPEED = 40
const BAR_COUNT = 14
const TOKEN_GAP = 28
const MAX_PENDING = 3
const FRAGMENTS = ['um, so the call', 'refund? maybe', 'ref 4471 ...']

// Project titles shortened to their first title words (2-4 words).
function shortTitle(title) {
  const head = title.split(':')[0].trim()
  const words = head.split(/\s+/)
  if (words.length >= 2 && words.length <= 4) return head
  const all = title.replace(':', '').split(/\s+/)
  return all.slice(0, Math.min(4, Math.max(2, words.length))).join(' ')
}

function buildItems() {
  const skills = []
  const seen = new Set()
  const add = (s) => {
    if (!seen.has(s)) {
      seen.add(s)
      skills.push(s)
    }
  }
  EXPERIENCE[0].techStack.forEach(add)
  PROJECTS.forEach((p) => p.techStack.forEach(add))
  EXPERIENCE.slice(1, 3).forEach((e) => e.techStack.forEach(add))
  const projects = ['Databricks apps', ...PROJECTS.map((p) => shortTitle(p.title))]
  const out = []
  let pi = 0
  skills.forEach((s, i) => {
    out.push(s)
    if (i % 3 === 2 && pi < projects.length) out.push(projects[pi++])
  })
  while (pi < projects.length) out.push(projects[pi++])
  return out
}

const ITEMS = buildItems()

function env(q) {
  const e = Math.sin(q * 0.05) + 0.6 * Math.sin(q * 0.019 + 2) - 0.25
  return 0.08 + 0.92 * Math.pow(Math.min(1, Math.max(0, e)), 1.5)
}

function wave(q, t) {
  const f1 = 0.35 + 0.04 * Math.sin(t * 0.21)
  const f2 = 0.52 + 0.05 * Math.sin(t * 0.13 + 1)
  const f3 = 0.8 + 0.06 * Math.sin(t * 0.17 + 2)
  return (
    Math.sin(q * f1) * 0.45 +
    Math.sin(q * f2 + 1.3) * 0.3 +
    Math.sin(q * f3 + 0.4) * 0.15 +
    Math.sin(q * 0.21 + 2.1) * 0.1
  )
}

function sample(pathEl, step) {
  const len = pathEl.getTotalLength()
  const n = Math.max(2, Math.ceil(len / step))
  const xs = new Float32Array(n + 1)
  const ys = new Float32Array(n + 1)
  for (let i = 0; i <= n; i++) {
    const p = pathEl.getPointAtLength((i / n) * len)
    xs[i] = p.x
    ys[i] = p.y
  }
  const nx = new Float32Array(n + 1)
  const ny = new Float32Array(n + 1)
  const ang = new Float32Array(n + 1)
  for (let i = 0; i <= n; i++) {
    const a = Math.max(0, i - 1)
    const b = Math.min(n, i + 1)
    const dx = xs[b] - xs[a]
    const dy = ys[b] - ys[a]
    const l = Math.hypot(dx, dy) || 1
    nx[i] = -dy / l
    ny[i] = dx / l
    ang[i] = Math.atan2(dy, dx)
  }
  return { xs, ys, nx, ny, ang, n, len, step: len / n }
}

export default function SignalRibbon() {
  const reduced = useReducedMotion()
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const leftPathRef = useRef(null)
  const bandPathRef = useRef(null)
  const tokensRef = useRef(null)
  const pillRef = useRef(null)
  const chipRef = useRef(null)
  const chipTextRef = useRef(null)
  const barsRef = useRef([])

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!root || !ctx) return undefined

    const st = {
      W: 0, H: 0, mobile: false, left: null, band: null,
      pillX: 0, pillY: 0, pillW: 0,
      phase: 400, t: 0, boost: 0, paused: false,
      tokens: [], pending: 0, next: 0, prevEnv: 0, sinceSpawn: 0,
      bars: new Float32Array(BAR_COUNT), raf: 0, last: 0,
      inView: true, lastY: window.scrollY,
      widths: new Map(), armed: false,
    }

    const buildEl = (label) => {
      const el = document.createElement('span')
      el.className = 'signal-ribbon__token'
      el.appendChild(document.createTextNode(label))
      const g = document.createElement('i')
      g.textContent = '\u2726'
      el.appendChild(g)
      return el
    }

    // Rendered width (label plus sparkle separator), cached per label.
    const measure = (label) => {
      const cached = st.widths.get(label)
      if (cached !== undefined) return cached
      const el = buildEl(label)
      el.style.visibility = 'hidden'
      tokensRef.current.appendChild(el)
      const w = el.offsetWidth
      el.remove()
      st.widths.set(label, w)
      return w
    }

    const nextLabel = () => ITEMS[st.next % ITEMS.length]

    const makeToken = (d) => {
      const label = nextLabel()
      st.next++
      const w = measure(label)
      const el = buildEl(label)
      tokensRef.current.appendChild(el)
      const tok = { el, w, d, sharp: false }
      st.tokens.push(tok)
      if (chipTextRef.current) chipTextRef.current.textContent = `Extracted: ${label}`
      return tok
    }

    const placeToken = (tok) => {
      const b = st.band
      const i = Math.min(b.n, Math.max(0, Math.round(tok.d / b.step)))
      tok.el.style.transform = `translate(${b.xs[i]}px,${b.ys[i]}px) rotate(${b.ang[i]}rad) translate(0,-50%)`
      if (!tok.sharp) {
        const k = reduced ? 1 : Math.min(1, tok.d / 40)
        tok.el.style.opacity = String(k)
        tok.el.style.filter = k >= 1 ? 'none' : `blur(${(1 - k) * 4}px)`
        if (k >= 1) tok.sharp = true
      }
    }

    // A new token spawns at d=0 spanning [0, w]; the previous tail must clear
    // it by TOKEN_GAP and also sit TOKEN_GAP past the pill exit.
    const canEmit = () => {
      const head = st.tokens[st.tokens.length - 1]
      if (!head) return true
      const w = measure(nextLabel())
      const need = Math.max(w + TOKEN_GAP, st.pillW / 2 + TOKEN_GAP)
      return head.d >= need
    }

    const seed = () => {
      tokensRef.current.textContent = ''
      st.tokens = []
      let d = st.band.len - 10
      while (true) {
        const w = measure(nextLabel())
        const start = d - w
        if (start < 0) break
        const tok = makeToken(start)
        placeToken(tok)
        d = start - TOKEN_GAP
      }
      // Most recent is closest to the pill (last in queue).
      st.tokens.sort((a, b) => b.d - a.d)
    }

    const layout = () => {
      const r = root.getBoundingClientRect()
      const W = Math.max(320, r.width)
      const H = r.height || 280
      st.W = W
      st.H = H
      st.mobile = W < 640
      st.widths.clear()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const pf = st.mobile ? 0.4 : 0.55
      const px = W * pf
      const cy = 0.55
      const flat = st.mobile ? 0.5 : 1
      const X = (u) => (u * px).toFixed(1)
      const Y = (v) => ((cy + (v - cy) * flat) * H).toFixed(1)
      const leftD =
        `M ${X(-0.02)} ${Y(0.6)} C ${X(0.18)} ${Y(0.72)}, ${X(0.38)} ${Y(0.18)}, ${X(0.48)} ${Y(0.3)} ` +
        `C ${X(0.58)} ${Y(0.42)}, ${X(0.52)} ${Y(0.88)}, ${X(0.4)} ${Y(0.74)} ` +
        `C ${X(0.3)} ${Y(0.62)}, ${X(0.44)} ${Y(0.28)}, ${X(0.62)} ${Y(0.44)} ` +
        `C ${X(0.78)} ${Y(0.56)}, ${X(0.9)} ${Y(0.56)}, ${X(1)} ${Y(cy)}`
      const topV = st.mobile ? 0.3 : 0.14
      const span = W - px
      const bandD =
        `M ${px.toFixed(1)} ${(cy * H).toFixed(1)} C ${(px + span * 0.35).toFixed(1)} ${(cy * H).toFixed(1)}, ` +
        `${(px + span * 0.6).toFixed(1)} ${(topV * H + 20).toFixed(1)}, ${(W + 60).toFixed(1)} ${(topV * H).toFixed(1)}`
      leftPathRef.current.setAttribute('d', leftD)
      bandPathRef.current.setAttribute('d', bandD)
      bandPathRef.current.setAttribute('stroke-width', st.mobile ? '34' : '44')

      st.left = sample(leftPathRef.current, 3)
      st.band = sample(bandPathRef.current, 2)
      st.pillX = px
      st.pillY = cy * H
      const pill = pillRef.current
      st.pillW = pill.offsetWidth
      pill.style.left = `${px}px`
      pill.style.top = `${st.pillY}px`
      pill.style.transform = 'translate(-50%,-50%)'
      chipRef.current.style.left = `${px}px`
      chipRef.current.style.top = `${st.pillY - 50}px`
      chipRef.current.style.transform = 'translate(-50%,-50%)'
      seed()
    }

    const draw = () => {
      const L = st.left
      const { W, H, t, phase } = st
      ctx.clearRect(0, 0, W, H)
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(L.xs[0], L.ys[0])
      for (let i = 1; i <= L.n; i++) ctx.lineTo(L.xs[i], L.ys[i])
      ctx.strokeStyle = 'rgba(26,26,26,0.12)'
      ctx.lineWidth = 1
      ctx.stroke()

      const A = st.mobile ? 10 : 18
      ctx.beginPath()
      for (let i = 0; i <= L.n; i++) {
        const q = phase - i * L.step
        const e = env(q)
        const a = A * e * wave(q, t) + (reduced ? 0 : (Math.random() - 0.5) * 2 * e)
        const x = L.xs[i] + L.nx[i] * a
        const y = L.ys[i] + L.ny[i] * a
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(26,26,26,0.7)'
      ctx.lineWidth = st.mobile ? 1 : 1.5
      ctx.stroke()

      if (!st.mobile) {
        ctx.fillStyle = 'rgba(26,26,26,0.35)'
        ctx.font = "12px 'Figtree', system-ui, sans-serif"
        const at = [0.08, 0.36, 0.7]
        FRAGMENTS.forEach((f, k) => {
          const i = Math.round(at[k] * L.n)
          ctx.fillText(f, L.xs[i] + L.nx[i] * 30, L.ys[i] + L.ny[i] * 30)
        })
      }

      // Equaliser: bars follow the signal arriving at the pill.
      const qP = phase - L.len
      const eP = env(qP)
      const loud = eP > 0.6
      for (let k = 0; k < BAR_COUNT; k++) {
        const target = reduced
          ? 0.3 + 0.6 * Math.abs(Math.sin(k * 1.7))
          : Math.min(1, Math.abs(wave(qP + k * 5, t)) * eP * 1.6 + 0.12)
        st.bars[k] += (target - st.bars[k]) * (reduced ? 1 : 0.3)
        const bar = barsRef.current[k]
        if (bar) {
          bar.style.transform = `scaleY(${(0.15 + 0.85 * st.bars[k]).toFixed(3)})`
          const amber = loud && k > 3 && k < BAR_COUNT - 4
          bar.style.backgroundColor = amber ? '#FFA946' : '#1A1A1A'
        }
      }
      if (!reduced) {
        pillRef.current.style.transform = `translate(-50%,-50%) scale(${(1 + (loud ? 0.05 * eP : 0)).toFixed(3)})`
      }
      return eP
    }

    const tick = (now) => {
      const dt = Math.min(0.05, (now - st.last) / 1000)
      st.last = now
      if (!st.paused) {
        st.boost *= Math.exp(-dt * 2.5)
        const v = BASE_SPEED * (1 + st.boost)
        st.phase += v * dt
        st.t += dt
        st.sinceSpawn += dt
        const eP = draw()
        if ((st.prevEnv < 0.55 && eP >= 0.55) || st.sinceSpawn > 7) {
          st.pending = Math.min(MAX_PENDING, st.pending + 1)
          st.sinceSpawn = 0
        }
        st.prevEnv = eP
        // All tokens share one velocity so spacing is preserved under boost.
        for (let i = st.tokens.length - 1; i >= 0; i--) {
          const tok = st.tokens[i]
          tok.d += v * dt
          if (tok.d > st.band.len) {
            tok.el.remove()
            st.tokens.splice(i, 1)
          }
        }
        if (st.pending > 0 && canEmit()) {
          st.pending--
          makeToken(0)
        }
        st.tokens.forEach(placeToken)
      }
      st.raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!st.armed || reduced || st.raf || !st.inView || document.hidden) return
      st.last = performance.now()
      st.raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (st.raf) cancelAnimationFrame(st.raf)
      st.raf = 0
    }

    // Static frame first; the loop is armed after load plus idle.
    layout()
    draw()

    let idleId = 0
    let idleIsRic = false
    const arm = () => {
      idleId = 0
      st.armed = true
      start()
    }
    const onLoad = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleIsRic = true
        idleId = window.requestIdleCallback(arm, { timeout: 1200 })
      } else {
        idleId = setTimeout(arm, 1)
      }
    }
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad)

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { layout(); draw() })
      : null
    if (ro) ro.observe(root)
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([en]) => {
        st.inView = en.isIntersecting
        if (st.inView) start()
        else stop()
      })
      : null
    if (io) io.observe(root)
    const onVis = () => (document.hidden ? stop() : start())
    const onScroll = () => {
      const y = window.scrollY
      st.boost = Math.min(2, st.boost + Math.abs(y - st.lastY) * 0.01)
      st.lastY = y
    }
    const onEnter = () => { st.paused = true }
    const onLeave = () => { st.paused = false; st.last = performance.now() }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('scroll', onScroll, { passive: true })
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)

    return () => {
      stop()
      window.removeEventListener('load', onLoad)
      if (idleId) {
        if (idleIsRic) window.cancelIdleCallback(idleId)
        else clearTimeout(idleId)
      }
      if (ro) ro.disconnect()
      if (io) io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('scroll', onScroll)
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  return (
    <div className="signal-ribbon">
      <div ref={rootRef} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <canvas ref={canvasRef} className="signal-ribbon__canvas" />
        <svg className="signal-ribbon__svg" focusable="false">
          <path ref={leftPathRef} fill="none" stroke="none" />
          <path ref={bandPathRef} fill="none" stroke="#1A1A1A" strokeWidth="44" strokeLinecap="round" />
        </svg>
        <div ref={tokensRef} className="signal-ribbon__tokens" />
        <div ref={pillRef} className="signal-ribbon__pill">
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <span
              key={i}
              className="signal-ribbon__bar"
              ref={(el) => { barsRef.current[i] = el }}
            />
          ))}
        </div>
        <div ref={chipRef} className="signal-ribbon__chip">
          <svg width="14" height="14" viewBox="0 0 14 14" focusable="false">
            <path d="M2.5 7.5 L5.5 10.5 L11.5 3.5" fill="none" stroke="#FFFFEB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span ref={chipTextRef}>Extracted: {ITEMS[0]}</span>
        </div>
      </div>
      <ul className="signal-ribbon__sr" aria-label="Skills and projects">
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
