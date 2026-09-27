/**
 * networkTopology
 *
 * Deterministic topology for the Deep Layers centrepiece. Everything is
 * derived from a seeded mulberry32 PRNG so the network is identical on every
 * load and every device class.
 */

const SEED = 1337

const DESKTOP_LAYERS = [64, 48, 32, 32, 16, 6]
const MOBILE_LAYERS = [36, 24, 16, 16, 10, 6]
const DESKTOP_INPUT_SIDE = 8
const MOBILE_INPUT_SIDE = 6

export const PLANE_WIDTH = 6
export const PLANE_HEIGHT = 4
const INNER_WIDTH = 5
const INNER_HEIGHT = 3
const Z_MIN = -5
const Z_MAX = 5

const SUCCESSORS = 4
const NEAREST = 2
const STRONG_SHARE = 0.2

function mulberry32(seed) {
  let a = seed >>> 0
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Pick a cols x rows grid whose aspect is close to the plane and wastes few cells.
function gridDims(count) {
  const targetAspect = INNER_WIDTH / INNER_HEIGHT
  let best = [count, 1]
  let bestScore = Infinity
  for (let cols = 1; cols <= count; cols += 1) {
    const rows = Math.ceil(count / cols)
    const score = Math.abs(cols / rows - targetAspect) + (cols * rows - count) * 0.2
    if (score < bestScore) {
      bestScore = score
      best = [cols, rows]
    }
  }
  return best
}

function layoutLayer(count, cols, rows, z, out, offset) {
  const dx = cols > 1 ? INNER_WIDTH / (cols - 1) : 0
  const dy = rows > 1 ? INNER_HEIGHT / (rows - 1) : 0
  let index = 0
  for (let r = 0; r < rows; r += 1) {
    const rowCount = Math.min(cols, count - r * cols)
    for (let c = 0; c < rowCount; c += 1) {
      const i = (offset + index) * 3
      out[i] = (c - (rowCount - 1) / 2) * dx
      out[i + 1] = ((rows - 1) / 2 - r) * dy
      out[i + 2] = z
      index += 1
    }
  }
}

/**
 * Build the seeded network topology.
 *
 * Returns neuron positions, per-neuron layer indices, per-vertex edge
 * attributes (2 vertices per edge) and the 6 output neuron positions.
 */
export function buildTopology({ mobile = false } = {}) {
  const rand = mulberry32(SEED)
  const layers = mobile ? MOBILE_LAYERS : DESKTOP_LAYERS
  const inputSide = mobile ? MOBILE_INPUT_SIDE : DESKTOP_INPUT_SIDE
  const layerCount = layers.length

  const layerStart = []
  let total = 0
  for (let l = 0; l < layerCount; l += 1) {
    layerStart.push(total)
    total += layers[l]
  }

  const layerZ = layers.map((_, l) => Z_MIN + ((Z_MAX - Z_MIN) * l) / (layerCount - 1))

  // Neurons: centred grid on each plane.
  const neurons = new Float32Array(total * 3)
  const neuronLayer = new Uint8Array(total)
  for (let l = 0; l < layerCount; l += 1) {
    const count = layers[l]
    const [cols, rows] = l === 0 ? [inputSide, inputSide] : gridDims(count)
    layoutLayer(count, cols, rows, layerZ[l], neurons, layerStart[l])
    neuronLayer.fill(l, layerStart[l], layerStart[l] + count)
  }

  // Edges: 2 nearest successors plus 2 random, deduplicated.
  const edgeSrc = []
  const edgeDst = []
  for (let l = 0; l < layerCount - 1; l += 1) {
    const nextStart = layerStart[l + 1]
    const nextCount = layers[l + 1]
    for (let i = layerStart[l]; i < layerStart[l] + layers[l]; i += 1) {
      const sx = neurons[i * 3]
      const sy = neurons[i * 3 + 1]
      const order = []
      for (let j = 0; j < nextCount; j += 1) {
        const n = nextStart + j
        const ddx = neurons[n * 3] - sx
        const ddy = neurons[n * 3 + 1] - sy
        order.push({ n, d: ddx * ddx + ddy * ddy })
      }
      order.sort((a, b) => a.d - b.d || a.n - b.n)

      const chosen = new Set()
      for (let k = 0; k < NEAREST && k < order.length; k += 1) chosen.add(order[k].n)
      const wanted = Math.min(SUCCESSORS, nextCount)
      while (chosen.size < wanted) {
        chosen.add(nextStart + Math.floor(rand() * nextCount))
      }

      chosen.forEach((n) => {
        edgeSrc.push(i)
        edgeDst.push(n)
      })
    }
  }

  const edgeCount = edgeSrc.length

  // Initial weights: equal-ish, noisy.
  const initW = new Float32Array(edgeCount)
  for (let e = 0; e < edgeCount; e += 1) initW[e] = 0.2 + rand() * 0.4

  // Neurons reachable from the input layer (edges are ordered by layer).
  const reachable = new Uint8Array(total)
  for (let i = 0; i < layers[0]; i += 1) reachable[i] = 1
  const incoming = Array.from({ length: total }, () => [])
  for (let e = 0; e < edgeCount; e += 1) {
    incoming[edgeDst[e]].push(e)
    if (reachable[edgeSrc[e]]) reachable[edgeDst[e]] = 1
  }

  // Strong paths: trace seeded backward walks from each output to L0.
  const strong = new Uint8Array(edgeCount)
  const strongTarget = Math.round(edgeCount * STRONG_SHARE)
  const outputStart = layerStart[layerCount - 1]
  const outputCount = layers[layerCount - 1]
  let strongCount = 0
  let iteration = 0
  const maxIterations = edgeCount * 4
  while (strongCount < strongTarget && iteration < maxIterations) {
    let current = outputStart + (iteration % outputCount)
    while (neuronLayer[current] > 0) {
      const candidates = incoming[current].filter((e) => reachable[edgeSrc[e]])
      if (candidates.length === 0) break
      const e = candidates[Math.floor(rand() * candidates.length)]
      if (!strong[e]) {
        strong[e] = 1
        strongCount += 1
      }
      current = edgeSrc[e]
    }
    iteration += 1
  }

  const targetW = new Float32Array(edgeCount)
  for (let e = 0; e < edgeCount; e += 1) {
    targetW[e] = strong[e] ? 0.8 + rand() * 0.2 : rand() * 0.15
  }

  // Per-vertex attributes, 2 vertices per edge.
  const positions = new Float32Array(edgeCount * 6)
  const aLayer = new Float32Array(edgeCount * 2)
  const aInitW = new Float32Array(edgeCount * 2)
  const aTargetW = new Float32Array(edgeCount * 2)
  const aEdgeT = new Float32Array(edgeCount * 2)
  for (let e = 0; e < edgeCount; e += 1) {
    const s = edgeSrc[e] * 3
    const d = edgeDst[e] * 3
    const p = e * 6
    positions[p] = neurons[s]
    positions[p + 1] = neurons[s + 1]
    positions[p + 2] = neurons[s + 2]
    positions[p + 3] = neurons[d]
    positions[p + 4] = neurons[d + 1]
    positions[p + 5] = neurons[d + 2]

    const v = e * 2
    const layer = neuronLayer[edgeSrc[e]]
    aLayer[v] = layer
    aLayer[v + 1] = layer
    aInitW[v] = initW[e]
    aInitW[v + 1] = initW[e]
    aTargetW[v] = targetW[e]
    aTargetW[v + 1] = targetW[e]
    aEdgeT[v] = 0
    aEdgeT[v + 1] = 1
  }

  const outputPositions = []
  for (let i = outputStart; i < outputStart + outputCount; i += 1) {
    outputPositions.push({ x: neurons[i * 3], y: neurons[i * 3 + 1], z: neurons[i * 3 + 2] })
  }

  return {
    neurons,
    neuronLayer,
    neuronCount: total,
    layers: layers.slice(),
    layerStart,
    layerZ,
    edges: {
      count: edgeCount,
      positions,
      aLayer,
      aInitW,
      aTargetW,
      aEdgeT,
    },
    outputPositions,
  }
}

export default buildTopology
