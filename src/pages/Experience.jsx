import { useState, useRef, useEffect } from 'react'
import { EXPERIENCE } from '../data/experience'

const ACCENT_MAP = {
  accent: { color: 'var(--accent)',  light: 'var(--accent-light)',  border: 'rgba(79,70,229,.2)',  css: 'var(--accent)' },
  purple: { color: 'var(--purple)',  light: 'var(--purple-light)',  border: 'rgba(139,92,246,.2)', css: 'var(--purple)' },
  teal:   { color: 'var(--teal)',    light: 'var(--teal-light)',    border: 'rgba(13,148,136,.2)', css: 'var(--teal)' },
}

const CERTS = [
  { name: 'Anthropic MCP — Intro & Advanced',  year: '2025', accent: 'accent' },
  { name: 'CrewAI Multi-Agent Systems',         year: '2025', accent: 'purple' },
  { name: 'AWS ML Engineer',                    year: '2025', accent: 'teal' },
  { name: 'Databricks Data Engineer Associate', year: 'In Progress', accent: 'accent' },
  { name: 'DeepLearning.AI: Evaluating GenAI',  year: '2024', accent: 'purple' },
  { name: 'Google: Power of Statistics',        year: '2024', accent: 'teal' },
]

function TimelineCard({ exp, index, isLast }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const colors = ACCENT_MAP[exp.accent]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`tl-item${visible ? ' tl-visible' : ''}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="tl-spine">
        <div
          className="tl-node"
          style={{ background: colors.css, boxShadow: `0 0 0 4px ${colors.light}` }}
        >
          {exp.current && <div className="tl-pulse" style={{ borderColor: colors.css }} />}
        </div>
        {!isLast && <div className="tl-line" />}
      </div>

      <div
        className="tl-card"
        style={{
          '--tl-accent': colors.css,
          '--tl-light':  colors.light,
          '--tl-border': colors.border,
        }}
      >
        <div className="tl-card-header">
          <div>
            <h3 className="tl-title">{exp.title}</h3>
            <div className="tl-company">{exp.company}</div>
          </div>
          <div className="tl-card-header-right">
            <span
              className="tl-date-badge"
              style={{ color: colors.css, background: colors.light, borderColor: colors.css }}
            >
              {exp.startDate} – {exp.endDate}
            </span>
            <span className="tl-location">{exp.location}</span>
          </div>
        </div>

        <div className="tl-divider" style={{ background: `linear-gradient(90deg, ${colors.border}, transparent)` }} />

        <ul className="tl-desc-list">
          {exp.description.map((item, i) => (
            <li key={i} className="tl-desc-item">
              <span className="tl-desc-dot" style={{ background: colors.css }} />
              {item}
            </li>
          ))}
        </ul>

        <div className="tl-tech-row">
          <span className="tl-tech-label">// Tech Stack</span>
          <div className="tl-tech-badges">
            {exp.techStack.map(t => (
              <span
                key={t}
                className="tl-tech-badge"
                style={{ color: colors.css, background: colors.light, borderColor: colors.border }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CertCard({ cert, index }) {
  const colors = ACCENT_MAP[cert.accent]
  return (
    <div
      className="cert-card"
      style={{
        '--cert-accent': colors.css,
        '--cert-light':  colors.light,
        '--cert-border': colors.border,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="cert-dot" style={{ background: colors.css }} />
      <div>
        <div className="cert-name">{cert.name}</div>
        <div className="cert-year">{cert.year}</div>
      </div>
    </div>
  )
}

export default function Experience() {
  return (
    <>
      <div className="page-hero">
        <div className="page-label">// Career Journey</div>
        <h1 className="page-title">Experience</h1>
        <p className="page-subtitle">Building AI-powered solutions for enterprise clients across Australia</p>
      </div>

      <section className="timeline-section">
        {EXPERIENCE.map((exp, i) => (
          <TimelineCard
            key={exp.id}
            exp={exp}
            index={i}
            isLast={i === EXPERIENCE.length - 1}
          />
        ))}
      </section>

      <div className="section-divider" style={{ maxWidth: 860, margin: '0 auto 48px', padding: '0 24px' }}>
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
      </div>

      <section className="cert-section">
        <div className="cert-header">
          <div className="page-label" style={{ marginBottom: 12 }}>// Credentials</div>
          <h2 className="cert-heading">Certifications</h2>
        </div>
        <div className="cert-grid">
          {CERTS.map((cert, i) => <CertCard key={cert.name} cert={cert} index={i} />)}
        </div>
      </section>
    </>
  )
}
