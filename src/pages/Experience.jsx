import Section from '../components/Section'
import ExperienceTimeline from '../sections/ExperienceTimeline'

export default function Experience() {
  return (
    <div className="page page--experience">
      <Section
        tone="ink"
        roundedBottom
        as="header"
        style={{ paddingTop: '160px', paddingBottom: '96px' }}
      >
        <div className="wrap">
          <h1 className="display d-96" style={{ margin: 0, color: '#FFFFEB' }}>
            Where I’ve <em>worked.</em>
          </h1>
        </div>
      </Section>

      <ExperienceTimeline showHeader={false} />
    </div>
  )
}
