import Section from '../components/Section'
import ExperienceTimeline from '../sections/ExperienceTimeline'

// Page-scoped layout rules: slab padding, radius on the slab itself, and a
// single source of top spacing for the timeline (its own top gap is reset).
const css = `
.page--experience { background: #FFFFEB; overflow-x: clip; }
.page--experience .exp-slab {
  padding-top: 140px;
  padding-bottom: 72px;
  border-radius: 0 0 var(--radius-slab, 48px) var(--radius-slab, 48px);
  background: #1A1A1A;
  background-clip: padding-box;
  margin-top: 0;
  margin-bottom: 0;
}
.page--experience .exp-slab > .wrap {
  background: transparent;
  padding-inline: max(20px, clamp(20px, 4vw, 48px));
}
.page--experience .exp-slab h1 {
  margin: 0;
  color: #FFFFEB;
  padding-right: 0.06em;
  overflow-wrap: break-word;
}
.page--experience .exp-timeline { padding-top: 64px; }
.page--experience .exp-timeline > :first-child,
.page--experience .exp-timeline .experience-timeline,
.page--experience .exp-timeline .timeline {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
@media (max-width: 640px) {
  .page--experience .exp-slab {
    padding-top: 124px;
    padding-bottom: 48px;
    border-radius: 0 0 32px 32px;
  }
  .page--experience .exp-timeline { padding-top: 40px; }
}
`

export default function Experience() {
  return (
    <div className="page page--experience">
      <style>{css}</style>
      <Section tone="ink" as="header" className="exp-slab">
        <div className="wrap">
          <h1 className="display d-96">
            Where I’ve <em>worked.</em>
          </h1>
        </div>
      </Section>

      <div className="exp-timeline">
        <ExperienceTimeline showHeader={false} />
      </div>
    </div>
  )
}
