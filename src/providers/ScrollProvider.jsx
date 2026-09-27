import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { getGPUTier } from '../lib/gpu'

// Register at module scope so eager consumers (ScrollToTop, Home sections)
// can use ScrollTrigger before the deferred Lenis setup runs.
gsap.registerPlugin(ScrollTrigger)

const ScrollContext = createContext({
  reducedMotion: false,
  gpuTier: 'mid',
  getLenis: () => null,
})

export const useScrollContext = () => useContext(ScrollContext)

// Idle scheduling with a timeout fallback for browsers without rIC.
const requestIdle = (cb, timeout) =>
  typeof window.requestIdleCallback === 'function'
    ? { id: window.requestIdleCallback(cb, { timeout }), idle: true }
    : { id: setTimeout(cb, timeout), idle: false }

const cancelIdle = (h) => {
  if (!h) return
  if (h.idle) window.cancelIdleCallback(h.id)
  else clearTimeout(h.id)
}

export default function ScrollProvider({ children }) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [gpuTier, setGpuTier] = useState('mid')
  const lenisRef = useRef(null)
  const rafRef = useRef(null)
  const tierRef = useRef('mid')
  const getLenisRef = useRef(() => lenisRef.current)

  useEffect(() => {
    let cancelled = false
    let ready = false
    let refreshTimer = null
    let lastHeight = 0
    let idleHandle = null

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Debounced refresh so pin spacers and trigger positions follow
    // late layout changes (fonts, lazy canvases, images).
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        if (cancelled || !ready) return
        ScrollTrigger.refresh()
        lenisRef.current?.resize()
      }, 150)
    }

    // Immediate refresh for the window load and fonts-ready milestones,
    // followed by a debounced pass to catch anything still settling.
    const refreshNow = () => {
      if (cancelled || !ready) return
      ScrollTrigger.refresh()
      lenisRef.current?.resize()
      scheduleRefresh()
    }

    const destroyLenis = () => {
      if (!lenisRef.current) return
      gsap.ticker.remove(rafRef.current)
      lenisRef.current.off?.('scroll', ScrollTrigger.update)
      lenisRef.current.destroy()
      lenisRef.current = null
      rafRef.current = null
    }

    const createLenis = () => {
      if (lenisRef.current || !ready) return
      // Never smooth scroll under reduced motion.
      if (prefersReduced.matches) return
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        autoRaf: false,
      })
      lenisRef.current = lenis

      lenis.on('scroll', ScrollTrigger.update)

      gsap.ticker.lagSmoothing(0)

      const raf = (time) => {
        lenis.raf(time * 1000)
      }
      rafRef.current = raf
      gsap.ticker.add(raf)
      scheduleRefresh()
    }

    const evaluate = async () => {
      const tier = await getGPUTier()
      if (cancelled) return
      tierRef.current = tier
      setGpuTier(tier)
      const shouldReduce = prefersReduced.matches || tier === 'low'
      setReducedMotion(shouldReduce)

      if (shouldReduce) return
      createLenis()
    }

    // Defer smooth scrolling until the main thread is idle; native
    // scrolling works until then.
    idleHandle = requestIdle(() => {
      idleHandle = null
      if (cancelled) return
      ready = true
      evaluate()
      refreshNow()
    }, 1200)

    const onMediaChange = (e) => {
      const shouldReduce = e.matches || tierRef.current === 'low'
      setReducedMotion(shouldReduce)
      if (shouldReduce) destroyLenis()
      else createLenis()
      scheduleRefresh()
    }
    prefersReduced.addEventListener('change', onMediaChange)

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          const h = document.body.scrollHeight
          if (h === lastHeight) return
          lastHeight = h
          scheduleRefresh()
        })
      : null
    ro?.observe(document.body)

    // If the load event already fired before mount, refresh right away.
    if (document.readyState === 'complete') refreshNow()
    else window.addEventListener('load', refreshNow)

    document.fonts?.ready?.then(refreshNow).catch(() => {})

    return () => {
      cancelled = true
      cancelIdle(idleHandle)
      idleHandle = null
      clearTimeout(refreshTimer)
      ro?.disconnect()
      window.removeEventListener('load', refreshNow)
      prefersReduced.removeEventListener('change', onMediaChange)
      destroyLenis()
    }
  }, [])

  return (
    <ScrollContext.Provider
      value={{ reducedMotion, gpuTier, getLenis: getLenisRef.current }}
    >
      {children}
    </ScrollContext.Provider>
  )
}
