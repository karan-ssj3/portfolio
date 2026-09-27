// Lilac "act" pill, top-left, only visible when focused.
const STYLE_ID = 'skip-pill-styles'

const CSS = `
.skip-pill{position:fixed;top:12px;left:12px;z-index:60;padding:10px 18px;border-radius:999px;background:#F0D7FF;border:1px solid #1A1A1A;color:#1A1A1A;font-family:'Figtree',system-ui,sans-serif;font-size:15px;font-weight:500;text-decoration:none;transform:translateY(-200%);transition:transform 180ms var(--ease-out)}
.skip-pill:focus,.skip-pill:focus-visible{transform:none}
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
  return (
    <a href="#main" className="skip-pill">
      Skip to main content
    </a>
  )
}
