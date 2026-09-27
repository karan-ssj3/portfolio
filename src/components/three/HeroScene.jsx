import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollContext } from '../../providers/ScrollProvider'

const INK = '#1C1B18'
const ACCENT = '#9C5636'
const BG = '#F5F3EE'

const PARTICLE_COUNT = 220
const CONNECTION_RADIUS = 0.85
const MAX_CONNECTIONS_PER_NODE = 4
const FIELD_RADIUS = 6

/**
 * HeroScene
 *
 * A 3D particle / neural-net field rendered with dark ink points and
 * connecting lines on a warm light background, with a single subtle
 * accent node. Designed for the light palette — no neon, no black.
 *
 * Scroll-driven camera drift is applied only when the GPU tier is high
 * AND reduced motion is false (gated by the parent Hero component). When
 * the scene is mounted, this component still respects reduced motion by
 * holding the camera steady.
 */
export default function HeroScene() {
  const { reducedMotion } = useScrollContext()
  const { camera } = useThree()
  const groupRef = useRef(null)
  const linesRef = useRef(null)
  const scrollStateRef = useRef({ progress: 0, target: 0 })

  // Deterministic seeded RNG so the field is stable across renders.
  const rng = useMemo(() => {
    let seed = 1337
    return () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
  }, [])

  // Generate particle positions in a soft spherical cloud.
  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const seeds = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spherical distribution biased toward the equatorial plane.
      const theta = rng() * Math.PI * 2
      const phi = Math.acos(2 * rng() - 1) * 0.6 + Math.PI * 0.2
      const r = Math.pow(rng(), 0.6) * FIELD_RADIUS
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.7
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      seeds[i] = rng()
    }
    return { positions, seeds }
  }, [rng])

  // Pre-compute connection pairs (edges) between nearby particles.
  const edges = useMemo(() => {
    const pairs = []
    const { positions } = particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = positions[i * 3]
      const iy = positions[i * 3 + 1]
      const iz = positions[i * 3 + 2]
      let count = 0
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        if (count >= MAX_CONNECTIONS_PER_NODE) break
        const jx = positions[j * 3]
        const jy = positions[j * 3 + 1]
        const jz = positions[j * 3 + 2]
        const dx = ix - jx
        const dy = iy - jy
        const dz = iz - jz
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < CONNECTION_RADIUS) {
          pairs.push(i, j)
          count++
        }
      }
    }
    return new Uint16Array(pairs)
  }, [particles])

  // Build a buffer geometry for the connection lines.
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(edges.length * 3)
    const { positions: particlePositions } = particles
    for (let k = 0; k < edges.length; k++) {
      const idx = edges[k]
      positions[k * 3] = particlePositions[idx * 3]
      positions[k * 3 + 1] = particlePositions[idx * 3 + 1]
      positions[k * 3 + 2] = particlePositions[idx * 3 + 2]
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [edges, particles])

  // Track scroll progress for camera drift. We listen directly to the
  // window so the scene works regardless of which scroll library is in use.
  useMemo(() => {
    if (typeof window === 'undefined') return
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      scrollStateRef.current.target = progress
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame((state, delta) => {
    // Smoothly approach the target scroll progress.
    const lerp = 1 - Math.pow(0.001, delta)
    scrollStateRef.current.progress +=
      (scrollStateRef.current.target - scrollStateRef.current.progress) * lerp

    const progress = scrollStateRef.current.progress

    if (groupRef.current) {
      // Gentle ambient rotation, paused when reduced motion is requested.
      if (!reducedMotion) {
        groupRef.current.rotation.y += delta * 0.04
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
      }
    }

    if (!reducedMotion) {
      // Scroll-driven camera drift: subtle dolly + arc.
      const driftX = Math.sin(progress * Math.PI * 1.5) * 1.2
      const driftY = progress * 1.4 - 0.4
      const driftZ = 6 - progress * 1.8
      camera.position.x += (driftX - camera.position.x) * lerp
      camera.position.y += (driftY - camera.position.y) * lerp
      camera.position.z += (driftZ - camera.position.z) * lerp
      camera.lookAt(0, 0, 0)
    } else {
      // Hold a calm, fixed framing.
      camera.position.set(0, 0, 6)
      camera.lookAt(0, 0, 0)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Connection lines — dark ink, low opacity */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={INK}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </lineSegments>

      {/* Particles — dark ink points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
            count={PARTICLE_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          color={INK}
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>

      {/* Single accent node — the focal point of the field */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.9} />
      </mesh>

      {/* Faint accent ring around the focal node */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.2, 48]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* Background plane to ensure the warm paper tone reads through */}
      <mesh position={[0, 0, -FIELD_RADIUS - 1]}>
        <planeGeometry args={[FIELD_RADIUS * 6, FIELD_RADIUS * 6]} />
        <meshBasicMaterial color={BG} />
      </mesh>
    </group>
  )
}
