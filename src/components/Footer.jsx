// Ink footer that continues the closer slab with no gap.
const CONTACTS = [
  { label: 'Email', href: 'mailto:karanbhutani.work@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/karan-ssj3' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/karan-bhutani' },
  { label: 'Medium', href: 'https://medium.com/@karanbhutani477' },
]

const STYLES = `
.site-footer {
  margin: 0;
  background: #1A1A1A;
  color: #FFFFEB;
  padding: 64px 0;
  font-family: 'Figtree', system-ui, sans-serif;
}
.site-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 235, 0.12);
}
.site-footer-mark {
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.12em;
  color: #FFFFEB;
  text-decoration: none;
}
.site-footer-dot {
  color: #FFA946;
}
.site-footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.site-footer-link {
  font-size: 16px;
  color: #FFFFEB;
  text-decoration: none;
  text-underline-offset: 4px;
}
.site-footer-link:hover {
  text-decoration: underline;
}
.site-footer :focus-visible {
  outline: 3px solid #F0D7FF;
  outline-offset: 3px;
}
.site-footer-copy {
  margin: 24px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 235, 0.6);
}
`

export default function Footer() {
  return (
    <footer className="site-footer">
      <style>{STYLES}</style>
      <div className="wrap">
        <div className="site-footer-inner">
          <a href="/" className="site-footer-mark" aria-label="Karan Bhutani home">
            k<span className="site-footer-dot" aria-hidden="true">·</span>b
          </a>

          <nav aria-label="Contact">
            <ul className="site-footer-links">
              {CONTACTS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="site-footer-link"
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="site-footer-copy">© 2025 Karan Bhutani</p>
      </div>
    </footer>
  )
}
