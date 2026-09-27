const LINKS = [
  { label: 'Email', href: 'mailto:karanbhutani.work@gmail.com', text: 'karanbhutani.work@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/karan-ssj3', text: 'github.com/karan-ssj3' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/karan-bhutani/', text: 'linkedin.com/in/karan-bhutani' },
  { label: 'Medium', href: 'https://medium.com/@karanbhutani477', text: 'medium.com/@karanbhutani477' },
]

const STYLES = `
.footer-cta {
  background: #F5F3EE;
  color: #1C1B18;
  padding: 6rem 1.5rem;
  border-top: 1px solid rgba(28, 27, 24, 0.12);
  font-family: 'Inter', system-ui, sans-serif;
}
.footer-cta-inner {
  max-width: 64rem;
  margin: 0 auto;
}
.footer-cta-headline {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin: 0 0 3rem;
  max-width: 36rem;
}
.footer-cta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 2rem;
  border-top: 1px solid rgba(28, 27, 24, 0.12);
  padding-top: 2rem;
}
.footer-cta-link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-decoration: none;
  opacity: 0;
  animation: footer-cta-rise 480ms ease forwards;
}
.footer-cta-link:nth-child(1) { animation-delay: 80ms; }
.footer-cta-link:nth-child(2) { animation-delay: 200ms; }
.footer-cta-link:nth-child(3) { animation-delay: 320ms; }
.footer-cta-link:nth-child(4) { animation-delay: 440ms; }
@keyframes footer-cta-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.footer-cta-link-label {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #9C5636;
}
.footer-cta-link-text {
  font-size: 0.9375rem;
  color: #1C1B18;
  border-bottom: 1px solid transparent;
  transition: border-color 160ms ease;
  align-self: flex-start;
}
.footer-cta-link:hover .footer-cta-link-text {
  border-color: #9C5636;
}
.footer-cta-link:focus-visible {
  outline: 2px solid #9C5636;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .footer-cta-link {
    opacity: 1;
    animation: none;
    transform: none;
  }
  .footer-cta-link-text { transition: none; }
}
`

export default function FooterCTA() {
  return (
    <section className="footer-cta" aria-labelledby="footer-cta-heading">
      <style>{STYLES}</style>
      <div className="footer-cta-inner">
        <h2 className="footer-cta-headline" id="footer-cta-heading">
          Build with someone who ships.
        </h2>
        <div className="footer-cta-grid">
          {LINKS.map(({ label, href, text }) => (
            <a
              key={label}
              className="footer-cta-link"
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel={href.startsWith('mailto') ? undefined : 'noreferrer'}
            >
              <span className="footer-cta-link-label">{label}</span>
              <span className="footer-cta-link-text">{text}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
