import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

const LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/projects',   label: 'Projects' },
  { to: '/experience', label: 'Experience' },
  { to: '/blog',       label: 'Blog' },
  { to: '/contact',    label: 'Contact' },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}>
      <NavLink to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
        <span className="nav-logo-mark">KB</span>
        <span className="nav-logo-divider" />
        <span className="nav-logo-name">Karan Bhutani</span>
      </NavLink>

      <ul className="nav-links">
        {LINKS.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        className="nav-hamburger"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Menu"
      >
        <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(4px,4px)' : 'none' }} />
        <span style={{ opacity: mobileOpen ? 0 : 1 }} />
        <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none' }} />
      </button>

      {mobileOpen && (
        <div className="nav-mobile-menu">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-mobile-link${isActive ? ' nav-link-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
