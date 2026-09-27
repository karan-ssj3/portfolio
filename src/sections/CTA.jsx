import Section from '../components/Section'
import PillButton from '../components/PillButton'

// Cream call-to-action slab: serif headline and the lilac "act" pill.
const STYLES = `
.cta {
  padding: clamp(96px, 10vw, 128px) 0;
  text-align: center;
}
.cta-eyebrow {
  margin: 0 0 16px;
}
.cta-headline {
  margin: 0 auto 32px;
  max-width: 18ch;
  color: #1A1A1A;
}
`

export default function CTA() {
  return (
    <Section tone="cream" className="cta" aria-labelledby="cta-heading">
      <style>{STYLES}</style>
      <div className="wrap">
        <p className="eyebrow cta-eyebrow">Let&rsquo;s build something</p>
        <h2 className="display d-64 cta-headline" id="cta-heading">
          Have a system <em>in mind?</em>
        </h2>
        <PillButton variant="primary" href="mailto:karanbhutani.work@gmail.com">
          Start a conversation
        </PillButton>
      </div>
    </Section>
  )
}
