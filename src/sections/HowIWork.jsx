import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Section from '../components/Section'
import useReducedMotion from '../hooks/useReducedMotion'
import { useScrollContext } from '../providers/ScrollProvider'

gsap.registerPlugin(ScrollTrigger)

const INK = '#1A1A1A'
const CREAM = '#FFFFEB'
const CORAL = '#FF6C4C'
const AMBER = '#FFA946'
const RAIL_ITEM_HEIGHT = 56

const STEPS = [
  {
    number: '01',
    title: 'Understand first.',
    body: 'Start with the bottleneck, not the model: what the manual process costs, and what measurable outcome counts as done.',
  },
  {
    number: '02',
    title: 'Design the spine.',
    body: 'Architecture before code: data layers, routing, schemas, and evaluation designed up front so the system stays deterministic where it matters.',
  },
  {
    number: '03',
    title: 'Build and evaluate.',
    body: 'Models and agents are built against a defined eval suite: Hit Rate@K, MAPE, AUC, LLM-as-a-Judge, so quality is measured, never assumed.',
  },
  {
    number: '04',
    title: 'Ship and measure.',
    body: 'Systems land in client interfaces and scheduled pipelines, then impact is tracked against the baseline: review time, cycle time, cost.',
  },
]

const CSS = `
  @keyframes hiw-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes hiw-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .hiw-path { stroke-dasharray: 1; stroke-dashoffset: 0; }
  .hiw-animate .hiw-path { animation: hiw-draw 900ms var(--ease-out) both; }
  .hiw-animate .hiw-fill { animation: hiw-fade 400ms var(--ease-out) 200ms both; }
  .hiw-copy-animate { animation: hiw-fade 400ms var(--ease-out) both; }
  .hiw-rail-btn {
    display: flex; align-items: center; gap: 12px; width: 100%;
    height: ${RAIL_ITEM_HEIGHT}px; padding: 0 0 0 20px;
    background: none; border: 0; cursor: pointer; text-align: left;
    font-family: 'EB Garamond', Georgia, serif; font-size: 20px; line-height: 1.1;
    color: ${INK}; transition: opacity 240ms var(--ease-inout);
  }
  .hiw-rail-btn:focus-visible { outline: 3px solid var(--fathom); outline-offset: 3px; border-radius: 8px; }
  .hiw-grid { display: grid; grid-template-columns: 240px minmax(0, 1fr) minmax(0, 1fr); gap: 48px; align-items: center; }
`

