import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const ROUTE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/experience', label: 'Experience' },
  { to: '/blog', label: 'Blog' },
]

const HOME_LINKS = [
  { to: '#hero', label: 'Home' },
  { to: '#how-i-work', label: 'How I Work' },
  { to: '#projects', label: 'Projects' },
  { to: '#tech-stack', label: 'Tech Stack' },
  { to: '#process', label: 'Process' },
  { to: '#experience', label: 'Experience' },
  { to: '#faq', label: 'FAQ' },
  { to: '/blog', label: 'Blog' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const links = isHome ? HOME_LINKS : ROUTE_LINKS

  const handleAnchorClick = (e, href) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
      window.history.pushState(null, '', href)
    }
    setMobileOpen(false)
  }

  return (
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`} aria-label="Primary">
      <NavLink to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
        <span className="nav-logo-mark" aria-label="Karan Bhutani">
          KB
          <span className="nav-logo-dot" aria-hidden="true" />
        </span>
      </NavLink>

      <ul className="nav-links">
        {links.map(({ to, label }) => (
          <li key={to}>
            {to.startsWith('#') ? (
              <a
                href={to}
                className="nav-link"
                onClick={(e) => handleAnchorClick(e, to)}
              >
                {label}
              </a>
            ) : (
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>

      {isHome ? (
        <a
          href="#cta"
          className="nav-cta"
          onClick={(e) => handleAnchorClick(e, '#cta')}
        >
          Let's talk
        </a>
      ) : (
        <NavLink to="/contact" className="nav-cta" onClick={() => setMobileOpen(false)}>
          Let's talk
        </NavLink>
      )}

      <button
        className="nav-hamburger"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
      >
        <span aria-hidden="true" style={{ transform: mobileOpen ? 'rotate(45deg) translate(4px,4px)' : 'none' }} />
        <span aria-hidden="true" style={{ opacity: mobileOpen ? 0 : 1 }} />
        <span aria-hidden="true" style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none' }} />
      </button>

      {mobileOpen && (
        <div id="mobile-menu" className="nav-mobile-menu">
          <ul className="nav-mobile-list">
            {links.map(({ to, label }) => (
              <li key={to}>
                {to.startsWith('#') ? (
                  <a
                    href={to}
                    className="nav-mobile-link"
                    onClick={(e) => handleAnchorClick(e, to)}
                  >
                    {label}
                  </a>
                ) : (
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `nav-mobile-link${isActive ? ' nav-link-active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          {isHome ? (
            <a
              href="#cta"
              className="nav-mobile-cta"
              onClick={(e) => handleAnchorClick(e, '#cta')}
            >
              Let's talk
            </a>
          ) : (
            <NavLink to="/contact" className="nav-mobile-cta" onClick={() => setMobileOpen(false)}>
              Let's talk
            </NavLink>
          )}
        </div>
      )}
    </nav>
  )
}
