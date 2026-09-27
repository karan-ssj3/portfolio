/**
 * DeepLayersFallback
 *
 * Static, deterministic SVG of the trained network, used under reduced
 * motion, on low GPU tiers (including headless SwiftShader) and when the
 * scene fails. Six sampled columns, strong paths in amber, faint cream
 * edges elsewhere, the six role labels and a completed loss curve.
 */

const CREAM = '#FFFFEB'
const AMBER = '#FFA946'
const CORAL = '#FF6C4C'

const ROLES = [
  'Data Analyst',
  'Business Analyst',
  'Solution Architect',
  'AI Engineer',
  'ML Engineer',
  'Data Engineer',
]

// Sampled from the desktop counts 64, 48, 32, 32, 16, 6.
const COLUMN_COUNTS = [12, 10, 8, 8, 6, 6]
const COLUMN_X = [120, 270, 420, 570, 720, 870]
const NET_TOP = 60
const NET_SPAN = 360
const FONT = "'Figtree', system-ui, sans-serif"

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

function buildNetwork() {
  const rand = mulberry32(1337)

  const columns = COLUMN_COUNTS.map((count, c) =>
    Array.from({ length: count }, (_, j) => ({
      x: COLUMN_X[c],
      y: NET_TOP + (j + 0.5) * (NET_SPAN / count),
    })),
  )

  const edges = new Map()
  const addEdge = (c, a, b) => {
    const key = `${c}:${a}:${b}`
    if (!edges.has(key)) edges.set(key, { c, a, b, strong: false })
    return edges.get(key)
  }

  for (let c = 0; c < columns.length - 1; c += 1) {
    const n = columns[c].length
    const m = columns[c + 1].length
    for (let j = 0; j < n; j += 1) {
      const nearest = Math.min(m - 1, Math.max(0, Math.round(((j + 0.5) / n) * m - 0.5)))
      addEdge(c, j, nearest)
      addEdge(c, j, Math.floor(rand() * m))
      addEdge(c, j, Math.floor(rand() * m))
    }
  }

  // Two strong pathways into each output, traced backwards to the inputs.
  const strongNodes = new Set()
  for (let k = 0; k < ROLES.length; k += 1) {
    for (let pass = 0; pass < 2; pass += 1) {
      let b = k
      strongNodes.add(`5:${b}`)
      for (let c = columns.length - 2; c >= 0; c -= 1) {
        const a = Math.floor(rand() * columns[c].length)
        addEdge(c, a, b).strong = true
        strongNodes.add(`${c}:${a}`)
        b = a
      }
    }
  }

  const list = Array.from(edges.values()).map((edge) => ({
    ...edge,
    from: columns[edge.c][edge.a],
    to: columns[edge.c + 1][edge.b],
  }))

  return {
    columns,
    weak: list.filter((edge) => !edge.strong),
    strong: list.filter((edge) => edge.strong),
    strongNodes,
  }
}

function buildLossCurve() {
  const rand = mulberry32(40)
  const x0 = 64
  const x1 = 356
  const yTop = 500
  const yBottom = 566
  const maxLoss = 2.5
  const train = []
  const val = []
  for (let e = 0; e <= 40; e += 1) {
    const noise = (rand() * 2 - 1) * 0.04 * Math.exp(-e / 20)
    const t = 0.08 + 2.2 * Math.exp(-e / 9) + noise
    const v = t + 0.05 + 0.1 * Math.exp(-e / 12)
    const x = x0 + (e / 40) * (x1 - x0)
    train.push([x, yBottom - (t / maxLoss) * (yBottom - yTop)])
    val.push([x, yBottom - (v / maxLoss) * (yBottom - yTop)])
  }
  return { train, val }
}

const NETWORK = buildNetwork()
const LOSS = buildLossCurve()

const toPoints = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

// Accessible name comes from <title>; the surrounding CanvasWrapper carries
// its own aria-label, so no aria-label is set here to avoid a duplicate.
export default function DeepLayersFallback({ title }) {
  const { columns, weak, strong, strongNodes } = NETWORK
  const head = LOSS.train[LOSS.train.length - 1]
  const outputs = columns[columns.length - 1]

  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '100%' }}
    >
      {title && <title>{title}</title>}

      <g strokeWidth="1.5" strokeLinecap="round">
        {weak.map((edge) => (
          <line
            key={`w-${edge.c}-${edge.a}-${edge.b}`}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke={CREAM}
            strokeOpacity="0.08"
          />
        ))}
        {strong.map((edge) => (
          <line
            key={`s-${edge.c}-${edge.a}-${edge.b}`}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke={AMBER}
            strokeOpacity="0.6"
            strokeWidth="2.5"
          />
        ))}
      </g>

      <g>
        {columns.slice(0, -1).map((column, c) =>
          column.map((node, j) => (
            <circle
              key={`n-${c}-${j}`}
              cx={node.x}
              cy={node.y}
              r="6"
              fill={CREAM}
              fillOpacity={strongNodes.has(`${c}:${j}`) ? 1 : 0.55}
            />
          )),
        )}
        {outputs.map((node, k) => (
          <circle
            key={`o-${k}`}
            cx={node.x}
            cy={node.y}
            r="10"
            fill={CREAM}
            stroke={AMBER}
            strokeWidth="3"
          />
        ))}
      </g>

      <g fontFamily={FONT} fontSize="24" fontWeight="500" fill={CREAM}>
        {outputs.map((node, k) => (
          <text key={ROLES[k]} x={node.x + 26} y={node.y + 8}>
            {ROLES[k]}
          </text>
        ))}
      </g>

      <g>
        <rect
          x="40"
          y="452"
          width="340"
          height="130"
          rx="18"
          fill="none"
          stroke={CREAM}
          strokeOpacity="0.15"
        />
        <text x="60" y="482" fontFamily={FONT} fontSize="16" fill={CREAM} fillOpacity="0.6">
          Illustrative training run
        </text>
        <text
          x="360"
          y="482"
          textAnchor="end"
          fontFamily={FONT}
          fontSize="16"
          fill={CREAM}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          Epoch 40 / 40
        </text>
        <line x1="64" y1="566" x2="356" y2="566" stroke={CREAM} strokeOpacity="0.15" />
        <line x1="64" y1="496" x2="64" y2="566" stroke={CREAM} strokeOpacity="0.15" />
        <polyline
          points={toPoints(LOSS.val)}
          fill="none"
          stroke={CREAM}
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <polyline points={toPoints(LOSS.train)} fill="none" stroke={CREAM} strokeWidth="2" />
        <circle cx={head[0]} cy={head[1]} r="5" fill={CORAL} />
      </g>
    </svg>
  )
}
