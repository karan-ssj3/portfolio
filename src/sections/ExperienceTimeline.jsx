import { useEffect, useRef, useState } from 'react'
import { EXPERIENCE } from '../data/experience'
import Section from '../components/Section'
import './ExperienceTimeline.css'

// Per content rules: never imply a client location on client engagements.
const CLIENT_COMPANIES = new Set(['Deloitte', 'Synogize'])

export default function ExperienceTimeline() {
  const [activeId, setActiveId] = useState(null)
  const itemRefs = useRef(new Map())

  useEffect(() => {
    const elements = Array.from(itemRefs.current.values())
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(Number(entry.target.dataset.id))
          }
        })
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <Section id="experience" className="experience">
      <div className="experience__inner">
        <header className="experience__header">
          <p className="experience__eyebrow">Experience</p>
          <h2 className="experience__title">Where I&rsquo;ve worked</h2>
        </header>

        <ol className="experience__list" aria-label="Professional experience">
          {EXPERIENCE.map((role, index) => {
            const isActive = activeId === role.id
            const showLocation = role.location && !CLIENT_COMPANIES.has(role.company)

            return (
              <li
                key={role.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(role.id, el)
                  else itemRefs.current.delete(role.id)
                }}
                data-id={role.id}
                className={`experience__item${isActive ? ' experience__item--active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <div className="experience__rail" aria-hidden="true">
                  <span className="experience__dot" />
                </div>

                <div className="experience__body">
                  <div className="experience__head">
                    <span className="experience__index">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="experience__heading">
                      <h3 className="experience__role">{role.title}</h3>
                      <p className="experience__company">
                        <span>{role.company}</span>
                        {showLocation && (
                          <span className="experience__location">
                            {' · '}
                            {role.location}
                          </span>
                        )}
                      </p>
                    </div>

                    <p className="experience__dates">
                      <span>{role.startDate}</span>
                      <span aria-hidden="true"> – </span>
                      <span>{role.endDate}</span>
                      {role.current && (
                        <span className="experience__badge">Current</span>
                      )}
                    </p>
                  </div>

                  <ul className="experience__points">
                    {role.description.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>

                  {role.techStack?.length > 0 && (
                    <ul className="experience__tech" aria-label="Technologies used">
                      {role.techStack.map((tech) => (
                        <li key={tech} className="experience__tech-item">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
