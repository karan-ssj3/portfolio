import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { buildTopology, PLANE_WIDTH, PLANE_HEIGHT } from '../../lib/networkTopology'

const CREAM = '#FFFFEB'
const SHEET_RADIUS = 0.4
const NEURON_RADIUS = 0.06

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

/**
 * DeepLayersScene
 *
 * Base geometry for the Deep Layers centrepiece: translucent sheets, neuron
 * discs and edges. Three draw calls in total. Propagation shaders arrive in
 * V05, camera choreography and labels in V06 (labelsRef and highTier are
 * accepted now so the prop contract stays stable).
 */
// eslint-disable-next-line no-unused-vars
export default function DeepLayersScene({ mobile = false, highTier = false, labelsRef }) {
  const topology = useMemo(() => buildTopology({ mobile }), [mobile])
  const layerCount = topology.layers.length

  const sheetsRef = useRef(null)
  const neuronsRef = useRef(null)

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
  const neuronMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: CREAM }), [])

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

  // Temporary material: V05 replaces it with the propagation ShaderMaterial.
  const edgeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: CREAM,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
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

  // Instance matrices for sheets and neurons.
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
      }
      neurons.instanceMatrix.needsUpdate = true
    }
  }, [topology, layerCount])

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

  useEffect(
    () => () => {
      edgeGeometry.dispose()
      edgeMaterial.dispose()
    },
    [edgeGeometry, edgeMaterial],
  )

  return (
    <group>
      <instancedMesh
        key={`sheets-${layerCount}`}
        ref={sheetsRef}
        args={[sheetGeometry, sheetMaterial, layerCount]}
        frustumCulled={false}
        renderOrder={0}
      />
      <lineSegments geometry={edgeGeometry} material={edgeMaterial} renderOrder={1} />
      <instancedMesh
        key={`neurons-${topology.neuronCount}`}
        ref={neuronsRef}
        args={[neuronGeometry, neuronMaterial, topology.neuronCount]}
        frustumCulled={false}
        renderOrder={2}
      />
    </group>
  )
}
