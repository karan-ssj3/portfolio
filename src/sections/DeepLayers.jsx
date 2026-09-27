import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Section from '../components/Section'
import LossCurveHUD from '../components/LossCurveHUD'
import CanvasWrapper from '../components/three/CanvasWrapper'
import DeepLayersFallback from '../components/three/DeepLayersFallback'
import useReducedMotion from '../hooks/useReducedMotion'
import useGPU from '../hooks/useGPU'
import { store, setProgress } from '../lib/trainingStore'

gsap.registerPlugin(ScrollTrigger)

const ROLES = [
  'Data Analyst',
  'Business Analyst',
  'Solution Architect',
  'AI Engineer',
  'ML Engineer',
  'Data Engineer',
]

const FALLBACK_ALT =
  'Diagram of a trained neural network whose six outputs are Data Analyst, Business Analyst, Solution Architect, AI Engineer, ML Engineer, Data Engineer'

const LABELS_AT = 0.85
const CAPTION_AT = 0.9
const TAP_MS = 600
const MOBILE_QUERY = '(max-width: 719px)'

// Stable loader so the lazy scene chunk is only requested once.
const loadScene = () => import('../components/three/DeepLayersScene')

const STYLES = `
.deep-layers__track { position: relative; height: 500vh; }
.deep-layers__track--static { height: auto; }
@media (max-width: 719px) {
  .deep-layers__track { height: 320vh; }
  .deep-layers__track--static { height: auto; }
}
.deep-layers__stage {
  --dl-safe-top: 64px;
  --dl-safe-bottom: 160px;
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
}
.deep-layers__eyebrow {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  z-index: 3;
  pointer-events: none;
  white-space: nowrap;
  opacity: 1;
  color: rgba(255, 255, 235, 0.7);
  background: #1A1A1A;
  border: 1px solid rgba(255, 255, 235, 0.15);
  border-radius: 999px;
  padding: 6px 14px;
}
.deep-layers__labels {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 600ms var(--ease-out);
}
.deep-layers__label {
  position: absolute;
  left: 0;
  top: 0;
  visibility: hidden;
  white-space: nowrap;
  font-family: 'Figtree', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1;
  font-weight: 500;
  color: #FFFFEB;
  border: 1px solid rgba(255, 255, 235, 0.3);
  border-radius: 999px;
  padding: 6px 12px;
  background: rgba(26, 26, 26, 0.5);
  will-change: transform;
}
.deep-layers__caption {
  position: absolute;
  left: 50%;
  bottom: 48px;
  width: calc(100% - 32px);
  max-width: 640px;
  box-sizing: border-box;
  transform: translateX(-50%);
  text-align: center;
  color: #FFFFEB;
  background: #1A1A1A;
  padding: 20px 28px;
  border-radius: 24px;
  margin: 0;
  z-index: 3;
  pointer-events: none;
  opacity: 0;
  transition: opacity 700ms var(--ease-out);
}
.deep-layers__static {
  padding: 120px clamp(20px, 4vw, 48px) 96px;
  max-width: 1280px;
  margin: 0 auto;
}
.deep-layers__static .deep-layers__eyebrow {
  position: static;
  transform: none;
  display: table;
  margin: 0 auto 32px;
}
.deep-layers__static .deep-layers__caption {
  position: static;
  transform: none;
  opacity: 1;
  width: auto;
  margin: 40px auto 0;
}
/* Where the caption band would sit over the HUD, fade the HUD out. */
@media (max-width: 1199px) {
  .deep-layers__stage[data-caption='on'] .loss-hud { opacity: 0; }
}
@media (max-width: 719px) {
  .deep-layers__label { font-size: 12px; padding: 5px 10px; }
  .deep-layers__stage .deep-layers__caption { bottom: 88px; }
}
`

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = (e) => setMobile(e.matches)
    mq.addEventListener('change', onChange)
    setMobile(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mobile
}

function Caption({ captionRef }) {
  return (
    <p ref={captionRef} className="display d-32 deep-layers__caption">
      One network, six <em>roles.</em>
    </p>
  )
}

/**
 * DeepLayers
 *
 * Pinned ink slab hosting the Deep Layers Learning centrepiece. Scroll
 * progress through the tall track is written into the training store (no
 * React state), which the scene reads per frame. Under reduced motion or a
 * low GPU tier the track collapses and a static SVG diagram is shown.
 */
