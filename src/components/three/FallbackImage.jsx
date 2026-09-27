const BG = '#1A1A1A'
const CREAM = '#FFFFEB'
const AMBER = '#FFA946'

const WIDTH = 400
const HEIGHT = 225
const COLS = 12
const ROWS = 7
const PAD_X = 32
const PAD_Y = 28
const SEED = 1337

// Seeded PRNG (mulberry32) so the placeholder renders identically every time.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Built once at module load: the output is fixed, so there is no per-render cost.
function buildArt() {
  const rand = mulberry32(SEED)
  const stepX = (WIDTH - PAD_X * 2) / (COLS - 1)
  const stepY = (HEIGHT - PAD_Y * 2) / (ROWS - 1)

  const dots = []
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      dots.push({
        key: `dot-${x}-${y}`,
        cx: PAD_X + x * stepX,
        cy: PAD_Y + y * stepY,
        r: 1.4 + rand() * 0.9,
        opacity: 0.18 + rand() * 0.22,
      })
    }
  }

  const wavePoints = []
  for (let i = 0; i <= 48; i++) {
    const t = i / 48
    const x = 36 + t * (WIDTH - 72)
    const y =
      HEIGHT / 2 +
      Math.sin(t * Math.PI * 3 + 0.4) * 30 +
      Math.cos(t * Math.PI * 6 + 0.8) * 12
    wavePoints.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }

  return { dots, wavePath: `M ${wavePoints.join(' L ')}` }
}

const ART = buildArt()

/**
 * FallbackImage
 *
 * A static, deterministic SVG placeholder used while a 3D scene is loading
 * or when the device cannot render WebGL. Cream and amber strokes on an ink
 * background, drawn entirely inline: no network requests, never blank.
 */
export default function FallbackImage({ alt = '3D scene placeholder' }) {
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
        aria-hidden="true"
        focusable="false"
      >
        <rect width={WIDTH} height={HEIGHT} fill={BG} />
        <g>
          {ART.dots.map((d) => (
            <circle
              key={d.key}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              fill={CREAM}
              opacity={d.opacity}
            />
          ))}
        </g>
        <path
          d={ART.wavePath}
          fill="none"
          stroke={CREAM}
          strokeWidth="1.2"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
        <g transform={`translate(${WIDTH * 0.72}, ${HEIGHT * 0.36})`}>
          <rect
            x={-14}
            y={-14}
            width={28}
            height={28}
            rx={6}
            fill="none"
            stroke={AMBER}
            strokeWidth="2"
            strokeOpacity="0.9"
          />
          <circle cx={0} cy={0} r={5} fill={AMBER} opacity="0.95" />
        </g>
        <path
          d={`M 0 ${HEIGHT} L 0 ${HEIGHT - 48}`}
          stroke={AMBER}
          strokeWidth="3"
          strokeOpacity="0.7"
        />
      </svg>
    </div>
  )
}
