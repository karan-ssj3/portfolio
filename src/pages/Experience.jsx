import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { EXPERIENCE } from '../data/experience'

const ACCENT = '#9C5636'
const ACCENT_SOFT = 'rgba(156, 86, 54, 0.10)'
const ACCENT_BORDER = 'rgba(156, 86, 54, 0.22)'

function TimelineCard({ exp, index, isLast }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [immediate, setImmediate] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setImmediate(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <li
      ref={ref}
      className={`tl-item${visible && !immediate ? ' tl-visible' : ''}`}
      style={immediate ? { opacity: 1, transform: 'none', transition: 'none' } : undefined}
    >
      <div className="tl-spine" aria-hidden="true">
        <div className="tl-node">
          {exp.current && <span className="tl-pulse" />}
        </div>
        {!isLast && <div className="tl-line" />}
      </div>

      <article className="tl-card">
        <header className="tl-card-header">
          <div>
            <h3 className="tl-title">{exp.title}</h3>
            <p className="tl-company">{exp.company}</p>
          </div>
          <div className="tl-card-header-right">
            <span className="tl-date-badge">
              {exp.startDate} – {exp.endDate}
            </span>
            <span className="tl-location">{exp.location}</span>
          </div>
        </header>

        <div className="tl-divider" aria-hidden="true" />

        <ul className="tl-desc-list">
          {exp.description.map((item, i) => (
            <li key={i} className="tl-desc-item">
              <span className="tl-desc-dot" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="tl-tech-row">
          <span className="tl-tech-label">// Tech Stack</span>
          <ul className="tl-tech-badges" aria-label="Tech stack">
            {exp.techStack.map((t) => (
              <li key={t} className="tl-tech-badge">{t}</li>
            ))}
          </ul>
        </div>
      </article>
    </li>
  )
}

export default function Experience() {
  return (
    <>
      <Navbar />

      <main className="page-main">
        <header className="page-hero">
          <p className="page-label">// Career Journey</p>
          <h1 className="page-title">Experience</h1>
          <p className="page-subtitle">Building AI-powered solutions for enterprise clients across Australia</p>
        </header>

        <section className="timeline-section" aria-label="Career timeline">
          <ol className="timeline-list">
            {EXPERIENCE.map((exp, i) => (
              <TimelineCard
                key={exp.id}
                exp={exp}
                index={i}
                isLast={i === EXPERIENCE.length - 1}
              />
            ))}
          </ol>
        </section>
      </main>

      <Footer />
    </>
  )
}
