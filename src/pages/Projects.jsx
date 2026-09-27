import { useState, useRef, useEffect } from 'react'
import { PROJECTS } from '../data/projects'

const ACCENT_MAP = {
  c: { color: 'var(--accent)',  light: 'var(--accent-light)',  border: 'rgba(79,70,229,.2)',  css: 'var(--accent)' },
  p: { color: 'var(--purple)',  light: 'var(--purple-light)',  border: 'rgba(139,92,246,.2)', css: 'var(--purple)' },
  m: { color: 'var(--teal)',    light: 'var(--teal-light)',    border: 'rgba(13,148,136,.2)', css: 'var(--teal)' },
}

function PatternSVG({ type, colors }) {
  const c = colors.css
  const patterns = {
    circles: (
      <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
        <circle cx="320" cy="80" r="90" fill="none" stroke={c} strokeWidth="1" opacity=".15" />
        <circle cx="320" cy="80" r="60" fill="none" stroke={c} strokeWidth="1" opacity=".2" />
        <circle cx="320" cy="80" r="30" fill="none" stroke={c} strokeWidth="1.5" opacity=".3" />
        <circle cx="320" cy="80" r="4" fill={c} opacity=".5" />
        <circle cx="80" cy="120" r="50" fill="none" stroke={c} strokeWidth=".5" opacity=".1" />
        <line x1="80" y1="120" x2="320" y2="80" stroke={c} strokeWidth=".5" opacity=".08" strokeDasharray="4 6" />
      </svg>
    ),
    diagonal: (
      <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={i*40-40} y1="180" x2={i*40+120} y2="-20" stroke={c} strokeWidth=".8" opacity={.04+(i%3)*.03} />
        ))}
        <rect x="300" y="40" width="60" height="60" rx="4" fill="none" stroke={c} strokeWidth="1.2" opacity=".2" transform="rotate(15 330 70)" />
      </svg>
    ),
    grid: (
      <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
        {Array.from({ length: 8  }).map((_, i) => <line key={`h${i}`} x1="0"   y1={i*24+10}  x2="400" y2={i*24+10}  stroke={c} strokeWidth=".5" opacity=".06" />)}
        {Array.from({ length: 16 }).map((_, i) => <line key={`v${i}`} x1={i*28+10} y1="0" x2={i*28+10} y2="160" stroke={c} strokeWidth=".5" opacity=".06" />)}
        <rect x="260" y="34" width="96" height="72" rx="6" fill={c} opacity=".06" />
        <circle cx="308" cy="70" r="18" fill="none" stroke={c} strokeWidth="1" opacity=".2" />
      </svg>
    ),
    waves: (
      <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
        {[40,70,100,130].map((y, i) => (
          <path key={i} d={`M0 ${y} Q100 ${y-20+i*5} 200 ${y} T400 ${y}`} fill="none" stroke={c} strokeWidth=".8" opacity={.06+i*.03} />
        ))}
        <circle cx="340" cy="60" r="24" fill="none" stroke={c} strokeWidth="1.2" opacity=".15" />
      </svg>
    ),
    dots: (
      <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
        {Array.from({ length: 120 }).map((_, i) => {
          const x = (i%15)*28+10, y = Math.floor(i/15)*22+10
          const dist = Math.sqrt((x-320)**2+(y-80)**2)
          return <circle key={i} cx={x} cy={y} r={dist<60?2.5:dist<100?1.5:1} fill={c} opacity={dist<60?.25:dist<100?.12:.05} />
        })}
      </svg>
    ),
    mesh: (
      <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
        <polygon points="310,30 360,80 310,130 260,80" fill="none" stroke={c} strokeWidth="1" opacity=".12" />
        <polygon points="310,50 340,80 310,110 280,80" fill="none" stroke={c} strokeWidth=".8" opacity=".18" />
        {[0,1,2,3,4].map(i => (
          <line key={i} x1={50+i*30} y1={20+i*25} x2={150+i*20} y2={80+i*15} stroke={c} strokeWidth=".6" opacity=".07" />
        ))}
      </svg>
    ),
  }
  return patterns[type] || patterns.circles
}

const PATTERNS = ['circles','diagonal','grid','waves','dots','mesh']

const FILTER_MAP = {
  All:    () => true,
  Agents: p => /agent|trading|classif/i.test(p.title),
  RAG:    p => /rag|tax|financial/i.test(p.title),
  ML:     p => /ml|time.series|classif/i.test(p.title),
}

function ProjectCard({ p, index, pattern }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const colors = ACCENT_MAP[p.accent]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`proj-card${visible ? ' proj-visible' : ''}`}
      style={{
        animationDelay: `${(index % 2) * 100}ms`,
        '--proj-accent': colors.css,
        '--proj-light':  colors.light,
        '--proj-border': colors.border,
      }}
    >
      <div className="proj-header">
        <PatternSVG type={pattern} colors={colors} />
        <div className="proj-number">{String(index + 1).padStart(2, '0')}</div>
      </div>

      <div className="proj-body">
        <h3 className="proj-title">{p.title}</h3>
        {p.subtitle && <p className="proj-subtitle">{p.subtitle}</p>}
        <p className="proj-desc">{p.description}</p>
        <div className="proj-tech">
          {p.techStack.map(t => <span key={t} className="proj-tech-badge">{t}</span>)}
        </div>
        {p.github && (
          <a href={p.github} target="_blank" rel="noreferrer" className="proj-link">
            View on GitHub <span className="proj-link-arrow">→</span>
          </a>
        )}
      </div>
    </div>
  )
}

export default function Projects() {
  const [filter, setFilter] = useState('All')
  const filtered = PROJECTS.filter(FILTER_MAP[filter] || FILTER_MAP.All)

  return (
    <>
      <div className="page-hero">
        <div className="page-label">// Portfolio</div>
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">AI systems, RAG pipelines, and data engineering at scale</p>

        <div className="filter-pills" style={{ marginTop: '2rem' }}>
          {Object.keys(FILTER_MAP).map(f => (
            <button
              key={f}
              className={`filter-pill${filter === f ? ' filter-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="proj-grid">
        {filtered.map((p, i) => (
          <ProjectCard
            key={p.id}
            p={p}
            index={i}
            pattern={PATTERNS[p.id - 1] || 'circles'}
          />
        ))}
      </div>
    </>
  )
}
