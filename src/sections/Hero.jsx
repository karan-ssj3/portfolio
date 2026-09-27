import { useNavigate } from 'react-router-dom'
import PillButton from '../components/PillButton'
import SignalRibbon from '../components/SignalRibbon'
import { splitWords, useReveal } from '../hooks/useReveal'

const CREAM = '#FFFFEB'
const INK = '#1A1A1A'

const LEDE = 'Pipelines, models, and AI systems: designed, built, evaluated, and shipped.'

const CONTACT_PATH = '/contact'
const PROJECTS_PATH = '/projects'

/**
 * Hero
 *
 * Cream slab carrying the ALL-ROUNDER / AI ENGINEER headline (same uppercase
 * display treatment as before, ink on cream), the lede with a word reveal, the
 * two CTAs and the signal ribbon (raw sound wave in, skills and projects out).
 * No 3D, particles or grain. Bottom padding leaves room for the Deep Layers
 * ink slab overlap.
 */
export default function Hero() {
  const navigate = useNavigate()
  useReveal()

  // Client-side navigation for plain clicks; modified clicks keep native behaviour.
  const go = (path) => (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(path)
  }

  return (
    <section
      id="hero"
      data-tone="cream"
      aria-labelledby="hero-heading"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100svh',
        backgroundColor: CREAM,
        color: INK,
        overflow: 'hidden',
        paddingBottom: '96px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <style>{`
        .hero-heading {
          font-family: system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 0.95;
          margin: 0;
          color: ${INK};
        }
        /* Each line stays whole: never break ALL-ROUNDER at its hyphen. */
        .hero-heading-line {
          display: block;
          white-space: nowrap;
        }
        .hero-lede {
          margin: 0;
          color: ${INK};
          font-family: 'Figtree', system-ui, sans-serif;
        }
        @media (max-width: 480px) {
          .hero-heading { font-size: clamp(2.25rem, 10.5vw, 3.5rem) !important; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '72rem',
          margin: '0 auto',
          padding: 'clamp(7rem, 14vh, 9rem) clamp(1.25rem, 5vw, 4rem) 0',
          boxSizing: 'border-box',
        }}
      >
        <p className="eyebrow" style={{ margin: '0 0 1.25rem', color: INK }}>
          Karan Bhutani · Portfolio
        </p>

        <h1
          id="hero-heading"
          className="hero-heading"
          style={{
            fontSize: 'clamp(3rem, 8.5vw, 6.5rem)',
            maxWidth: '100%',
          }}
        >
          <span className="hero-heading-line">ALL-ROUNDER</span>
          <span className="hero-heading-line">AI ENGINEER</span>
        </h1>

        <p className="lede hero-lede reveal" style={{ marginTop: '1.5rem', maxWidth: '44ch' }}>
          {splitWords(LEDE)}
        </p>

        <div
          style={{
            marginTop: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <PillButton href={CONTACT_PATH} variant="primary" onClick={go(CONTACT_PATH)}>
            Contact
          </PillButton>
          <PillButton href={PROJECTS_PATH} variant="outline" onClick={go(PROJECTS_PATH)}>
            Projects
          </PillButton>
        </div>
      </div>

      <div style={{ width: '100%', marginTop: 'clamp(1.5rem, 4vh, 3rem)' }}>
        <SignalRibbon />
      </div>
    </section>
  )
}
