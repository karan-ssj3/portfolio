import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/projects',   label: 'Projects' },
  { to: '/experience', label: 'Experience' },
  { to: '/blog',       label: 'Blog' },
  { to: '/contact',    label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo" onClick={() => setOpen(false)}>
        KB<span>// Karan Bhutani</span>
      </NavLink>

      <ul className="nav-links">
        {LINKS.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => isActive ? 'active' : ''}
              end={to === '/'}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        className="nav-menu-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
      >
        <span style={{ transform: open ? 'rotate(45deg) translate(4px,4px)' : 'none' }} />
        <span style={{ opacity: open ? 0 : 1 }} />
        <span style={{ transform: open ? 'rotate(-45deg) translate(4px,-4px)' : 'none' }} />
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed',
          top: '56px', left: 0, right: 0,
          background: 'rgba(5,5,16,.97)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0,245,255,.15)',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          zIndex: 998,
        }}>
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={{ fontFamily: 'var(--mono)', fontSize: '.85rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(148,163,184,.85)' }}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}
