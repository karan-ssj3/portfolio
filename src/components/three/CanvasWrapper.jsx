import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import useGPU from '../../hooks/useGPU'
import useReducedMotion from '../../hooks/useReducedMotion'
import useLazy3D from '../../hooks/useLazy3D'
import FallbackImage from './FallbackImage'

const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV

const LazyPerf = isDev
  ? lazy(() => import('r3f-perf').then((module) => ({ default: module.Perf })))
  : null

/**
 * CanvasWrapper
 *
 * Lazy-loads a 3D scene chunk and mounts the R3F <Canvas> only when the
 * wrapper is near the viewport. Falls back to a static generative image on
 * low-GPU devices or when the user prefers reduced motion.
 */
export default function CanvasWrapper({
  scene,
  className = '',
  style,
  canvasProps = {},
  fallbackAlt = '3D scene placeholder',
}) {
  const gpuTier = useGPU()
  const reducedMotion = useReducedMotion()
  const wrapperRef = useRef(null)

  const [inView, setInView] = useState(false)
  const [shouldMount, setShouldMount] = useState(false)

  const isLowGPU = gpuTier === 'low'
  const canRender3D = !reducedMotion && !isLowGPU

  const { Component: LazyScene, load, error: loadError } = useLazy3D(scene)

  useEffect(() => {
    if (loadError) {
      // eslint-disable-next-line no-console
      console.error('CanvasWrapper: failed to load 3D scene chunk', loadError)
    }
  }, [loadError])

  useEffect(() => {
    if (!canRender3D) return

    const element = wrapperRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          setShouldMount(true)
          load()
        } else {
          setInView(false)
        }
      },
      { rootMargin: '200px', threshold: 0 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [canRender3D, load])

  // Cap pixel ratio by GPU tier to keep the scene lightweight on mid devices.
  const dpr = gpuTier === 'high' ? [1, 2] : gpuTier === 'mid' ? [1, 1.5] : [1, 1]

  const show3D = canRender3D && shouldMount && !loadError

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
      <style>{`.canvas-wrapper:focus-visible { outline: 3px solid #9C5636; outline-offset: 4px; }`}</style>
      {!show3D && <FallbackImage alt={fallbackAlt} />}
      {show3D && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: inView ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Canvas
            dpr={dpr}
            frameloop="always"
            style={{ width: '100%', height: '100%' }}
            {...canvasProps}
          >
            <Suspense fallback={null}>
              <LazyScene />
              {LazyPerf && <LazyPerf position="top-left" />}
            </Suspense>
          </Canvas>
        </div>
      )}
    </div>
  )
}
