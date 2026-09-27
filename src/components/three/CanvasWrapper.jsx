import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import useGPU from '../../hooks/useGPU'
import useReducedMotion from '../../hooks/useReducedMotion'
import useLazy3D from '../../hooks/useLazy3D'
import FallbackImage from './FallbackImage'
import SceneErrorBoundary from './SceneErrorBoundary'

// Loaded on demand so three.js never lands in the main chunk.
const Canvas = lazy(() => import('./R3FCanvas'))

const INTERACTION_EVENTS = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown']

// True on devices where a full-resolution canvas costs too much main-thread time.
function isConstrainedDevice() {
  if (typeof navigator === 'undefined') return true
  const cores = navigator.hardwareConcurrency
  const memory = navigator.deviceMemory
  const saveData = navigator.connection && navigator.connection.saveData
  return (
    (typeof cores === 'number' && cores <= 4) ||
    (typeof memory === 'number' && memory <= 4) ||
    Boolean(saveData)
  )
}

function scheduleIdle(callback) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1500 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 200)
  return () => clearTimeout(id)
}

/**
 * CanvasWrapper
 *
 * Lazy-loads a 3D scene chunk and mounts the R3F <Canvas> only on demand:
 * after the first user interaction, once the wrapper is within one viewport,
 * and when the browser is idle. Until then (and on low-GPU devices or under
 * reduced motion) the static fallback renders in the same box, so nothing
 * shifts. Any error thrown by the scene is contained by SceneErrorBoundary.
 *
 * `sceneProps` are forwarded to the scene component rendered inside the
 * Canvas, merged with `inView` so scenes may early-return while off-screen.
 * `fallback` optionally overrides the default static image.
 */
export default function CanvasWrapper({
  scene,
  sceneProps = {},
  className = '',
  style,
  canvasProps = {},
  fallback,
  fallbackAlt = '3D scene placeholder',
}) {
  const gpuTier = useGPU()
  const reducedMotion = useReducedMotion()
  const wrapperRef = useRef(null)

  const [inView, setInView] = useState(false)
  const [near, setNear] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const [shouldMount, setShouldMount] = useState(false)

  const isLowGPU = gpuTier === 'low'
  const canRender3D = !reducedMotion && !isLowGPU

  const { Component: LazyScene, load, error: loadError } = useLazy3D(scene)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    if (loadError) {
      // eslint-disable-next-line no-console
      console.error('CanvasWrapper: failed to load 3D scene chunk', loadError)
    }
  }, [loadError])

  // (a) First user interaction.
  useEffect(() => {
    if (!canRender3D || interacted) return
    const onInteract = () => {
      setInteracted(true)
      INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, onInteract))
    }
    INTERACTION_EVENTS.forEach((type) =>
      window.addEventListener(type, onInteract, { passive: true, once: true }),
    )
    return () => {
      INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, onInteract))
    }
  }, [canRender3D, interacted])

  // (b) Within one viewport of the section.
  useEffect(() => {
    if (!canRender3D) return
    const element = wrapperRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: '100% 0px', threshold: 0 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [canRender3D])

  // Visibility for opacity and scene early-returns.
  useEffect(() => {
    if (!canRender3D) return
    const element = wrapperRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px', threshold: 0 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [canRender3D])

  // (c) Idle: only then request the chunks.
  useEffect(() => {
    if (!canRender3D || shouldMount || !interacted || !near) return
    return scheduleIdle(() => {
      setShouldMount(true)
      loadRef.current()
    })
  }, [canRender3D, shouldMount, interacted, near])

  // Cap pixel ratio by device capability to keep scripting and fill cost low.
  const [dpr] = useState(() => (isConstrainedDevice() ? [1, 1.25] : [1, 1.75]))

  const show3D = canRender3D && shouldMount && !loadError && Boolean(LazyScene)

  const fallbackNode = fallback ?? <FallbackImage alt={fallbackAlt} />

  return (
    <div
      ref={wrapperRef}
      className={`canvas-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '16rem',
        outline: 'none',
        ...style,
      }}
      tabIndex={0}
      aria-label={show3D ? 'Interactive 3D scene' : fallbackAlt}
    >
      <style>{`.canvas-wrapper:focus-visible { outline: 3px solid #F0D7FF; outline-offset: 4px; }`}</style>
      {!show3D && fallbackNode}
      {show3D && (
        <SceneErrorBoundary fallback={fallbackNode}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: inView ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            <Suspense fallback={null}>
              <Canvas
                dpr={dpr}
                frameloop="always"
                style={{ width: '100%', height: '100%' }}
                {...canvasProps}
              >
                <Suspense fallback={null}>
                  <LazyScene {...sceneProps} inView={inView} />
                </Suspense>
              </Canvas>
            </Suspense>
          </div>
        </SceneErrorBoundary>
      )}
    </div>
  )
}
