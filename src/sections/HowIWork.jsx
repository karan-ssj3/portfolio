import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollContext } from '../providers/ScrollProvider'
import CanvasWrapper from '../components/three/CanvasWrapper'
import GlobeScene from '../components/three/GlobeScene'
import StatusChips from '../components/StatusChips'

const STEPS = [
  {
    number: '01',
    title: 'Understand first.',
    description:
      'Start with the bottleneck, not the model: what the manual process costs, and what measurable outcome counts as done.',
  },
  {
    number: '02',
    title: 'Design the spine.',
    description:
      'Architecture before code — data layers, routing, schemas, and evaluation designed up front so the system stays deterministic where it matters.',
  },
  {
    number: '03',
    title: 'Build and evaluate.',
    description:
      'Models and agents are built against a defined eval suite — Hit Rate@K, MAPE, AUC, LLM-as-a-Judge — so quality is measured, never assumed.',
  },
  {
    number: '04',
    title: 'Ship and measure.',
    description:
      'Systems land in client interfaces and scheduled pipelines, then impact is tracked against the baseline — review time, cycle time, cost.',
  },
]

export default function HowIWork() {
  const { reducedMotion } = useScrollContext()
  const sectionRef = useRef(null)
  const chipRefs = useRef([])
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsDesktop(window.innerWidth >= 768 && !reducedMotion)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [reducedMotion])

  useLayoutEffect(() => {
    if (!isDesktop || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const chips = chipRefs.current.filter(Boolean)
      if (chips.length === 0) return

      // Keep the final chip visible when the pin releases; only the
      // earlier chips stagger out so the section never ends empty.
      const outChips = chips.slice(0, -1)

      // Window is the default scroller; Lenis drives native window
      // scrolling and forwards its scroll events to ScrollTrigger.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=200%',
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(
        chips,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.5,
          ease: 'power2.out',
        },
        0,
      )

      tl.to(
        outChips,
        {
          opacity: 0,
          y: -20,
          stagger: 0.2,
          duration: 0.5,
          ease: 'power2.in',
        },
        '>0.5',
      )
    }, sectionRef)

    return () => {
      ctx.revert()
      // Reverting removes the pin spacer; refresh so the document
      // height and trigger positions stay consistent (no scroll jump).
      ScrollTrigger.refresh()
    }
  }, [isDesktop])

  return (
    <section
      ref={sectionRef}
      id="how-i-work"
      style={{
        backgroundColor: '#F5F3EE',
        color: '#1C1B18',
        padding: '4rem 1.5rem',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        #how-i-work:focus-visible {
          outline: 3px solid #9C5636;
          outline-offset: 4px;
        }
      `}</style>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          gap: '3rem',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '2rem',
              color: '#1C1B18',
            }}
          >
            How I work
          </h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {STEPS.map((step) => (
              <li
                key={step.number}
                style={{
                  marginBottom: '2.5rem',
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#9C5636',
                    lineHeight: 1.4,
                    minWidth: '2.5rem',
                  }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      margin: '0 0 0.5rem',
                      color: '#1C1B18',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      opacity: 0.85,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%', height: '300px', position: 'relative' }}>
            <CanvasWrapper
              scene={GlobeScene}
              fallbackAlt="Abstract network globe"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <StatusChips chipRefs={chipRefs} />
        </div>
      </div>
    </section>
  )
}
