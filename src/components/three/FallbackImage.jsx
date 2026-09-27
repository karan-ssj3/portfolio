import { useId } from 'react'

const BG = '#F5F3EE'
const INK = '#1C1B18'
const ACCENT = '#9C5636'

const WIDTH = 400
const HEIGHT = 225
const COLS = 12
const ROWS = 7
const PAD_X = 32
const PAD_Y = 28

/**
 * FallbackImage
 *
 * A static, generative SVG placeholder used while a 3D scene is loading or
 * when the device cannot render WebGL. Uses dark ink on a warm light
 * background with a single accent mark. No photos or video.
 */
export default function FallbackImage({ alt = '3D scene placeholder' }) {
  const id = useId()
  // Strip React id colons to keep it safe for SVG fragment identifiers.
  const safeId = id.replace(/:/g, '')
  const seed = safeId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

  const stepX = (WIDTH - PAD_X * 2) / (COLS - 1)
  const stepY = (HEIGHT - PAD_Y * 2) / (ROWS - 1)

  const dots = []
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cx = PAD_X + x * stepX
      const cy = PAD_Y + y * stepY
      const r = 1.4 + ((seed + x * 7 + y * 13) % 4) * 0.25
      const opacity = 0.1 + ((seed + x + y * 3) % 6) * 0.03
      dots.push(
        <circle
          key={`dot-${x}-${y}`}
          cx={cx}
          cy={cy}
          r={r}
          fill={INK}
          opacity={opacity}
        />,
      )
    }
  }

  const wavePoints = []
  for (let i = 0; i <= 48; i++) {
    const t = i / 48
    const x = 36 + t * (WIDTH - 72)
    const y =
      HEIGHT / 2 +
      Math.sin(t * Math.PI * 3 + seed * 0.01) * 30 +
      Math.cos(t * Math.PI * 6 + seed * 0.02) * 12
    wavePoints.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  const wavePath = `M ${wavePoints.join(' L ')}`

  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: BG,
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`fallback-grad-${safeId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={INK} stopOpacity="0.05" />
            <stop offset="100%" stopColor={INK} stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill={`url(#fallback-grad-${safeId})`} />
        <g>{dots}</g>
        <path
          d={wavePath}
          fill="none"
          stroke={INK}
          strokeWidth="1.2"
          strokeOpacity="0.22"
          strokeLinecap="round"
        />
        <g transform={`translate(${WIDTH * 0.72}, ${HEIGHT * 0.36})`}>
          <rect
            x={-14}
            y={-14}
            width={28}
            height={28}
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeOpacity="0.85"
          />
          <circle cx={0} cy={0} r={5} fill={ACCENT} opacity="0.9" />
        </g>
        <path d={`M 0 ${HEIGHT} L 0 ${HEIGHT - 48}`} stroke={ACCENT} strokeWidth="3" strokeOpacity="0.6" />
      </svg>
    </div>
  )
}
