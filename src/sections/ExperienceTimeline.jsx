import { useEffect, useRef, useState } from 'react'
import * as experienceData from '../data/experience'
import Section from '../components/Section'
import PillButton from '../components/PillButton'
import './ExperienceTimeline.css'

const { EXPERIENCE } = experienceData

// Education is optional: only rendered when the data file exports it.
// A dynamic key keeps the bundler from warning when the export is absent.
const EDUCATION_KEY = 'EDUCATION'
const EDUCATION = Array.isArray(experienceData[EDUCATION_KEY])
  ? experienceData[EDUCATION_KEY]
  : []

// Matches the experience route registered in App.jsx.
const EXPERIENCE_ROUTE = '/experience'

// Per content rules: never imply a client location on client engagements.
const CLIENT_COMPANIES = new Set(['Deloitte', 'Synogize'])

const HAS_CURRENT = EXPERIENCE.some((r) => r.current)

function educationLabel(item) {
  if (typeof item === 'string') return { label: item, detail: null }
  const label = item.institution || item.school || item.name || item.title || item.degree || ''
  const detail = item.degree && item.degree !== label ? item.degree : null
  return { label, detail, dates: item.dates || item.year || null }
}

export default function ExperienceTimeline({ compact = false, showHeader = true }) {
  const roles = compact ? EXPERIENCE.slice(0, 3) : EXPERIENCE
  const [passed, setPassed] = useState(() => new Set())
  const itemRefs = useRef(new Map())

  useEffect(() => {
    const elements = Array.from(itemRefs.current.values())
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return

    // A role counts as passed once its top crosses 55% of the viewport,
    // or once it has scrolled fully above it.
    const observer = new IntersectionObserver(
      (entries) => {
        setPassed((prev) => {
          const next = new Set(prev)
          let changed = false
          entries.forEach((entry) => {
            const id = Number(entry.target.dataset.id)
            const isPast = entry.isIntersecting || entry.boundingClientRect.top < 0
            if (isPast && !next.has(id)) {
              next.add(id)
              changed = true
            } else if (!isPast && next.has(id)) {
              next.delete(id)
              changed = true
            }
          })
          return changed ? next : prev
        })
      },
      { rootMargin: '0px 0px -45% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [roles.length])

  return (
    <Section
      id="experience"
      tone="cream"
      className={`experience${compact ? ' experience--compact' : ''}`}
    >
      <div className="wrap">
        <div className="experience__inner">
          {showHeader && (
            <header className="experience__header">
              <p className="eyebrow experience__eyebrow">Experience</p>
              <h2 className="display d-64 experience__title">
                Where I’ve <em>worked.</em>
              </h2>
            </header>
          )}

          <ol className="experience__list" aria-label="Professional experience">
            {roles.map((role, index) => {
              const isPassed = passed.has(role.id)
              const isCurrent = role.current === true || (!HAS_CURRENT && index === 0)
              const showLocation = role.location && !CLIENT_COMPANIES.has(role.company)
              const dotClass = [
                'experience__dot',
                isPassed ? 'experience__dot--passed' : '',
                isCurrent ? 'experience__dot--current' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <li
                  key={role.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(role.id, el)
                    else itemRefs.current.delete(role.id)
                  }}
                  data-id={role.id}
                  className="experience__item"
                >
                  <div className="experience__rail" aria-hidden="true">
                    <span className={dotClass} />
                  </div>

                  <div className="experience__body">
                    <h3 className="display d-32 experience__role">{role.title}</h3>

                    <p className="experience__meta">
                      <span>{role.company}</span>
                      {showLocation && <span>{role.location}</span>}
                      <span className="tnum xp-dates">
                        {`${role.startDate} to ${role.endDate}`}
                      </span>
                      {role.current && <span className="experience__badge">Current</span>}
                    </p>

                    {role.description?.length > 0 && (
                      <ul className="experience__points">
                        {role.description.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    )}

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

          {compact && (
            <div className="experience__more">
              <PillButton href={EXPERIENCE_ROUTE} variant="primary">
                Full experience
              </PillButton>
            </div>
          )}

          {!compact && EDUCATION.length > 0 && (
            <div className="experience__education">
              <p className="eyebrow">Education</p>
              <ul className="experience__edu-list">
                {EDUCATION.map((item, i) => {
                  const { label, detail, dates } = educationLabel(item)
                  if (!label) return null
                  return (
                    <li key={i} className="experience__edu-item">
                      <span className="experience__edu-name">{label}</span>
                      {detail && <span className="experience__edu-detail">{detail}</span>}
                      {dates && <span className="experience__edu-detail tnum">{dates}</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
