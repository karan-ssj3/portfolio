import { useScrollContext } from '../providers/ScrollProvider'
import ProcessScene from '../components/three/ProcessScene'
import { EXPERIENCE } from '../data/experience'

const byId = (id) => EXPERIENCE.find((entry) => entry.id === id)
const deloitte = byId(1).description
const synogize = byId(2).description

// Phase labels are the four 'How I work' steps from content-draft.md, verbatim.
// Experience lines reference src/data/experience.js entries by id/index so the
// copy cannot drift from the data file.
const PHASES = [
  {
    label: '01 — Understand first.',
    description: 'Start with the bottleneck, not the model: what the manual process costs, and what measurable outcome counts as done.',
    experiences: [deloitte[0], deloitte[3]],
  },
  {
    label: '02 — Design the spine.',
    description: 'Architecture before code — data layers, routing, schemas, and evaluation designed up front so the system stays deterministic where it matters.',
    experiences: [synogize[2], deloitte[5]],
  },
  {
    label: '03 — Build and evaluate.',
    description: 'Models and agents are built against a defined eval suite — Hit Rate@K, MAPE, AUC, LLM-as-a-Judge — so quality is measured, never assumed.',
    experiences: [deloitte[1], synogize[1]],
  },
  {
    label: '04 — Ship and measure.',
    description: 'Systems land in client interfaces and scheduled pipelines, then impact is tracked against the baseline — review time, cycle time, cost.',
    experiences: [deloitte[2], deloitte[4]],
  },
]

export default function Process() {
  const { reducedMotion } = useScrollContext()

  return (
    <section aria-labelledby="process-heading">
      <h2 id="process-heading">How I work</h2>
      <div className="process-container">
        {PHASES.map((phase, index) => (
          <article
            key={phase.label}
            className={`process-step ${reducedMotion ? 'stacked' : ''}`}
          >
            <div className="process-backdrop" aria-hidden="true">
              <ProcessScene index={index} />
            </div>
            <div className="process-content">
              <h3>{phase.label}</h3>
              <p>{phase.description}</p>
              {phase.experiences.length > 0 && (
                <ul>
                  {phase.experiences.map((exp) => (
                    <li key={exp}>{exp}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
      <style>{`
        .process-container {
          display: block;
        }
        .process-step {
          position: relative;
          min-height: 100svh;
          width: 100%;
          background: #F5F3EE;
        }
        .process-backdrop {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .process-content {
          position: relative;
          z-index: 1;
          max-width: 48rem;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          color: #1C1B18;
        }
        .process-content h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          line-height: 1.2;
          margin: 0 0 1rem;
        }
        .process-content p {
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 1.5rem;
          color: #1C1B18;
        }
        .process-content ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .process-content li {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #1C1B18;
          padding-left: 1rem;
          position: relative;
          margin-bottom: 0.5rem;
        }
        .process-content li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.6em;
          width: 0.4rem;
          height: 0.4rem;
          background: #9C5636;
          border-radius: 50%;
        }

        /* JS reduced-motion flag (prefers-reduced-motion or low GPU) stacks the scenes. */
        .process-step.stacked {
          position: relative;
          height: auto;
          min-height: 100svh;
        }

        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .process-step {
            position: sticky;
            top: 0;
            height: 100vh;
          }
          .process-step.stacked {
            position: relative;
            top: auto;
            height: auto;
            min-height: 100svh;
          }
          .process-content {
            padding: 4rem 2rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .process-step {
            position: relative;
            height: auto;
            min-height: 100svh;
            padding: 2rem 1rem;
          }
          .process-content {
            max-width: none;
          }
        }
      `}</style>
    </section>
  )
}
