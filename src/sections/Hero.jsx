import { useEffect, useRef, useState } from 'react'
import CanvasWrapper from '../components/three/CanvasWrapper'
import { useScrollContext } from '../providers/ScrollProvider'

const BG = '#F5F3EE'
const INK = '#1C1B18'
const ACCENT = '#9C5636'

// Stable loader so CanvasWrapper / useLazy3D see the same reference every render.
const loadHeroScene = () => import('../components/three/HeroScene')
const HERO_CANVAS_PROPS = { camera: { position: [0, 0, 6], fov: 50 }, gl: { alpha: true } }

/**
 * Hero
 *
 * Renders Hero Option A verbatim from content-draft.md section 1 as the
 * semantic <h1>. The 3D scene is mounted only when the GPU tier is high
 * AND the user has not requested reduced motion; otherwise a static
 * gradient fallback is shown. The scene is always rendered through
 * CanvasWrapper so its R3F hooks live inside <Canvas>, and any 3D error
 * falls back to the same static gradient.
 */
export default function Hero() {
  const { reducedMotion, gpuTier } = useScrollContext()
  const sectionRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  // Defer mounting of the 3D scene until the hero is in view to keep the
  // initial paint cheap on mobile and low-end devices.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px', threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const canRender3D = gpuTier === 'high' && !reducedMotion

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-heading"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100svh',
        backgroundColor: BG,
        color: INK,
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      <style>{`
        .hero-heading {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 0.95;
          margin: 0;
          color: ${INK};
        }
        .hero-subline {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 400;
          line-height: 1.5;
          margin: 0;
          color: ${INK};
          opacity: 0.78;
        }
        .hero-eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.75rem;
          color: ${ACCENT};
        }
        .hero-cta {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 500;
          font-size: 0.95rem;
          color: ${INK};
          background: transparent;
          border: 1px solid rgba(28, 27, 24, 0.25);
          padding: 0.75rem 1.25rem;
          border-radius: 999px;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .hero-cta:hover {
          background-color: rgba(28, 27, 24, 0.04);
          border-color: rgba(28, 27, 24, 0.45);
        }
        .hero-cta:focus-visible {
          outline: 3px solid ${ACCENT};
          outline-offset: 3px;
        }
        .hero-link {
          color: ${ACCENT};
          text-decoration: none;
          border-bottom: 1px solid rgba(156, 86, 54, 0.4);
        }
        .hero-link:focus-visible {
          outline: 3px solid ${ACCENT};
          outline-offset: 3px;
          border-radius: 2px;
        }
        @media (max-width: 480px) {
          .hero-heading { font-size: clamp(2.5rem, 12vw, 3.5rem) !important; }
        }
      `}</style>

      {/* 3D scene or static fallback */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        {canRender3D && mounted ? (
          <CanvasWrapper
            scene={loadHeroScene}
            canvasProps={HERO_CANVAS_PROPS}
            fallback={<StaticGradientFallback />}
            fallbackAlt="Hero 3D scene placeholder"
          />
        ) : (
          <StaticGradientFallback />
        )}
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '72rem',
          margin: '0 auto',
          padding: 'clamp(5rem, 12vh, 9rem) clamp(1.25rem, 5vw, 4rem) clamp(3rem, 8vh, 6rem)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '100svh',
        }}
      >
        <p className="hero-eyebrow" style={{ marginBottom: '1.25rem' }}>
          Karan Bhutani · Portfolio
        </p>

        <h1
          id="hero-heading"
          className="hero-heading"
          style={{
            fontSize: 'clamp(3rem, 9vw, 6.5rem)',
            maxWidth: '18ch',
          }}
        >
          FULL STACK
          <br />
          DATA SCIENCE
        </h1>

        <p
          className="hero-subline"
          style={{
            marginTop: '1.5rem',
            fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
            maxWidth: '44ch',
          }}
        >
          Pipelines, models, and AI systems — designed, built, evaluated, and shipped.
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
          <a
            href="#work"
            className="hero-cta"
            style={{ textDecoration: 'none' }}
          >
            View selected work
          </a>
          <a
            href="#contact"
            className="hero-link"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '0.95rem',
              padding: '0.5rem 0.25rem',
            }}
          >
            Get in touch →
          </a>
        </div>
      </div>
    </section>
  )
}

/**
 * StaticGradientFallback
 *
 * A lightweight, decorative gradient shown when the 3D scene is disabled
 * (low GPU tier or reduced motion) or fails. Uses only the approved palette
 * and mirrors the visual language of the 3D scene — dark ink on warm paper,
 * with a single accent mark.
 */
function StaticGradientFallback() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: BG,
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 225"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <linearGradient id="hero-fallback-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={INK} stopOpacity="0.04" />
            <stop offset="60%" stopColor={INK} stopOpacity="0.08" />
            <stop offset="100%" stopColor={INK} stopOpacity="0.14" />
          </linearGradient>
          <radialGradient id="hero-fallback-glow" cx="0.72" cy="0.36" r="0.45">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.18" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="225" fill="url(#hero-fallback-grad)" />
        <rect width="400" height="225" fill="url(#hero-fallback-glow)" />
        {/* Sparse dot grid — same visual language as the 3D scene */}
        <g opacity="0.55">
          {Array.from({ length: 7 }).map((_, row) =>
            Array.from({ length: 12 }).map((__, col) => {
              const cx = 32 + col * ((400 - 64) / 11)
              const cy = 28 + row * ((225 - 56) / 6)
              const r = 1.2 + ((row + col) % 3) * 0.3
              return (
                <circle
                  key={`fb-${row}-${col}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={INK}
                  opacity={0.18 + ((row + col) % 4) * 0.04}
                />
              )
            }),
          )}
        </g>
        {/* Accent mark */}
        <g transform="translate(288, 81)">
          <rect
            x={-12}
            y={-12}
            width={24}
            height={24}
            fill="none"
            stroke={ACCENT}
            strokeWidth="1.6"
            strokeOpacity="0.7"
          />
          <circle cx={0} cy={0} r={4} fill={ACCENT} opacity="0.85" />
        </g>
      </svg>
    </div>
  )
}
