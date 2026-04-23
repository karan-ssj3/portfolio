import { useReveal } from '../hooks/useReveal'
import { PROJECTS } from '../data/projects'

const BADGE = { c: 'badge badge-c', p: 'badge badge-p', m: 'badge badge-m' }
const BTN   = { c: 'btn btn-cyan',  p: 'btn btn-purple', m: 'btn btn-magenta' }

function ProjectCard({ p, delay }) {
  return (
    <div className={`project-card reveal reveal-d${delay}`}>
      <div className="project-banner">
        <span className="project-banner-text">{p.title.slice(0, 2).toUpperCase()}</span>
      </div>
      <div className="project-body">
        <h3 className="project-title">{p.title}</h3>
        <p className="project-desc">{p.description}</p>
        <div className="project-stack">
          {p.techStack.map(t => <span key={t} className={BADGE[p.accent]}>{t}</span>)}
        </div>
        <div className="project-links">
          {p.github && (
            <a href={p.github} target="_blank" rel="noreferrer" className={BTN[p.accent]} style={{ padding: '.55rem 1.3rem', fontSize: '.75rem' }}>
              GitHub ↗
            </a>
          )}
          {p.demo && (
            <a href={p.demo} target="_blank" rel="noreferrer" className="btn btn-cyan" style={{ padding: '.55rem 1.3rem', fontSize: '.75rem' }}>
              Live Demo ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  useReveal()
  return (
    <div className="page-bg">
      <div className="page-hero">
        <span className="section-label reveal">// Portfolio</span>
        <h1 className="section-title gradient-text reveal reveal-d1">Projects</h1>
        <p className="reveal reveal-d2" style={{ color: 'var(--text-dim)', marginTop: '.5rem' }}>
          AI systems, RAG pipelines, and data engineering at scale
        </p>
      </div>
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} p={p} delay={(i % 3) + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
