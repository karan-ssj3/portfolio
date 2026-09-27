import { useState, useRef, useEffect } from 'react'
import { PROJECTS } from '../data/projects'

const ACCENT = '#9C5636'
const ACCENT_SOFT = 'rgba(156, 86, 54, 0.10)'
const ACCENT_BORDER = 'rgba(156, 86, 54, 0.22)'

function PatternSVG({ type }) {
  const c = ACCENT
  const patterns = {
    circles: (
      <svg viewBox="0 0 400 160" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        <circle cx="320" cy="80" r="90" fill="none" stroke={c} strokeWidth="1" opacity=".18" />
        <circle cx="320" cy="80" r="60" fill="none" stroke={c} strokeWidth="1" opacity=".24" />
        <circle cx="320" cy="80" r="30" fill="none" stroke={c} strokeWidth="1.5" opacity=".34" />
        <circle cx="320" cy="80" r="4" fill={c} opacity=".55" />
        <circle cx="80" cy="120" r="50" fill="none" stroke={c} strokeWidth=".5" opacity=".12" />
        <line x1="80" y1="120" x2="320" y2="80" stroke={c} strokeWidth=".5" opacity=".1" strokeDasharray="4 6" />
      </svg>
    ),
    diagonal: (
      <svg viewBox="0 0 400 160" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={i * 40 - 40} y1="180" x2={i * 40 + 120} y2="-20" stroke={c} strokeWidth=".8" opacity={.05 + (i % 3) * .03} />
        ))}
        <rect x="300" y="40" width="60" height="60" rx="4" fill="none" stroke={c} strokeWidth="1.2" opacity=".24" transform="rotate(15 330 70)" />
      </svg>
    ),
    grid: (
      <svg viewBox="0 0 400 160" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 24 + 10} x2="400" y2={i * 24 + 10} stroke={c} strokeWidth=".5" opacity=".08" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 28 + 10} y1="0" x2={i * 28 + 10} y2="160" stroke={c} strokeWidth=".5" opacity=".08" />
        ))}
        <rect x="260" y="34" width="96" height="72" rx="6" fill={c} opacity=".08" />
        <circle cx="308" cy="70" r="18" fill="none" stroke={c} strokeWidth="1" opacity=".24" />
      </svg>
    ),
    waves: (
      <svg viewBox="0 0 400 160" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        {[40, 70, 100, 130].map((y, i) => (
          <path key={i} d={`M0 ${y} Q100 ${y - 20 + i * 5} 200 ${y} T400 ${y}`} fill="none" stroke={c} strokeWidth=".8" opacity={.08 + i * .03} />
        ))}
        <circle cx="340" cy="60" r="24" fill="none" stroke={c} strokeWidth="1.2" opacity=".18" />
      </svg>
    ),
    dots: (
      <svg viewBox="0 0 400 160" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        {Array.from({ length: 120 }).map((_, i) => {
          const x = (i % 15) * 28 + 10
          const y = Math.floor(i / 15) * 22 + 10
          const dist = Math.sqrt((x - 320) ** 2 + (y - 80) ** 2)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={dist < 60 ? 2.5 : dist < 100 ? 1.5 : 1}
              fill={c}
              opacity={dist < 60 ? .28 : dist < 100 ? .14 : .06}
            />
          )
        })}
      </svg>
    ),
    mesh: (
      <svg viewBox="0 0 400 160" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        <polygon points="310,30 360,80 310,130 260,80" fill="none" stroke={c} strokeWidth="1" opacity=".14" />
        <polygon points="310,50 340,80 310,110 280,80" fill="none" stroke={c} strokeWidth=".8" opacity=".2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={50 + i * 30} y1={20 + i * 25} x2={150 + i * 20} y2={80 + i * 15} stroke={c} strokeWidth=".6" opacity=".08" />
        ))}
      </svg>
    ),
  }
  return patterns[type] || patterns.circles
}

const PATTERNS = ['circles', 'diagonal', 'grid', 'waves', 'dots', 'mesh']

const FILTERS = [
  { key: 'All',    label: 'All',     test: () => true },
  { key: 'Agents', label: 'Agents',  test: (p) => /agent|trading|classif/i.test(p.title) },
  { key: 'RAG',    label: 'RAG',     test: (p) => /rag|tax|financial/i.test(p.title) },
  { key: 'ML',     label: 'ML',      test: (p) => /ml|time.series|classif/i.test(p.title) },
]

function ProjectCard({ project, index, pattern }) {
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
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <article
      ref={ref}
      className={`proj-card${visible && !immediate ? ' proj-visible' : ''}`}
      style={immediate ? { opacity: 1, transform: 'none', transition: 'none' } : undefined}
    >
      <div className="proj-header">
        <PatternSVG type={pattern} />
        <span className="proj-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="proj-body">
        <h3 className="proj-title">{project.title}</h3>
        {project.subtitle && <p className="proj-subtitle">{project.subtitle}</p>}
        <p className="proj-desc">{project.description}</p>
        <ul className="proj-tech" aria-label="Tech stack">
          {project.techStack.map((t) => (
            <li key={t} className="proj-tech-badge">{t}</li>
          ))}
        </ul>
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer" className="proj-link">
            View on GitHub <span className="proj-link-arrow" aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  )
}

export default function Projects() {
  const [filter, setFilter] = useState('All')
  const active = FILTERS.find((f) => f.key === filter) || FILTERS[0]
  const filtered = PROJECTS.filter(active.test)

  return (
    <>
      <main className="page-main">
        <header className="page-hero">
          <p className="page-label">// Portfolio</p>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">AI systems, RAG pipelines, and data engineering at scale</p>

          <div className="filter-pills" role="group" aria-label="Filter projects" style={{ marginTop: '2rem' }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`filter-pill${filter === f.key ? ' filter-active' : ''}`}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        <section className="proj-grid" aria-label="Project list">
          {filtered.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              pattern={PATTERNS[(p.id - 1) % PATTERNS.length]}
            />
          ))}
        </section>
      </main>
    </>
  )
}
