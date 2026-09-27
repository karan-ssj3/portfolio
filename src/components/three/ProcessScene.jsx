import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import CanvasWrapper from './CanvasWrapper'

const INK = '#1C1B18'
const ACCENT = '#9C5636'

// Parse hex into linear RGB floats once, up front — never index the hex string.
const INK_RGB = [0x1c / 255, 0x1b / 255, 0x18 / 255]
const ACCENT_RGB = [0x9c / 255, 0x56 / 255, 0x36 / 255]

// 5x7 dot matrix font for digits 0-9
const FONT = {
  '0': [
    '11111',
    '10001',
    '10011',
    '10101',
    '11001',
    '10001',
    '11111',
  ],
  '1': [
    '00100',
    '01100',
    '00100',
    '00100',
    '00100',
    '00100',
    '01110',
  ],
  '2': [
    '11111',
    '00001',
    '00001',
    '11111',
    '10000',
    '10000',
    '11111',
  ],
  '3': [
    '11111',
    '00001',
    '00001',
    '11111',
    '00001',
    '00001',
    '11111',
  ],
  '4': [
    '10001',
    '10001',
    '10001',
    '11111',
    '00001',
    '00001',
    '00001',
  ],
  '5': [
    '11111',
    '10000',
    '10000',
    '11111',
    '00001',
    '00001',
    '11111',
  ],
  '6': [
    '11111',
    '10000',
    '10000',
    '11111',
    '10001',
    '10001',
    '11111',
  ],
  '7': [
    '11111',
    '00001',
    '00001',
    '00010',
    '00100',
    '00100',
    '00100',
  ],
  '8': [
    '11111',
    '10001',
    '10001',
    '11111',
    '10001',
    '10001',
    '11111',
  ],
  '9': [
    '11111',
    '10001',
    '10001',
    '11111',
    '00001',
    '00001',
    '11111',
  ],
}

function generateNumberPositions(numberStr) {
  const spacing = 0.22
  const digitWidth = 5 * spacing
  const digitHeight = 7 * spacing
  const gap = 0.18
  const totalWidth = numberStr.length * digitWidth + (numberStr.length - 1) * gap
  const startX = -totalWidth / 2
  const positions = []

  for (let d = 0; d < numberStr.length; d++) {
    const digit = numberStr[d]
    const offsetX = startX + d * (digitWidth + gap)
    const grid = FONT[digit]
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (grid[row][col] === '1') {
          const x = offsetX + col * spacing + spacing / 2
          const y = (6 - row) * spacing + spacing / 2 - digitHeight / 2
          positions.push([x, y, 0])
        }
      }
    }
  }

  // add an accent dot after the number (period)
  positions.push([startX + totalWidth + gap, -digitHeight / 2 + spacing / 2, 0])
  return positions
}

function NumberPointCloud({ number }) {
  const positions = useMemo(() => generateNumberPositions(number), [number])
  const floatArray = useMemo(() => new Float32Array(positions.flat()), [positions])
  const colors = useMemo(() => {
    const arr = new Float32Array(positions.length * 3)
    for (let i = 0; i < positions.length; i++) {
      const isAccent = i === positions.length - 1 // last point is the accent dot
      const rgb = isAccent ? ACCENT_RGB : INK_RGB
      arr[i * 3] = rgb[0]
      arr[i * 3 + 1] = rgb[1]
      arr[i * 3 + 2] = rgb[2]
    }
    return arr
  }, [positions])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length} array={floatArray} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={positions.length} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors />
    </points>
  )
}

function FloatingParticles({ count = 120 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = radius * Math.cos(phi)
    }
    return arr
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={INK} transparent opacity={0.4} />
    </points>
  )
}

function ProcessStepScene({ index }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
      groupRef.current.rotation.x += delta * 0.03
    }
  })

  const numberStr = String(index + 1).padStart(2, '0')

  return (
    <group ref={groupRef}>
      <NumberPointCloud number={numberStr} />
      <FloatingParticles />
    </group>
  )
}

/**
 * ProcessScene
 *
 * Thin wrapper that mounts a per-step ProcessStepScene through the shared
 * CanvasWrapper. The wrapper handles lazy loading, viewport intersection,
 * GPU tier fallback, and reduced-motion fallback to a static image.
 */
export default function ProcessScene({ index }) {
  const scene = useMemo(
    () => () => Promise.resolve({ default: () => <ProcessStepScene index={index} /> }),
    [index],
  )

  return (
    <CanvasWrapper
      scene={scene}
      canvasProps={{ camera: { position: [0, 0, 5], fov: 45 }, gl: { alpha: true } }}
      fallbackAlt={`Process step ${index + 1}`}
    />
  )
}
