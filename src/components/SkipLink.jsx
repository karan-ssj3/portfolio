// Lilac "act" pill, top-left, only visible when focused.
// Portalled to the start of document.body so it is the first focusable element
// and no transformed/overflow ancestor can break position:fixed.
import { createPortal } from 'react-dom'
import { useLayoutEffect, useState } from 'react'

const STYLE_ID = 'skip-pill-styles'

const CSS = `
.skip-pill{position:fixed;top:16px;left:16px;z-index:1001;padding:10px 18px;border-radius:999px;background:#F0D7FF;border:1px solid #1A1A1A;color:#1A1A1A;font-family:'Figtree',system-ui,sans-serif;font-size:15px;font-weight:500;text-decoration:none;white-space:nowrap}
.skip-pill:not(:focus-visible){clip:rect(0 0 0 0);clip-path:inset(50%);width:1px;height:1px;overflow:hidden;padding:0;border:0;margin:-1px}
`

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = CSS
  document.head.appendChild(el)
}

export default function SkipLink() {
  injectStyles()
  const [host, setHost] = useState(null)

  useLayoutEffect(() => {
    const el = document.createElement('div')
    el.setAttribute('data-skip-host', '')
    document.body.insertBefore(el, document.body.firstChild)
    setHost(el)
    return () => el.remove()
  }, [])

  const onClick = (e) => {
    const main = document.getElementById('main')
    if (!main) return
    e.preventDefault()
    main.focus()
    main.scrollIntoView?.({ block: 'start' })
  }

  if (!host) return null
  return createPortal(
    <a href="#main" className="skip-pill" onClick={onClick}>
      Skip to main content
    </a>,
    host
  )
}
