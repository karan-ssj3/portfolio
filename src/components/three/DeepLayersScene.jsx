import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { buildTopology, PLANE_WIDTH, PLANE_HEIGHT } from '../../lib/networkTopology'
import { store } from '../../lib/trainingStore'
import {
  COLORS,
  edgeVertex,
  edgeFragment,
  pulseVertex,
  pulseFragment,
  makeUniforms,
} from './deepLayers/shaders'

const CREAM = COLORS.base
const SHEET_RADIUS = 0.4
const NEURON_RADIUS = 0.06
const EPOCHS = 40
const LAST_LAYER = 5
const POINTER_RADIUS = 1.2
const NEURON_BAND = 0.08

function roundedRectShape(width, height, radius) {
  const x = -width / 2
  const y = -height / 2
  const r = Math.min(radius, width / 2, height / 2)
  const shape = new THREE.Shape()
  shape.moveTo(x + r, y)
  shape.lineTo(x + width - r, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + r)
  shape.lineTo(x + width, y + height - r)
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  shape.lineTo(x + r, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  return shape
}

function fract(value) {
  return value - Math.floor(value)
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

// Matches the shader: a sweep parked at 0 or 1 is idle.
function sweepGate(head) {
  return head > 0.0001 && head < 0.9999 ? 1 : 0
}

/**
 * DeepLayersScene
 *
 * Deep Layers centrepiece: translucent sheets, neuron discs, propagation
 * edges and forward pulses. Four draw calls in total (Bloom adds its own
 * passes on the high tier only). Camera choreography and labels arrive in
 * V06 (labelsRef is accepted now so the prop contract stays stable).
 */
// eslint-disable-next-line no-unused-vars
export default function DeepLayersScene({ mobile = false, highTier = false, labelsRef }) {
  const topology = useMemo(() => buildTopology({ mobile }), [mobile])
  const layerCount = topology.layers.length

  const sheetsRef = useRef(null)
  const neuronsRef = useRef(null)
  const frameRef = useRef(0)

  const { camera, scene } = useThree()

  const sheetGeometry = useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(PLANE_WIDTH, PLANE_HEIGHT, SHEET_RADIUS), 8),
    [],
  )
  const sheetMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: CREAM,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  )

  const neuronGeometry = useMemo(() => new THREE.CircleGeometry(NEURON_RADIUS, 16), [])
  // Default white material colour, so instanceColor carries the palette hex exactly.
  const neuronMaterial = useMemo(() => new THREE.MeshBasicMaterial(), [])

  const edgeGeometry = useMemo(() => {
    const { edges } = topology
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(edges.positions, 3))
    geometry.setAttribute('aLayer', new THREE.BufferAttribute(edges.aLayer, 1))
    geometry.setAttribute('aInitW', new THREE.BufferAttribute(edges.aInitW, 1))
    geometry.setAttribute('aTargetW', new THREE.BufferAttribute(edges.aTargetW, 1))
    geometry.setAttribute('aEdgeT', new THREE.BufferAttribute(edges.aEdgeT, 1))
    geometry.computeBoundingSphere()
    return geometry
  }, [topology])

  // One uniforms object shared by the edge and pulse programs.
  const uniforms = useMemo(() => makeUniforms(), [])

  const edgeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: edgeVertex,
        fragmentShader: edgeFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  )

  const pulseMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: pulseVertex,
        fragmentShader: pulseFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  )

  // Scratch objects for per-frame work, allocated once.
  const scratch = useMemo(
    () => ({
      cream: new THREE.Color(COLORS.base),
      amber: new THREE.Color(COLORS.forward),
      color: new THREE.Color(),
      raycaster: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      hit: new THREE.Vector3(),
      layerGlow: new Float32Array(8),
    }),
    [],
  )

  // Transparent background so the ink slab shows through; static camera.
  useLayoutEffect(() => {
    scene.background = null
    camera.position.set(0, 1.2, 12)
    if (camera.isPerspectiveCamera) {
      camera.fov = mobile ? 55 : 45
      camera.updateProjectionMatrix()
    }
    camera.lookAt(0, 0, 0)
  }, [camera, scene, mobile])

  // Instance matrices for sheets and neurons, plus initial neuron colours.
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()

    const sheets = sheetsRef.current
    if (sheets) {
      for (let l = 0; l < layerCount; l += 1) {
        dummy.position.set(0, 0, topology.layerZ[l])
        dummy.updateMatrix()
        sheets.setMatrixAt(l, dummy.matrix)
      }
      sheets.instanceMatrix.needsUpdate = true
    }

    const neurons = neuronsRef.current
    if (neurons) {
      const positions = topology.neurons
      for (let i = 0; i < topology.neuronCount; i += 1) {
        dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
        dummy.updateMatrix()
        neurons.setMatrixAt(i, dummy.matrix)
        neurons.setColorAt(i, scratch.cream)
      }
      neurons.instanceMatrix.needsUpdate = true
      if (neurons.instanceColor) neurons.instanceColor.needsUpdate = true
      neuronMaterial.needsUpdate = true
    }

    scratch.plane.constant = -topology.layerZ[0]
  }, [topology, layerCount, scratch, neuronMaterial])

  useFrame((state, rawDelta) => {
    if (!store.inView) return

    const delta = Math.min(rawDelta, 0.1)
    const u = uniforms

    u.uTime.value += delta
    u.uDpr.value = state.gl.getPixelRatio()
    u.uEpoch.value = THREE.MathUtils.damp(u.uEpoch.value, store.epoch, 6, delta)

    // Forward then backward sweep inside each epoch; slow idle loop once trained.
    if (store.epoch >= EPOCHS) {
      u.uForward.value = fract(u.uTime.value * 0.25)
      u.uBackward.value = 0
    } else {
      const cyc = fract(store.epoch)
      u.uForward.value = clamp01(cyc * 2)
      u.uBackward.value = clamp01(cyc * 2 - 1)
    }

    // Pointer: project NDC (-1..1, y up) onto the L0 plane.
    let pointerHit = false
    if (store.pointer.active) {
      scratch.ndc.set(store.pointer.x, store.pointer.y)
      scratch.raycaster.setFromCamera(scratch.ndc, state.camera)
      if (scratch.raycaster.ray.intersectPlane(scratch.plane, scratch.hit)) {
        pointerHit = true
        u.uPointer.value.set(scratch.hit.x, scratch.hit.y)
      }
    }
    u.uPointerActive.value = THREE.MathUtils.damp(
      u.uPointerActive.value,
      pointerHit ? 1 : 0,
      10,
      delta,
    )

    // Neuron brightness every 2nd frame: cream to amber by forward-band proximity.
    frameRef.current += 1
    if (frameRef.current % 2 !== 0) return
    const neurons = neuronsRef.current
    if (!neurons || !neurons.instanceColor) return

    const head = u.uForward.value
    const gate = sweepGate(head)
    for (let l = 0; l < layerCount; l += 1) {
      const distance = Math.abs(l / LAST_LAYER - head)
      scratch.layerGlow[l] = gate * (1 - THREE.MathUtils.smoothstep(distance, 0, NEURON_BAND))
    }

    const positions = topology.neurons
    const layerOf = topology.neuronLayer
    const pointerStrength = u.uPointerActive.value
    const px = u.uPointer.value.x
    const py = u.uPointer.value.y
    for (let i = 0; i < topology.neuronCount; i += 1) {
      const l = layerOf[i]
      let glow = scratch.layerGlow[l]
      if (l === 0 && pointerStrength > 0.01) {
        const dx = positions[i * 3] - px
        const dy = positions[i * 3 + 1] - py
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < POINTER_RADIUS) glow += (1 - d / POINTER_RADIUS) * pointerStrength
      }
      scratch.color.lerpColors(scratch.cream, scratch.amber, clamp01(glow))
      neurons.setColorAt(i, scratch.color)
    }
    neurons.instanceColor.needsUpdate = true
  })

  // Dispose GPU resources on unmount or when the topology changes.
  useEffect(
    () => () => {
      sheetGeometry.dispose()
      sheetMaterial.dispose()
      neuronGeometry.dispose()
      neuronMaterial.dispose()
    },
    [sheetGeometry, sheetMaterial, neuronGeometry, neuronMaterial],
  )

  useEffect(() => () => edgeGeometry.dispose(), [edgeGeometry])

  useEffect(
    () => () => {
      edgeMaterial.dispose()
      pulseMaterial.dispose()
    },
    [edgeMaterial, pulseMaterial],
  )

  return (
    <>
      <group>
        <instancedMesh
          key={`sheets-${layerCount}`}
          ref={sheetsRef}
          args={[sheetGeometry, sheetMaterial, layerCount]}
          frustumCulled={false}
          renderOrder={0}
        />
        <lineSegments geometry={edgeGeometry} material={edgeMaterial} renderOrder={1} />
        <points geometry={edgeGeometry} material={pulseMaterial} renderOrder={2} />
        <instancedMesh
          key={`neurons-${topology.neuronCount}`}
          ref={neuronsRef}
          args={[neuronGeometry, neuronMaterial, topology.neuronCount]}
          frustumCulled={false}
          renderOrder={3}
        />
      </group>
      {highTier && (
        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.2} mipmapBlur />
        </EffectComposer>
      )}
    </>
  )
}
