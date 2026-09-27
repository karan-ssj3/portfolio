import { useEffect, useRef, useState } from 'react'
import Section from '../components/Section'
import PillButton from '../components/PillButton'
import WaveformPill from '../components/WaveformPill'
import useReducedMotion from '../hooks/useReducedMotion'

// Closer slab: ink, rising over the previous section. The italic phrase gets a
// lilac hand-drawn underline that draws itself once the headline is in view.
const STYLES = `
.footer-cta {
  padding: clamp(96px, 12vw, 160px) 0 clamp(72px, 8vw, 112px);
}
.footer-cta-headline {
  color: #FFFFEB;
  margin: 0 0 48px;
  max-width: 14ch;
}
.footer-cta-em {
  position: relative;
  display: inline-block;
  white-space: nowrap;
}
.footer-cta-underline {
  position: absolute;
  left: -2%;
  bottom: -0.12em;
  width: 104%;
  height: 0.22em;
  overflow: visible;
  pointer-events: none;
}
.footer-cta-underline path {
  fill: none;
  stroke: #F0D7FF;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 900ms var(--ease-out);
}
.footer-cta-underline.is-drawn path {
  stroke-dashoffset: 0;
}
.footer-cta-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.footer-cta :focus-visible {
  outline: 3px solid #F0D7FF;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .footer-cta-underline path {
    transition: none;
    stroke-dashoffset: 0;
  }
}
`

export default function FooterCTA() {
  const reduced = useReducedMotion()
  const headlineRef = useRef(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    if (reduced) {
      setDrawn(true)
      return undefined
    }
    const el = headlineRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setDrawn(true)
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const isDrawn = reduced || drawn

  return (
    <Section tone="ink" overlapTop className="footer-cta" aria-labelledby="footer-cta-heading">
      <style>{STYLES}</style>
      <div className="wrap">
        <h2 className="display d-120 footer-cta-headline" id="footer-cta-heading" ref={headlineRef}>
          Build with someone{' '}
          <em className="footer-cta-em">
            who ships.
            <svg
              className={`footer-cta-underline${isDrawn ? ' is-drawn' : ''}`}
              viewBox="0 0 300 20"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 14 Q 90 4, 170 11 Q 240 17, 296 7"
                pathLength="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </em>
        </h2>
        <div className="footer-cta-actions">
          <PillButton variant="primary" href="/contact">
            Contact
          </PillButton>
          <WaveformPill tone="cream" label="Hit Rate@K · MRR · MAPE · AUC" />
        </div>
      </div>
    </Section>
  )
}
