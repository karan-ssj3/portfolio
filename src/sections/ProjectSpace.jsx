import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import ProjectNodes from '../components/three/ProjectNodes'
import { PROJECTS } from '../data/projects'
import useGPU from '../hooks/useGPU'
import useReducedMotion from '../hooks/useReducedMotion'

const BG = '#F5F3EE'
const INK = '#1C1B18'
const ACCENT = '#9C5636'

const DISPLAY_FONT = "'Space Grotesk', 'Space Grotesk Fallback', sans-serif"
const BODY_FONT = "'Inter', 'Inter Fallback', sans-serif"

/**
 * ProjectSpace
 *
 * Scroll-driven 3D scatter of project nodes. The section is tall (one
 * viewport per project, roughly) with a sticky canvas; scroll progress flies
 * the camera along a path through the constellation. On low-GPU devices or
 * when the user prefers reduced motion, a static grid list of the same
 * PROJECTS data is rendered instead.
 */
export default function ProjectSpace() {
  const gpuTier = useGPU()
  const reducedMotion = useReducedMotion()

  const sectionRef = useRef(null)
  const progressRef = useRef(0)
  const [ready, setReady] = useState(false)

  const isLowGPU = gpuTier === 'low'
  const use3D = !reducedMotion && !isLowGPU

  useEffect(() => {
    if (!use3D) return undefined

    const update = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) return
      const p = -rect.top / scrollable
      progressRef.current = Math.min(1, Math.max(0, p))
    }

    update()
    setReady(true)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [use3D])

  if (!use3D) {
    return (
      <section
        id="projects"
        aria-label="Projects"
        style={{
          backgroundColor: BG,
          color: INK,
          fontFamily: BODY_FONT,
          padding: 'clamp(3rem, 8vw, 6rem) clamp(1.25rem, 5vw, 4rem)',
        }}
      >
        <h2
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Project Space
        </h2>
        <p
          style={{
            margin: '0 0 2.5rem',
            maxWidth: '38rem',
            color: INK,
            opacity: 0.75,
            fontSize: '1rem',
            lineHeight: 1.6,
          }}
        >
          A constellation of selected work — engineering, data science, and
          applied AI systems.
        </p>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(20rem, 100%), 1fr))',
            gap: '1.25rem',
          }}
        >
          {PROJECTS.map((project) => (
            <li key={project.id}>
              <article
                style={{
                  border: `1px solid ${INK}22`,
                  padding: '1.25rem 1.25rem 1.5rem',
                  backgroundColor: BG,
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <p
                  style={{
                    margin: '0 0 0.5rem',
                    fontFamily: DISPLAY_FONT,
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: ACCENT,
                  }}
                >
                  {String(project.id).padStart(2, '0')}
                </p>
                <h3
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontSize: '1.15rem',
                    margin: '0 0 0.35rem',
                    lineHeight: 1.3,
                  }}
                >
                  {project.title}
                </h3>
                <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', opacity: 0.75 }}>
                  {project.subtitle}
                </p>
                <ul
                  aria-label="Tech stack"
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                  }}
                >
                  {project.techStack.map((tech) => (
                    <li
                      key={tech}
                      style={{
                        fontSize: '0.7rem',
                        border: `1px solid ${INK}22`,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                      }}
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const dpr = gpuTier === 'high' ? [1, 2] : [1, 1.5]

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-label="Projects"
      style={{
        backgroundColor: BG,
        position: 'relative',
        height: `${Math.max(PROJECTS.length, 4) * 60}vh`,
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {ready && (
          <Canvas
            dpr={dpr}
            style={{ width: '100%', height: '100%' }}
            camera={{ position: [0, 0, 14], fov: 50 }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl }) => {
              gl.setClearColor(BG)
            }}
          >
            <Suspense fallback={null}>
              <ProjectNodes projects={PROJECTS} progressRef={progressRef} />
            </Suspense>
          </Canvas>
        )}
        <header
          style={{
            position: 'absolute',
            top: 'clamp(1.5rem, 5vh, 3rem)',
            left: 'clamp(1.25rem, 5vw, 4rem)',
            pointerEvents: 'none',
            color: INK,
          }}
        >
          <h2
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Project Space
          </h2>
          <p
            style={{
              fontFamily: BODY_FONT,
              margin: '0.35rem 0 0',
              fontSize: '0.9rem',
              opacity: 0.75,
              maxWidth: '26rem',
            }}
          >
            Scroll to fly through the constellation. Hover a node for details.
          </p>
        </header>
      </div>
    </section>
  )
}
