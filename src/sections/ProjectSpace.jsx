import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Section from '../components/Section'
import PillButton from '../components/PillButton'
import { PROJECTS } from '../data/projects'
import useReducedMotion from '../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const CREAM = '#FFFFEB'
const INK = '#1A1A1A'
const CORAL = '#FF6C4C'
const EM_DASH = '\u2014'

// Only these figures may appear in the section. Sentences pulled from the
// data are rejected if they carry any other number.
const ALLOWED_FIGURES = ['3 days', '30 minutes', '30 min', '40%', '3.2M+']

const BEATS = [
  {
    id: 'job-card',
    keyword: 'maintenance',
    label: 'GenAI maintenance agent: Job Card planning',
    manual: '3 days',
    automated: '30 min',
    prefer: '3 days',
  },
  {
    id: 'contract-review',
    keyword: 'contract',
    label: 'Multimodal contract compliance: review time',
    manual: '100%',
    automated: '\u221240%',
    prefer: '40%',
  },
  {
    id: 'recommendations',
    keyword: 'recommendation',
    label: 'Recommendation engine: profiles served weekly on Kubeflow',
    manual: null,
    automated: '3.2M+',
    prefer: '3.2M+',
  },
]

// True only for strings with visible text; guards every rendered text node.
function isFilled(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function findProject(keyword) {
  const k = keyword.toLowerCase()
  return (
    PROJECTS.find((p) => String(p.title || '').toLowerCase().includes(k)) ||
    PROJECTS.find((p) => String(p.description || '').toLowerCase().includes(k)) ||
    null
  )
}

function isSafe(text) {
  if (!isFilled(text) || text.includes(EM_DASH)) return false
  let stripped = text
  ALLOWED_FIGURES.forEach((f) => {
    stripped = stripped.split(f).join('')
  })
  return !/\d/.test(stripped)
}

// Pick one sentence, verbatim, from the project description. Prefer the one
// carrying the beat's own figure; otherwise the first sentence that passes
// the text rules.
function pickSentence(description, prefer) {
  if (!isFilled(description)) return null
  const sentences = description
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
  const preferred = sentences.find((s) => s.includes(prefer) && isSafe(s))
  if (preferred) return preferred
  return sentences.find(isSafe) || null
}

function resolveBeats() {
  return BEATS.map((beat) => {
    const project = findProject(beat.keyword)
    if (!project) return { ...beat, title: null, sentence: null }
    const title = isSafe(project.title) ? project.title : null
    const sentence = pickSentence(project.description, beat.prefer)
    return { ...beat, title, sentence }
  })
}

function useIsNarrow() {
  const query = '(max-width: 719px)'
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setNarrow(e.matches)
    mq.addEventListener('change', onChange)
    setNarrow(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return narrow
}

const cardBase = {
  boxSizing: 'border-box',
  height: '100%',
  borderRadius: 'var(--radius-card)',
  padding: 'clamp(20px, 3vw, 32px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '16px',
  overflow: 'hidden',
}

function ManualCard({ value }) {
  return (
    <div
      style={{
        ...cardBase,
        background: 'transparent',
        color: CREAM,
        border: '1px solid rgba(255,255,235,.3)',
        borderLeft: `4px solid ${CORAL}`,
      }}
    >
      <span className="eyebrow">MANUAL</span>
      <span className="display d-75 tnum" style={{ whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  )
}

function AutomatedCard({ value }) {
  return (
    <div style={{ ...cardBase, background: CREAM, color: INK }}>
      <span className="eyebrow">AUTOMATED</span>
      <span className="display d-75 tnum" style={{ whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  )
}

function BeatCaption({ beat }) {
  const hasTitle = isFilled(beat.title)
  const hasSentence = isFilled(beat.sentence)
  if (!hasTitle && !hasSentence) return null
  return (
    <div style={{ maxWidth: '60rem' }}>
      {hasTitle ? (
        <h3 className="display d-32" style={{ margin: '0 0 8px' }}>
          {beat.title}
        </h3>
      ) : null}
      {hasSentence ? (
        <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.5, opacity: 0.8 }}>
          {beat.sentence}
        </p>
      ) : null}
    </div>
  )
}

function BeatLabel({ label, style }) {
  if (!isFilled(label)) return null
  return (
    <p className="eyebrow" style={style}>
      {label}
    </p>
  )
}

/**
 * ProjectSpace
 *
 * Teal pinned proof slab. A sticky stage inside a 300vh wrapper; one scrubbed
 * ScrollTrigger timeline morphs the Manual card into the Automated card for
 * each of three real results, then crossfades to the next. Reduced motion and
 * narrow screens get the same beats as stacked card pairs with no pin.
 */
export default function ProjectSpace() {
  const reducedMotion = useReducedMotion()
  const narrow = useIsNarrow()
  const pinned = !reducedMotion && !narrow

  const beats = useMemo(resolveBeats, [])

  const wrapperRef = useRef(null)
  const beatRefs = useRef([])
  const manualRefs = useRef([])
  const autoRefs = useRef([])

  useEffect(() => {
    if (!pinned || !wrapperRef.current) return undefined

    const ctx = gsap.context(() => {
      beatRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 })
      })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })

      beats.forEach((beat, i) => {
        const manual = manualRefs.current[i]
        const auto = autoRefs.current[i]
        if (manual) {
          tl.to(manual, { width: '0%', paddingRight: 0, opacity: 0, duration: 0.7 }, i)
        }
        if (auto) tl.to(auto, { width: '100%', duration: 0.7 }, i)

        const current = beatRefs.current[i]
        const next = beatRefs.current[i + 1]
        if (next && current) {
          tl.to(current, { autoAlpha: 0, duration: 0.3 }, i + 0.7)
          tl.to(next, { autoAlpha: 1, duration: 0.3 }, i + 0.7)
        } else {
          // Hold the final state so each beat owns an equal third.
          tl.to({}, { duration: 0.3 }, i + 0.7)
        }
      })
    }, wrapperRef)

    return () => ctx.revert()
  }, [pinned, beats])

  const headline = (
    <h2 className="display d-96" style={{ margin: 0, color: CREAM }}>
      Manual process, <em>automated.</em>
    </h2>
  )

  const cta = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '48px 0 clamp(72px, 10vw, 120px)',
      }}
    >
      <PillButton variant="primary" href="/projects">
        All projects
      </PillButton>
    </div>
  )

  if (!pinned) {
    return (
      <Section tone="teal" overlapTop roundedBottom id="projects" aria-label="Projects">
        <div
          className="wrap"
          style={{ paddingTop: 'clamp(96px, 12vw, 140px)', overflowX: 'hidden' }}
        >
          {headline}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', marginTop: '48px' }}>
            {beats.map((beat) => (
              <article key={beat.id}>
                <BeatLabel label={beat.label} style={{ margin: '0 0 16px' }} />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  {beat.manual ? <ManualCard value={beat.manual} /> : null}
                  <AutomatedCard value={beat.automated} />
                </div>
                <BeatCaption beat={beat} />
              </article>
            ))}
          </div>
          {cta}
        </div>
      </Section>
    )
  }

  return (
    <Section tone="teal" overlapTop roundedBottom id="projects" aria-label="Projects">
      <div ref={wrapperRef} style={{ position: 'relative', height: '300vh' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100svh',
            overflow: 'hidden',
          }}
        >
          <div
            className="wrap"
            style={{
              height: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(20px, 4vh, 40px)',
              paddingTop: 'clamp(96px, 13vh, 140px)',
              paddingBottom: 'clamp(24px, 5vh, 48px)',
              margin: '0 auto',
            }}
          >
            {headline}
            <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
              {beats.map((beat, i) => (
                <article
                  key={beat.id}
                  ref={(el) => {
                    beatRefs.current[i] = el
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    opacity: i === 0 ? 1 : 0,
                    visibility: i === 0 ? 'visible' : 'hidden',
                  }}
                >
                  <BeatLabel label={beat.label} style={{ margin: 0 }} />
                  <div
                    style={{
                      display: 'flex',
                      height: 'clamp(180px, 34vh, 320px)',
                      width: '100%',
                    }}
                  >
                    {beat.manual ? (
                      <div
                        ref={(el) => {
                          manualRefs.current[i] = el
                        }}
                        style={{
                          width: '50%',
                          paddingRight: '12px',
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <ManualCard value={beat.manual} />
                      </div>
                    ) : null}
                    <div
                      ref={(el) => {
                        autoRefs.current[i] = el
                      }}
                      style={{
                        width: '50%',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <AutomatedCard value={beat.automated} />
                    </div>
                  </div>
                  <BeatCaption beat={beat} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="wrap">{cta}</div>
    </Section>
  )
}
