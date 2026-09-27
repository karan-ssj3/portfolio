import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CanvasWrapper from './CanvasWrapper'

const POINT_COUNT = 80
const CONNECTION_COUNT = 120
const RADIUS = 1.2

// Deterministic PRNG so the geometry is stable across mounts.
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function InnerGlobeScene() {
  const groupRef = useRef()

  const { nodeGeometry, lineGeometry } = useMemo(() => {
    const rand = mulberry32(20260927)

    const positions = new Float32Array(POINT_COUNT * 3)
    const colors = new Float32Array(POINT_COUNT * 3)
    const ink = new THREE.Color('#1C1B18')
    const accent = new THREE.Color('#9C5636')

    const pts = []
    for (let i = 0; i < POINT_COUNT; i++) {
      const theta = rand() * Math.PI * 2
      const phi = Math.acos(2 * rand() - 1)
      const x = RADIUS * Math.sin(phi) * Math.cos(theta)
      const y = RADIUS * Math.sin(phi) * Math.sin(theta)
      const z = RADIUS * Math.cos(phi)
      pts.push(new THREE.Vector3(x, y, z))
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      const c = i % 7 === 0 ? accent : ink
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const nodeGeo = new THREE.BufferGeometry()
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Merge all connection segments into one geometry (single draw call).
    const segmentPoints = []
    const usedPairs = new Set()
    let added = 0
    while (added < CONNECTION_COUNT) {
      const a = Math.floor(rand() * POINT_COUNT)
      const b = Math.floor(rand() * POINT_COUNT)
      if (a === b) continue
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      if (usedPairs.has(key)) continue
      usedPairs.add(key)
      segmentPoints.push(pts[a], pts[b])
      added++
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(segmentPoints)

    return { nodeGeometry: nodeGeo, lineGeometry: lineGeo }
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
      groupRef.current.rotation.x += delta * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#1C1B18" opacity={0.15} transparent />
      </lineSegments>
      <points geometry={nodeGeometry}>
        <pointsMaterial
          size={0.05}
          vertexColors
          sizeAttenuation
          color="#1C1B18"
        />
      </points>
    </group>
  )
}

export default function GlobeScene() {
  const scene = useMemo(() => () => Promise.resolve({ default: InnerGlobeScene }), [])
  return (
    <CanvasWrapper
      scene={scene}
      canvasProps={{ camera: { position: [0, 0, 2.5], fov: 45 }, gl: { alpha: true } }}
      fallbackAlt="3D globe network"
    />
  )
}
