const CONTACTS = [
  { label: 'Email', href: 'mailto:karanbhutani.work@gmail.com', text: 'karanbhutani.work@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/karan-ssj3', text: 'github.com/karan-ssj3' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/karan-bhutani/', text: 'linkedin.com/in/karan-bhutani' },
  { label: 'Medium', href: 'https://medium.com/@karanbhutani477', text: 'medium.com/@karanbhutani477' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <a href="/" className="footer-mark" aria-label="Karan Bhutani home">
          KB
          <span className="footer-mark-dot" aria-hidden="true" />
        </a>

        <nav aria-label="Contact">
          <ul className="footer-links">
            {CONTACTS.map(({ label, href, text }) => (
              <li key={label}>
                <a
                  href={href}
                  className="footer-link"
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noreferrer'}
                >
                  <span className="footer-link-label">{label}</span>
                  <span className="footer-link-text">{text}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="footer-copy">© 2025 Karan Bhutani</p>
      </div>
    </footer>
  )
}
