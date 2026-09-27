import useReducedMotion from '../hooks/useReducedMotion'

// Small waveform pill: 12 bars that pulse in height with staggered delays.
// Static (fixed heights, no animation) under reduced motion.
const STYLE_ID = 'waveform-pill-styles'
const BAR_COUNT = 12
// Resting heights (percent) used when static, and as a visual rhythm.
const STATIC_HEIGHTS = [35, 60, 85, 50, 100, 70, 45, 90, 65, 40, 75, 30]

const CSS = `
@keyframes waveform-bar{0%,100%{height:25%}50%{height:100%}}
.waveform-pill{display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;box-shadow:none;background-image:none;vertical-align:middle}
.waveform-pill__bars{display:inline-flex;align-items:center;gap:3px;height:16px}
.waveform-pill__bar{display:block;width:2px;border-radius:2px}
.waveform-pill--animated .waveform-pill__bar{animation:waveform-bar 1.1s var(--ease-inout) infinite}
.waveform-pill__label{font-family:'Figtree',system-ui,sans-serif;font-size:12px;font-weight:500;line-height:1;letter-spacing:.02em;white-space:nowrap}
`

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = CSS
  document.head.appendChild(el)
}

const TONES = {
  ink: { background: '#1A1A1A', bar: '#FFA946', text: '#FFFFEB' },
  cream: { background: '#FFFFEB', bar: '#1A1A1A', text: '#1A1A1A' },
}

export default function WaveformPill({ tone = 'ink', label, className = '', style }) {
  injectStyles()
  const reduced = useReducedMotion()
  const palette = TONES[tone] || TONES.ink
  const animated = !reduced

  const classes = [
    'waveform-pill',
    animated ? 'waveform-pill--animated' : 'waveform-pill--static',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      data-tone={TONES[tone] ? tone : 'ink'}
      aria-hidden={label ? undefined : 'true'}
      style={{
        backgroundColor: palette.background,
        border: tone === 'cream' ? '1px solid rgba(26,26,26,.1)' : '1px solid transparent',
        ...style,
      }}
    >
      <span className="waveform-pill__bars" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <span
            key={i}
            className="waveform-pill__bar"
            style={{
              backgroundColor: palette.bar,
              height: `${STATIC_HEIGHTS[i]}%`,
              animationDelay: animated ? `${-i * 90}ms` : undefined,
              animation: animated ? undefined : 'none',
            }}
          />
        ))}
      </span>
      {label ? (
        <span className="waveform-pill__label" style={{ color: palette.text }}>
          {label}
        </span>
      ) : null}
    </span>
  )
}
