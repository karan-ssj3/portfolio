import { PROJECTS } from '../data/projects'
import Section from '../components/Section'
import PillButton from '../components/PillButton'

// Page-scoped styles, injected once alongside the page (tokens from index.css).
const PROJECTS_CSS = `
.projects-hero {
  padding-top: 160px;
  padding-bottom: 96px;
  overflow: visible;
}
.projects-hero__title {
  margin: 0;
  color: #FFFFEB;
  line-height: 1.05;
  padding-bottom: 0.08em;
}
.projects-list {
  padding: 96px 0 120px;
}
.proj-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.proj-grid > li {
  margin: 0;
  min-width: 0;
}
.proj-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
  background-color: #FFFFEB;
  color: #1A1A1A;
  border: 1px solid rgba(26, 26, 26, 0.1);
  border-radius: var(--radius-card, 24px);
  padding: 28px;
  overflow-wrap: anywhere;
  transition: background-color 180ms var(--ease-out);
}
.proj-card:hover,
.proj-card:focus-within {
  background-color: #F0D7FF;
}
.proj-card__metric {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}
.proj-card__dash {
  flex: none;
  display: inline-block;
  width: 24px;
  height: 2px;
  background: #FFA946;
}
.proj-card__subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  min-height: 2.8em;
  color: rgba(26, 26, 26, 0.78);
}
.proj-card__title {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}
.proj-card__desc {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}
.proj-card__tags {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.proj-card__tag {
  font-size: 13px;
  line-height: 1.3;
  padding: 4px 12px;
  border-radius: 999px;
  color: #1A1A1A;
  background: transparent;
  border: 1px solid rgba(26, 26, 26, 0.15);
}
.proj-card__links {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 8px;
}
.proj-card__link {
  font-size: 15px;
  font-weight: 500;
  color: #1A1A1A;
  text-decoration: none;
  border-bottom: 1px solid rgba(26, 26, 26, 0.3);
}
.proj-card__link:hover {
  border-bottom-color: #1A1A1A;
}
.proj-cta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  height: 100%;
  box-sizing: border-box;
  background-color: #F0D7FF;
  color: #1A1A1A;
  border: 1px solid #1A1A1A;
  border-radius: var(--radius-card, 24px);
  padding: 28px;
}
.proj-cta__title {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}
.proj-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
@media (min-width: 1025px) {
  .proj-grid__cta--hidden { display: none; }
}
@media (max-width: 1024px) {
  .proj-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .proj-grid > li.proj-grid__cta { grid-column: 1 / -1 !important; }
}
@media (max-width: 640px) {
  .projects-hero { padding-bottom: 64px; }
  .projects-list { padding: 64px 0 96px; }
  .proj-grid { grid-template-columns: minmax(0, 1fr); }
}
`

function ProjectCard({ project }) {
  // Only render a metric if the data carries one; never derive it from copy.
  const metric = project.metric ?? project.impact
  const tags = Array.isArray(project.techStack) ? project.techStack : []

  return (
    <article className="proj-card">
      {metric && (
        <p className="proj-card__metric display d-48">
          <span className="proj-card__dash" aria-hidden="true" />
          <span>{metric}</span>
        </p>
      )}

      <p className="proj-card__subtitle">{project.subtitle || ''}</p>
      <h2 className="proj-card__title display">{project.title}</h2>
      {project.description && <p className="proj-card__desc">{project.description}</p>}

      {tags.length > 0 && (
        <ul className="proj-card__tags" aria-label="Tech stack">
          {tags.map((t) => (
            <li key={t} className="proj-card__tag">{t}</li>
          ))}
        </ul>
      )}

      {(project.github || project.demo) && (
        <div className="proj-card__links">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="proj-card__link">
              View on GitHub
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="proj-card__link">
              Live demo
            </a>
          )}
        </div>
      )}
    </article>
  )
}

function CtaCard() {
  return (
    <div className="proj-cta">
      <p className="proj-cta__title display">More on GitHub</p>
      <div className="proj-cta__actions">
        <PillButton variant="outline" href="https://github.com/karan-ssj3">GitHub</PillButton>
        <PillButton variant="primary" href="/contact">Contact</PillButton>
      </div>
    </div>
  )
}

export default function Projects() {
  const rem = PROJECTS.length % 3
  const ctaStyle = rem === 0 ? undefined : { gridColumn: `span ${3 - rem}` }
  // At 3 columns a full last row needs no CTA; it stays full-width at 2 and 1 columns.
  const ctaClass = rem === 0 ? 'proj-grid__cta proj-grid__cta--hidden' : 'proj-grid__cta'

  return (
    <div className="page page--projects">
      <style>{PROJECTS_CSS}</style>

      <Section tone="teal" roundedBottom className="projects-hero" as="header">
        <div className="wrap">
          <h1 className="projects-hero__title display d-96">
            Selected <em>work.</em>
          </h1>
        </div>
      </Section>

      <Section tone="cream" className="projects-list" aria-label="Project list">
        <div className="wrap">
          <ul className="proj-grid">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} />
              </li>
            ))}
            <li className={ctaClass} style={ctaStyle}>
              <CtaCard />
            </li>
          </ul>
        </div>
      </Section>
    </div>
  )
}
