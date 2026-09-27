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

// Camera choreography: frontal and wide, oblique dolly into the sheets,
// alongside them, elevated three-quarter view, then a pull back.
const CAMERA_PATH = [
  [0, 1.2, 12],
  [3.5, 1.8, 6],
  [4.5, 0.8, 0],
  [3, 4, -2],
  [0, 3, 11],
]
const CAMERA_LAMBDA = 4
const LABEL_MARGIN = 8
const LABEL_LIFT = 18

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

// When a label is wider than the usable span (very narrow stages), centre it
// rather than letting it slide off one edge.
function clampRange(value, min, max) {
  if (min > max) return (min + max) / 2
  return Math.min(max, Math.max(min, value))
}

// Scroll progress to curve parameter: clamped onto the curve's 0..1 range.
function remap(progress) {
  return clamp01(progress)
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
 * passes on the high tier only). The camera follows a scroll-driven path and
 * the six output positions are projected onto DOM labels every 3rd frame.
 */
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

  const cameraCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CAMERA_PATH.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        false,
        'centripetal',
      ),
    [],
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
      camTarget: new THREE.Vector3(),
      lookFrom: new THREE.Vector3(),
      lookTo: new THREE.Vector3(),
      look: new THREE.Vector3(0, 0, 0),
      proj: new THREE.Vector3(),
      view: new THREE.Vector3(),
    }),
    [],
  )

  // Transparent background so the ink slab shows through; initial camera pose.
  useLayoutEffect(() => {
    scene.background = null
    camera.position.set(...CAMERA_PATH[0])
    if (camera.isPerspectiveCamera) {
      camera.fov = mobile ? 55 : 45
      camera.updateProjectionMatrix()
    }
    scratch.look.set(0, 0, 0)
    camera.lookAt(scratch.look)
  }, [camera, scene, mobile, scratch])

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

    // Layers are centred on the z axis, so their centres are (0, 0, z).
    scratch.plane.constant = -topology.layerZ[0]
    scratch.lookFrom.set(0, 0, topology.layerZ[0])
    scratch.lookTo.set(0, 0, topology.layerZ[layerCount - 1])
  }, [topology, layerCount, scratch, neuronMaterial])

  useFrame((state, rawDelta) => {
    if (!store.inView) return

    const delta = Math.min(rawDelta, 0.1)
    const u = uniforms
    const cam = state.camera

    // Camera path: position damps to the curve, lookAt lerps L0 to L5.
    const t = remap(store.progress)
    cameraCurve.getPoint(t, scratch.camTarget)
    cam.position.x = THREE.MathUtils.damp(cam.position.x, scratch.camTarget.x, CAMERA_LAMBDA, delta)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, scratch.camTarget.y, CAMERA_LAMBDA, delta)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, scratch.camTarget.z, CAMERA_LAMBDA, delta)
    scratch.look.lerpVectors(scratch.lookFrom, scratch.lookTo, t)
    cam.lookAt(scratch.look)
    cam.updateMatrixWorld()

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
      scratch.raycaster.setFromCamera(scratch.ndc, cam)
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

    frameRef.current += 1

    // Role labels every 3rd frame: project outputs to screen, clamp inside the stage.
    if (frameRef.current % 3 === 0 && Array.isArray(labelsRef)) {
      const { width, height } = state.size
      const outputs = topology.outputPositions
      for (let k = 0; k < outputs.length; k += 1) {
        const el = labelsRef[k]?.current
        if (!el) continue
        const o = outputs[k]
        scratch.view.set(o.x, o.y, o.z).applyMatrix4(cam.matrixWorldInverse)
        if (scratch.view.z > -cam.near) {
          el.style.visibility = 'hidden'
          continue
        }
        scratch.proj.set(o.x, o.y, o.z).project(cam)
        const w = el.offsetWidth
        const h = el.offsetHeight
        const cx = clampRange(
          (scratch.proj.x * 0.5 + 0.5) * width,
          w / 2 + LABEL_MARGIN,
          width - w / 2 - LABEL_MARGIN,
        )
        const cy = clampRange(
          (-scratch.proj.y * 0.5 + 0.5) * height - LABEL_LIFT,
          h / 2 + LABEL_MARGIN,
          height - h / 2 - LABEL_MARGIN,
        )
        el.style.transform = `translate3d(${(cx - w / 2).toFixed(1)}px, ${(cy - h / 2).toFixed(1)}px, 0)`
        el.style.visibility = 'visible'
      }
    }

    // Neuron brightness every 2nd frame: cream to amber by forward-band proximity.
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
