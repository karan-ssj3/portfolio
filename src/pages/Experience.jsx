import { useReveal } from '../hooks/useReveal'
import { EXPERIENCE } from '../data/experience'

function ExpCard({ exp, delay }) {
  const badgeClass = 'badge badge-p'
  return (
    <div className={`exp-card reveal reveal-d${delay}`}>
      <div className="exp-header">
        <div>
          <p className="exp-title">{exp.title}</p>
          <p className="exp-company">{exp.company}</p>
        </div>
        <div className="exp-meta">
          <span className="exp-date">{exp.startDate} — {exp.endDate}</span>
          <p className="exp-location">{exp.location}</p>
        </div>
      </div>
      <div className="exp-divider" />
      <ul className="exp-bullets">
        {exp.description.map((d, i) => (
          <li key={i}>
            <span className="bullet-arrow">▸</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
      <p className="exp-stack-label">// tech stack</p>
      <div className="exp-stack">
        {exp.techStack.map(t => <span key={t} className={badgeClass}>{t}</span>)}
      </div>
    </div>
  )
}

export default function Experience() {
  useReveal()
  return (
    <div className="page-bg">
      <div className="page-hero">
        <span className="section-label reveal">// Career Journey</span>
        <h1 className="section-title gradient-text reveal reveal-d1">Professional Experience</h1>
        <p className="reveal reveal-d2" style={{ color: 'var(--text-dim)', marginTop: '.5rem' }}>
          Building AI-powered solutions for enterprise clients across Australia
        </p>
      </div>
      <div className="section" style={{ paddingTop: 0, maxWidth: 900 }}>
        <div className="exp-list">
          {EXPERIENCE.map((exp, i) => (
            <ExpCard key={exp.id} exp={exp} delay={i + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