export default function DeepLayers() {
  const reducedMotion = useReducedMotion()
  const gpu = useGPU()
  const mobile = useIsMobile()
  const isStatic = reducedMotion || gpu === 'low'

  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const labelsLayerRef = useRef(null)
  const captionRef = useRef(null)
  const tapTimerRef = useRef(null)

  // One ref per output role; the scene writes transforms into these spans.
  const labelsRef = useMemo(() => ROLES.map(() => createRef()), [])

  // Scroll progress drives training, label fade and caption.
  useEffect(() => {
    if (isStatic) return undefined
    const track = trackRef.current
    if (!track) return undefined

    const apply = (p) => {
      setProgress(p)
      if (labelsLayerRef.current) {
        labelsLayerRef.current.style.opacity = p > LABELS_AT ? '1' : '0'
      }
      const showCaption = p > CAPTION_AT
      if (captionRef.current) {
        captionRef.current.style.opacity = showCaption ? '1' : '0'
      }
      if (stageRef.current) {
        stageRef.current.dataset.caption = showCaption ? 'on' : 'off'
      }
    }

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(trigger.progress)

    return () => {
      trigger.kill()
      setProgress(0)
    }
  }, [isStatic, mobile])

  // Visibility flag so the scene can skip work off-screen.
  useEffect(() => {
    if (isStatic) return undefined
    const track = trackRef.current
    if (!track) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        store.inView = entry.isIntersecting
      },
      { threshold: 0 },
    )
    observer.observe(track)

    return () => {
      observer.disconnect()
      store.inView = false
    }
  }, [isStatic])

  useEffect(
    () => () => {
      clearTimeout(tapTimerRef.current)
      store.pointer.active = false
    },
    [],
  )

  const writePointer = (event) => {
    const stage = stageRef.current
    if (!stage) return false
    const rect = stage.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false
    store.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    store.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    return true
  }

  const onPointerMove = (event) => {
    if (event.pointerType === 'touch') return
    if (writePointer(event)) store.pointer.active = true
  }

  const onPointerLeave = () => {
    clearTimeout(tapTimerRef.current)
    store.pointer.active = false
  }

  // Taps inject one short burst; there is no scroll hijack on touch.
  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch') return
    if (!writePointer(event)) return
    store.pointer.active = true
    clearTimeout(tapTimerRef.current)
    tapTimerRef.current = setTimeout(() => {
      store.pointer.active = false
    }, TAP_MS)
  }

  if (isStatic) {
    // Fallback path: no HUD; the fallback SVG carries the only loss curve.
    return (
      <Section tone="ink" overlapTop id="deep-layers">
        <style>{STYLES}</style>
        <div className="deep-layers__track deep-layers__track--static">
          <div className="deep-layers__static">
            <p className="eyebrow deep-layers__eyebrow">DEEP LAYERS LEARNING</p>
            <DeepLayersFallback title={FALLBACK_ALT} />
            <Caption />
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section tone="ink" overlapTop id="deep-layers">
      <style>{STYLES}</style>
      <div ref={trackRef} className="deep-layers__track">
        <div
          ref={stageRef}
          className="deep-layers__stage"
          data-caption="off"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
        >
          <p className="eyebrow deep-layers__eyebrow">DEEP LAYERS LEARNING</p>

          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <CanvasWrapper
              scene={loadScene}
              sceneProps={{ mobile, highTier: gpu === 'high', labelsRef }}
              fallback={<DeepLayersFallback title={FALLBACK_ALT} />}
              fallbackAlt={FALLBACK_ALT}
              style={{ height: '100%' }}
              canvasProps={{
                gl: { alpha: true, antialias: true },
                camera: { position: [0, 1.2, 12], fov: mobile ? 55 : 45 },
              }}
            />
          </div>

          <div ref={labelsLayerRef} className="deep-layers__labels" aria-hidden="true">
            {ROLES.map((role, i) => (
              <span key={role} ref={labelsRef[i]} className="deep-layers__label">
                {role}
              </span>
            ))}
          </div>

          <LossCurveHUD />

          <Caption captionRef={captionRef} />
        </div>
      </div>
    </Section>
  )
}
