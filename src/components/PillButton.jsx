// Pill button: lilac "act" primary or current-colour outline.
// Renders <a> when href is set, <button> otherwise.
const STYLE_ID = 'pill-button-styles'

const CSS = `
.pill-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:999px;font-family:'Figtree',system-ui,sans-serif;font-size:16px;font-weight:500;line-height:1.2;text-decoration:none;cursor:pointer;white-space:nowrap;box-shadow:none;background-image:none;transition:transform 180ms var(--ease-out),background-color 180ms var(--ease-out)}
.pill-btn:hover{transform:translateY(-1px)}
.pill-btn:disabled,.pill-btn[aria-disabled='true']{cursor:not-allowed;opacity:.6;transform:none}
.pill-btn--primary{background-color:#F0D7FF;border:1px solid #1A1A1A;color:#1A1A1A}
.pill-btn--outline{background-color:transparent;border:1px solid currentColor;color:inherit}
.pill-btn__icon{display:inline-flex;align-items:center;line-height:0}
`

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = CSS
  document.head.appendChild(el)
}

const isExternal = (href) => /^(https?:)?\/\//i.test(href)

export default function PillButton({
  href,
  variant = 'primary',
  icon,
  children,
  className = '',
  type = 'button',
  target,
  rel,
  ...rest
}) {
  injectStyles()

  const classes = [
    'pill-btn',
    `pill-btn--${variant === 'outline' ? 'outline' : 'primary'}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {children}
      {icon ? <span className="pill-btn__icon" aria-hidden="true">{icon}</span> : null}
    </>
  )

  if (href) {
    const external = isExternal(href)
    const finalTarget = target ?? (external ? '_blank' : undefined)
    const finalRel =
      rel ?? (external || finalTarget === '_blank' ? 'noopener noreferrer' : undefined)
    return (
      <a href={href} className={classes} target={finalTarget} rel={finalRel} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  )
}
