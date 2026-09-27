import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const INK = '#1C1B18'
const ACCENT = '#9C5636'
const BG = '#F5F3EE'

const DISPLAY_FONT = "'Space Grotesk', sans-serif"
const BODY_FONT = "'Inter', sans-serif"

// Deterministic pseudo-random from a seed, so node layout is stable.
function seededRandom(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * ProjectNode
 *
 * A single project in the scatter: a dark ink marker with a thin ring.
 * Hovering (pointer over) highlights it in the accent colour and shows an
 * HTML label with the project's real title, subtitle, and tech stack.
 */
function ProjectNode({ project, position, hovered, onHover }) {
  const groupRef = useRef(null)
  const isHovered = hovered === project.id

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    // Gentle idle drift; amplitude kept small for a calm, light scene.
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + project.id * 1.7) * 0.08
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(project.id)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        onHover(null)
        document.body.style.cursor = 'auto'
      }}
    >
      <mesh>
        <octahedronGeometry args={[isHovered ? 0.34 : 0.26, 0]} />
        <meshBasicMaterial color={isHovered ? ACCENT : INK} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.012, 8, 48]} />
        <meshBasicMaterial color={isHovered ? ACCENT : INK} transparent opacity={isHovered ? 0.9 : 0.25} />
      </mesh>
      {isHovered && (
        <Html
          center
          distanceFactor={9}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              backgroundColor: BG,
              border: `1px solid ${INK}33`,
              padding: '0.75rem 0.9rem',
              maxWidth: '16rem',
              fontFamily: BODY_FONT,
              color: INK,
              boxShadow: `0 2px 12px ${INK}1A`,
            }}
          >
            <p
              style={{
                margin: '0 0 0.15rem',
                fontFamily: DISPLAY_FONT,
                fontSize: '0.95rem',
                fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              {project.title}
            </p>
            <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', opacity: 0.75 }}>
              {project.subtitle}
            </p>
            <p style={{ margin: 0, fontSize: '0.65rem', color: ACCENT, lineHeight: 1.5 }}>
              {project.techStack.join(' · ')}
            </p>
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * ProjectNodes
 *
 * Renders all projects as a 3D scatter of ink nodes and flies the camera
 * along a Catmull-Rom path driven by the scroll progress passed in via
 * progressRef (a mutable ref of 0..1). Designed for the light palette:
 * dark ink geometry on #F5F3EE with the single accent #9C5636 for hover
 * states only.
 */
export default function ProjectNodes({ projects = [], progressRef }) {
  const [hovered, setHovered] = useState(null)
  const cameraRef = useRef(null)
  const lookTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const currentLook = useRef(new THREE.Vector3(0, 0, 0))
  const { camera } = useThree()

  // Stable, deterministic scatter positions from project ids.
  const nodes = useMemo(
    () =>
      projects.map((project, index) => {
        const rand = seededRandom(project.id * 7919 + 13)
        const angle = (index / Math.max(projects.length, 1)) * Math.PI * 2
        const radius = 3 + rand() * 3.5
        return {
          project,
          position: [
            Math.cos(angle) * radius + (rand() - 0.5) * 2,
            (rand() - 0.5) * 5,
            Math.sin(angle) * radius - index * 1.6,
          ],
        }
      }),
    [projects],
  )

  // Camera path: a gentle spiral through the scatter.
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 1.5, 14),
          new THREE.Vector3(5, 0.5, 8),
          new THREE.Vector3(2, -1, 2),
          new THREE.Vector3(-3, 0.5, -4),
          new THREE.Vector3(-1, 1.5, -10),
        ],
        false,
        'catmullrom',
        0.5,
      ),
    [],
  )

  const tmpVec = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (!progressRef || !cameraRef) return
    const p = THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1)
    curve.getPointAt(p, tmpVec)
    camera.position.lerp(tmpVec, 0.08)
    // Ease the look-at target toward the scatter centre for a smooth flythrough.
    currentLook.current.lerp(lookTarget, 0.06)
    camera.lookAt(currentLook.current)
  })

  return (
    <group ref={cameraRef}>
      {nodes.map(({ project, position }) => (
        <ProjectNode
          key={project.id}
          project={project}
          position={position}
          hovered={hovered}
          onHover={setHovered}
        />
      ))}
      {/* Faint ink lines connecting consecutive nodes: a constellation feel. */}
      {nodes.length > 1 &&
        nodes.slice(0, -1).map(({ project, position }, index) => {
          const next = nodes[index + 1].position
          const start = new THREE.Vector3(...position)
          const end = new THREE.Vector3(...next)
          const mid = start.clone().add(end).multiplyScalar(0.5)
          const length = start.distanceTo(end)
          const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            end.clone().sub(start).normalize(),
          )
          return (
            <mesh key={`link-${project.id}`} position={mid} quaternion={quat}>
              <cylinderGeometry args={[0.008, 0.008, length, 6]} />
              <meshBasicMaterial color={INK} transparent opacity={0.12} />
            </mesh>
          )
        })}
    </group>
  )
}
