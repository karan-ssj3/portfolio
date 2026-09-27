import { useEffect, useRef, useState } from 'react'
import Section from './Section'
import useReducedMotion from '../hooks/useReducedMotion'
import { CAPABILITIES, getHighlights } from '../data/capabilities'

const INK = '#1A1A1A'
const AMBER = '#FFA946'
const GREIGE = '#E4E4D0'

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

// Splits a bullet into plain and highlighted segments.
function renderBullet(text) {
  const ranges = getHighlights(text)
    .map((h) => ({ start: text.indexOf(h), end: text.indexOf(h) + h.length }))
    .sort((a, b) => a.start - b.start)

  const out = []
  let cursor = 0
  ranges.forEach((r, i) => {
    if (r.start < cursor) return
    if (r.start > cursor) out.push(text.slice(cursor, r.start))
    out.push(
      <mark
        key={i}
        style={{
          backgroundColor: 'rgba(255, 169, 70, 0.35)',
          color: INK,
          borderRadius: 4,
          padding: '0 2px',
        }}
      >
        {text.slice(r.start, r.end)}
      </mark>
    )
    cursor = r.end
  })
  if (cursor < text.length) out.push(text.slice(cursor))
  return out
}

function BulletList({ bullets }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
      {bullets.map((bullet) => (
        <li
          key={bullet}
          style={{
            display: 'flex',
            gap: 12,
            fontSize: 16,
            lineHeight: '24px',
            overflowWrap: 'anywhere',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: '0 0 12px',
              height: 2,
              marginTop: 11,
              backgroundColor: AMBER,
              borderRadius: 1,
            }}
          />
          <span style={{ minWidth: 0 }}>{renderBullet(bullet)}</span>
        </li>
      ))}
    </ul>
  )
}

// Mini network: three hidden columns feed six output dots, echoing the
// Deep Layers centrepiece. The active output is amber, its path ink.
const COLUMNS = [
  { x: 24, count: 4 },
  { x: 84, count: 5 },
  { x: 144, count: 4 },
]
const OUT_X = 212
const HEIGHT = 132

function columnY(count, i) {
  const step = HEIGHT / (count + 1)
  return step * (i + 1)
}

function MiniNetwork({ active, transition }) {
  const nodes = COLUMNS.map((c) =>
    Array.from({ length: c.count }, (_, i) => ({ x: c.x, y: columnY(c.count, i) }))
  )
  const outputs = Array.from({ length: 6 }, (_, i) => ({ x: OUT_X, y: columnY(6, i) }))
  const layers = [...nodes, outputs]

  const faint = []
  for (let l = 0; l < layers.length - 1; l++) {
    layers[l].forEach((a, ai) => {
      layers[l + 1].forEach((b, bi) => {
        faint.push(
          <line
            key={`${l}-${ai}-${bi}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={INK}
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        )
      })
    })
  }

  const pathPoints = [
    ...nodes.map((col, ci) => col[(active + ci) % col.length]),
    outputs[active],
  ]
  const points = pathPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg
      viewBox={`0 0 236 ${HEIGHT}`}
      width="100%"
      style={{ display: 'block', maxWidth: 280, marginBottom: 24 }}
      aria-hidden="true"
    >
      {faint}
      <polyline
        points={points}
        fill="none"
        stroke={INK}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {nodes.flat().map((n, i) => (
        <circle key={`n${i}`} cx={n.x} cy={n.y} r={3.5} fill={INK} fillOpacity={0.35} />
      ))}
      {pathPoints.slice(0, -1).map((n, i) => (
        <circle key={`p${i}`} cx={n.x} cy={n.y} r={3.5} fill={INK} />
      ))}
      {outputs.map((o, i) => (
        <circle
          key={`o${i}`}
          cx={o.x}
          cy={o.y}
          r={i === active ? 6 : 4.5}
          fill={i === active ? AMBER : INK}
          fillOpacity={i === active ? 1 : 0.2}
          style={{ transition }}
        />
      ))}
    </svg>
  )
}

export default function CapabilityMorph() {
  const reduced = useReducedMotion()
  const isDesktop = useIsDesktop()
  const [active, setActive] = useState(0)
  const headingRefs = useRef([])

  useEffect(() => {
    if (!isDesktop || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number(entry.target.dataset.index))
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    headingRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [isDesktop])

  const fade = reduced ? 'none' : 'opacity 240ms var(--ease-inout)'
  const headingFade = reduced ? 'none' : 'opacity 240ms var(--ease-inout)'

  return (
    <Section tone="cream" id="capabilities" style={{ padding: '120px 0' }}>
      <div className="wrap">
        <p className="eyebrow" style={{ margin: '0 0 16px' }}>
          Capabilities
        </p>
        <h2 className="display d-64" style={{ margin: '0 0 64px' }}>
          Six roles, <em>one pipeline.</em>
        </h2>

        {isDesktop ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 6fr)',
              gap: 64,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 96,
                backgroundColor: GREIGE,
                borderRadius: 24,
                padding: 32,
                color: INK,
              }}
            >
              <MiniNetwork active={active} transition={reduced ? 'none' : 'all 240ms var(--ease-inout)'} />
              <div style={{ display: 'grid' }}>
                {CAPABILITIES.map((cap, i) => (
                  <div
                    key={cap.role}
                    aria-hidden={i !== active}
                    style={{
                      gridArea: '1 / 1',
                      opacity: i === active ? 1 : 0,
                      visibility: i === active ? 'visible' : 'hidden',
                      transition: reduced ? 'none' : `${fade}, visibility 240ms`,
                    }}
                  >
                    <p className="eyebrow" style={{ margin: '0 0 16px' }}>
                      {cap.role}
                    </p>
                    <BulletList bullets={cap.bullets} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              {CAPABILITIES.map((cap, i) => (
                <div
                  key={cap.role}
                  ref={(el) => (headingRefs.current[i] = el)}
                  data-index={i}
                  style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}
                >
                  <h3
                    className="display d-48"
                    style={{
                      margin: 0,
                      color: INK,
                      opacity: i === active ? 1 : 0.35,
                      transition: headingFade,
                    }}
                  >
                    {cap.role}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 48, minWidth: 0 }}>
            {CAPABILITIES.map((cap) => (
              <article key={cap.role} style={{ minWidth: 0 }}>
                <h3 className="display d-48" style={{ margin: '0 0 20px', color: INK }}>
                  {cap.role}
                </h3>
                <BulletList bullets={cap.bullets} />
              </article>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
