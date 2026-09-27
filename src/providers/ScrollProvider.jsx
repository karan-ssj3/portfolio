import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { getGPUTier } from '../lib/gpu'

const ScrollContext = createContext({ reducedMotion: false, gpuTier: 'mid' })

export const useScrollContext = () => useContext(ScrollContext)

gsap.registerPlugin(ScrollTrigger)

export default function ScrollProvider({ children }) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [gpuTier, setGpuTier] = useState('mid')
  const lenisRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const evaluate = async () => {
      const tier = await getGPUTier()
      if (cancelled) return
      setGpuTier(tier)
      const shouldReduce = prefersReduced.matches || tier === 'low'
      setReducedMotion(shouldReduce)

      if (shouldReduce) return

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
    }

    evaluate()

    const onMediaChange = (e) => {
      const shouldReduce = e.matches || gpuTier === 'low'
      setReducedMotion(shouldReduce)
      if (e.matches && lenisRef.current) {
        gsap.ticker.remove(rafRef.current)
        lenisRef.current.destroy()
        lenisRef.current = null
        rafRef.current = null
      }
    }
    prefersReduced.addEventListener('change', onMediaChange)

    return () => {
      cancelled = true
      prefersReduced.removeEventListener('change', onMediaChange)
      if (lenisRef.current) {
        gsap.ticker.remove(rafRef.current)
        lenisRef.current.destroy()
        lenisRef.current = null
        rafRef.current = null
      }
    }
  }, [gpuTier])

  return (
    <ScrollContext.Provider value={{ reducedMotion, gpuTier }}>
      {children}
    </ScrollContext.Provider>
  )
}
