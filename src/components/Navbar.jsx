// Floating cream pill nav: k·b monogram (pulsing amber "neuron" dot),
// route links, lilac Contact pill. Hides on scroll-down, reveals on scroll-up.
// Portalled into document.body so transformed/overflow ancestors cannot break fixed.
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useScrollContext } from '../providers/ScrollProvider'
import PillButton from './PillButton'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/experience', label: 'Experience' },
  { to: '/blog', label: 'Blog' },
]

const CONTACT_ROUTE = '/contact'
const TOP_ZONE = 80
const DELTA = 8

const STYLE_ID = 'pill-nav-styles'

const CSS = `
.pill-nav{position:fixed;top:16px;left:50%;transform:translate(-50%,0);width:calc(100% - 24px);max-width:960px;box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:8px 8px 8px 20px;background:#FFFFEB;border:1px solid rgba(26,26,26,.1);border-radius:999px;z-index:1000;font-family:'Figtree',system-ui,sans-serif;color:#1A1A1A;transition:transform 200ms var(--ease-out);visibility:visible;opacity:1}
.pill-nav.is-hidden{transform:translate(-50%,-120%)}
.pill-nav__mono{display:inline-flex;align-items:center;font-weight:600;font-size:18px;letter-spacing:.18em;color:#1A1A1A;text-decoration:none;line-height:1;padding:6px 0;flex:none}
.pill-nav__dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#FFA946;margin:0 .18em 0 0;animation:pill-nav-pulse 2.4s ease-in-out infinite}
@keyframes pill-nav-pulse{0%,100%{opacity:.5}50%{opacity:1}}
.pill-nav__links{display:flex;align-items:center;justify-content:center;gap:4px;list-style:none;margin:0;padding:0;flex:1;min-width:0}
.pill-nav__link{display:inline-block;padding:8px 16px;border-radius:999px;font-size:16px;font-weight:500;color:#1A1A1A;text-decoration:none;transition:background-color 180ms var(--ease-out)}
.pill-nav__link:hover{background:rgba(26,26,26,.05)}
.pill-nav__link.is-active{background:rgba(26,26,26,.05)}
.pill-nav__right{display:flex;align-items:center;gap:8px;flex:none;margin-left:auto}
.pill-nav__menu{display:none;align-items:center;justify-content:center;width:44px;height:44px;border-radius:999px;border:1px solid rgba(26,26,26,.15);background:transparent;color:#1A1A1A;cursor:pointer;padding:0}
.pill-nav__bars{position:relative;display:block;width:18px;height:12px}
.pill-nav__bars span{position:absolute;left:0;width:100%;height:1.5px;background:currentColor;border-radius:2px;transition:transform 200ms var(--ease-out),opacity 200ms var(--ease-out)}
.pill-nav__bars span:nth-child(1){top:0}
.pill-nav__bars span:nth-child(2){top:5.25px}
.pill-nav__bars span:nth-child(3){top:10.5px}
.pill-nav__menu[aria-expanded='true'] .pill-nav__bars span:nth-child(1){transform:translateY(5.25px) rotate(45deg)}
.pill-nav__menu[aria-expanded='true'] .pill-nav__bars span:nth-child(2){opacity:0}
.pill-nav__menu[aria-expanded='true'] .pill-nav__bars span:nth-child(3){transform:translateY(-5.25px) rotate(-45deg)}
.pill-nav__panel{position:absolute;top:calc(100% + 8px);left:0;right:0;box-sizing:border-box;background:#FFFFEB;border:1px solid rgba(26,26,26,.1);border-radius:24px;padding:8px}
.pill-nav__panel ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.pill-nav__panel .pill-nav__link{display:block;padding:12px 16px;border-radius:16px}
@media (max-width:719px){
  .pill-nav__links{display:none}
  .pill-nav__menu{display:inline-flex}
  .pill-nav .pill-btn{padding:10px 18px}
}
@media (prefers-reduced-motion:reduce){
  .pill-nav__dot{animation:none;opacity:1}
}
`

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = CSS
  document.head.appendChild(el)
}

export default function Navbar() {
  injectStyles()

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { getLenis, reducedMotion, gpuTier } = useScrollContext()
  const [hidden, setHidden] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [host, setHost] = useState(null)
  const menuBtnRef = useRef(null)
  const lastYRef = useRef(0)

  // Own host node in body, placed right after the skip link host if present.
  useLayoutEffect(() => {
    const el = document.createElement('div')
    el.setAttribute('data-nav-host', '')
    const skip = document.querySelector('[data-skip-host]')
    if (skip) skip.after(el)
    else document.body.insertBefore(el, document.body.firstChild)
    setHost(el)
    return () => el.remove()
  }, [])

  const update = useCallback((y) => {
    const last = lastYRef.current
    if (y < TOP_ZONE) {
      setHidden(false)
      lastYRef.current = y
      return
    }
    if (y < last) {
      setHidden(false)
      lastYRef.current = y
    } else if (y - last > DELTA) {
      setHidden(true)
      lastYRef.current = y
    }
  }, [])

  // Prefer the Lenis instance when exposed; otherwise rAF-throttled window scroll.
  useEffect(() => {
    lastYRef.current = window.scrollY
    update(window.scrollY)

    const lenis = getLenis?.()
    if (lenis && typeof lenis.on === 'function') {
      const onLenis = (l) => update(typeof l?.scroll === 'number' ? l.scroll : window.scrollY)
      lenis.on('scroll', onLenis)
      return () => lenis.off?.('scroll', onLenis)
    }

    let ticking = false
    let frame = 0
    const onScroll = () => {
      if (ticking) return
      ticking = true
      frame = requestAnimationFrame(() => {
        ticking = false
        update(window.scrollY)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [getLenis, reducedMotion, gpuTier, update])

  // Close the mobile panel on route change.
  useEffect(() => {
    setMenuOpen(false)
    setHidden(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuBtnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const onFocus = () => setFocusWithin(true)
  const onBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false)
  }

  const onContactClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    setMenuOpen(false)
    navigate(CONTACT_ROUTE)
  }

  const isHidden = hidden && !focusWithin && !menuOpen

  const renderLinks = () =>
    LINKS.map(({ to, label }) => (
      <li key={to}>
        <NavLink
          to={to}
          end={to === '/'}
          className={({ isActive }) => `pill-nav__link${isActive ? ' is-active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          {label}
        </NavLink>
      </li>
    ))

  const nav = (
    <nav
      className={`pill-nav${isHidden ? ' is-hidden' : ''}`}
      aria-label="Primary"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <NavLink to="/" className="pill-nav__mono" aria-label="Karan Bhutani, home">
        <span aria-hidden="true">k</span>
        <span className="pill-nav__dot" aria-hidden="true" />
        <span aria-hidden="true">b</span>
      </NavLink>

      <ul className="pill-nav__links">{renderLinks()}</ul>

      <div className="pill-nav__right">
        <PillButton href={CONTACT_ROUTE} variant="primary" onClick={onContactClick}>
          Contact
        </PillButton>
        <button
          ref={menuBtnRef}
          type="button"
          className="pill-nav__menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="pill-nav-panel"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="pill-nav__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div id="pill-nav-panel" className="pill-nav__panel">
          <ul>{renderLinks()}</ul>
        </div>
      )}
    </nav>
  )

  if (!host) return null
  return createPortal(nav, host)
}