function useIsDesktop() {
  const query = '(min-width: 900px)'
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    mq.addEventListener('change', onChange)
    setMatches(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return matches
}

const labelStyle = {
  fontFamily: "'Figtree', system-ui, sans-serif",
  fontSize: 15,
  fontWeight: 500,
}

function StepDiagram({ index }) {
  const pathProps = {
    className: 'hiw-path',
    pathLength: 1,
    fill: 'none',
    stroke: INK,
    strokeWidth: 1.5,
    strokeLinecap: 'round',
  }

  if (index === 0) {
    return (
      <>
        <path {...pathProps} d="M40 140 H172 M228 140 H360" />
        <g className="hiw-fill">
          <circle cx="40" cy="140" r="5" fill={INK} />
          <circle cx="360" cy="140" r="5" fill={INK} />
          <circle cx="200" cy="140" r="28" fill={CORAL} />
          <text x="200" y="204" textAnchor="middle" fill={INK} style={labelStyle}>
            bottleneck
          </text>
        </g>
      </>
    )
  }

  if (index === 1) {
    const layers = ['data layers', 'routing', 'schemas']
    return (
      <>
        <path {...pathProps} d="M200 24 V256" />
        <g className="hiw-fill">
          {layers.map((label, i) => {
            const y = 50 + i * 66
            return (
              <g key={label}>
                <rect x="100" y={y} width="200" height="48" rx="12" fill={CREAM} stroke={INK} strokeWidth="1.5" />
                <text x="200" y={y + 30} textAnchor="middle" fill={INK} style={labelStyle}>
                  {label}
                </text>
              </g>
            )
          })}
        </g>
      </>
    )
  }

  if (index === 2) {
    const chips = [
      { label: 'Hit Rate@K', x: 60, y: 82, w: 140 },
      { label: 'MAPE', x: 220, y: 82, w: 100 },
      { label: 'AUC', x: 60, y: 146, w: 90 },
      { label: 'LLM-as-a-Judge', x: 170, y: 146, w: 170 },
    ]
    return (
      <>
        <path {...pathProps} d="M40 224 H360 M80 214 V234 M200 214 V234 M320 214 V234" />
        <g className="hiw-fill">
          {chips.map((c) => (
            <g key={c.label}>
              <rect x={c.x} y={c.y} width={c.w} height="40" rx="20" fill={INK} />
              <text x={c.x + c.w / 2} y={c.y + 25} textAnchor="middle" fill={CREAM} style={labelStyle}>
                {c.label}
              </text>
            </g>
          ))}
        </g>
      </>
    )
  }

  return (
    <>
      <path {...pathProps} d="M60 230 H340" />
      <g className="hiw-fill">
        <rect x="100" y="60" width="80" height="170" rx="8" fill="rgba(26,26,26,0.3)" />
        <rect x="220" y="150" width="80" height="80" rx="8" fill={AMBER} />
        <text x="140" y="256" textAnchor="middle" fill={INK} style={labelStyle}>
          baseline
        </text>
        <text x="260" y="256" textAnchor="middle" fill={INK} style={labelStyle}>
          after
        </text>
      </g>
    </>
  )
}

const DIAGRAM_LABELS = [
  'A single bottleneck node in the pipeline',
  'Three stacked layers: data layers, routing, schemas',
  'Eval suite chips: Hit Rate@K, MAPE, AUC, LLM-as-a-Judge',
  'Two bars comparing baseline and after',
]

function StepCard({ index, animate }) {
  return (
    <div
      style={{
        backgroundColor: '#E4E4D0',
        borderRadius: 'var(--radius-card)',
        padding: 24,
        width: '100%',
      }}
    >
      <svg
        key={animate ? `step-${index}` : undefined}
        className={animate ? 'hiw-animate' : undefined}
        viewBox="0 0 400 280"
        width="100%"
        role="img"
        aria-label={DIAGRAM_LABELS[index]}
        style={{ display: 'block', height: 'auto' }}
      >
        <StepDiagram index={index} />
      </svg>
    </div>
  )
}

function Header() {
  return (
    <header style={{ marginBottom: 40 }}>
      <p className="eyebrow" style={{ margin: '0 0 16px' }}>
        HOW I WORK
      </p>
      <h2 className="display d-64" style={{ margin: 0 }}>
        From bottleneck to <em>baseline.</em>
      </h2>
    </header>
  )
}

export default function HowIWork() {
  const reducedMotion = useReducedMotion()
  const isDesktop = useIsDesktop()
  const scrollCtx = useScrollContext()
  const pinned = isDesktop && !reducedMotion

  const wrapperRef = useRef(null)
  const buttonRefs = useRef([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!pinned || !wrapperRef.current) return undefined

    // Progress only; the stage is held by CSS sticky, not pin: true.
    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const next = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length))
        setActive(next)
      },
    })
    ScrollTrigger.refresh()

    return () => trigger.kill()
  }, [pinned])

  const scrollToStep = (i) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const top = wrapper.getBoundingClientRect().top + window.scrollY
    const range = Math.max(0, wrapper.offsetHeight - window.innerHeight)
    const target = top + ((i + 0.5) / STEPS.length) * range
    setActive(i)

    const lenis = scrollCtx?.lenis?.current ?? scrollCtx?.lenis
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(target, { duration: 0.8 })
    } else {
      window.scrollTo({ top: target, behavior: 'smooth' })
    }
  }

  const onRailKeyDown = (e, i) => {
    let next = null
    if (e.key === 'ArrowDown') next = (i + 1) % STEPS.length
    else if (e.key === 'ArrowUp') next = (i - 1 + STEPS.length) % STEPS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = STEPS.length - 1
    if (next === null) return
    e.preventDefault()
    buttonRefs.current[next]?.focus()
    scrollToStep(next)
  }

  if (!pinned) {
    return (
      <Section id="how-i-work" tone="cream">
        <style>{CSS}</style>
        <div className="wrap" style={{ padding: '96px 0' }}>
          <Header />
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 48 }}>
            {STEPS.map((step, i) => (
              <li key={step.number} style={{ display: 'grid', gap: 20 }}>
                <div>
                  <p className="eyebrow tnum" style={{ margin: '0 0 8px' }}>
                    {step.number}
                  </p>
                  <h3 className="display d-32" style={{ margin: '0 0 12px' }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5 }}>{step.body}</p>
                </div>
                <StepCard index={i} animate={false} />
              </li>
            ))}
          </ol>
        </div>
      </Section>
    )
  }

  const current = STEPS[active]

  return (
    <Section id="how-i-work" tone="cream">
      <style>{CSS}</style>
      <div ref={wrapperRef} style={{ position: 'relative', height: '240vh' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100svh',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <div className="wrap" style={{ width: '100%', paddingTop: 72 }}>
            <Header />
            <div className="hiw-grid">
              <nav aria-label="How I work steps">
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 3,
                      height: RAIL_ITEM_HEIGHT,
                      borderRadius: 2,
                      backgroundColor: CORAL,
                      transform: `translateY(${active * RAIL_ITEM_HEIGHT}px)`,
                      transition: 'transform 400ms var(--ease-inout)',
                    }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 1,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: 'rgba(26,26,26,0.1)',
                    }}
                  />
                  {STEPS.map((step, i) => (
                    <li key={step.number}>
                      <button
                        ref={(el) => {
                          buttonRefs.current[i] = el
                        }}
                        type="button"
                        className="hiw-rail-btn"
                        aria-current={i === active ? 'step' : undefined}
                        onClick={() => scrollToStep(i)}
                        onKeyDown={(e) => onRailKeyDown(e, i)}
                        style={{ opacity: i === active ? 1 : 0.4 }}
                      >
                        <span className="tnum" style={{ fontFamily: "'Figtree', system-ui, sans-serif", fontSize: 13, fontWeight: 600 }}>
                          {step.number}
                        </span>
                        <span>{step.title}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>

              <StepCard index={active} animate />

              <div key={active} className="hiw-copy-animate" aria-live="polite">
                <p className="eyebrow tnum" style={{ margin: '0 0 12px' }}>
                  {current.number}
                </p>
                <h3 className="display d-32" style={{ margin: '0 0 16px' }}>
                  {current.title}
                </h3>
                <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5 }}>{current.body}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
