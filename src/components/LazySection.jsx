import { Suspense, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const PREFETCH_TIMEOUT_MS = 4000
const MOBILE_QUERY = '(max-width: 719px)'

// Placeholder slab: keeps id (for anchors), height and colour until the real section loads.
function Placeholder({ id, minHeight, mobileMinHeight, background, innerRef }) {
  const cls = `lazy-ph-${id}`
  return (
    <section
      id={id}
      ref={innerRef}
      className={cls}
      aria-hidden="true"
      style={{ minHeight, background }}
    >
      {mobileMinHeight && (
        <style>{`@media ${MOBILE_QUERY}{.${cls}{min-height:${mobileMinHeight}!important}}`}</style>
      )}
    </section>
  )
}

// Runs once the lazy chunk has actually rendered.
function Mounted({ id, children }) {
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (window.location.hash === `#${id}`) {
        document.getElementById(id)?.scrollIntoView()
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [id])
  return children
}

export default function LazySection({
  id,
  component: Component,
  componentProps = {},
  minHeight = '100vh',
  mobileMinHeight,
  background = '#FFFFEB',
}) {
  const [mounted, setMounted] = useState(false)
  const ref = useRef(null)

  // Near viewport.
  useEffect(() => {
    if (mounted) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setMounted(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setMounted(true)
      },
      { rootMargin: '150% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [mounted])

  // Anchor navigation (initial hash and hashchange).
  useEffect(() => {
    if (mounted) return
    const check = () => {
      if (window.location.hash === `#${id}`) setMounted(true)
    }
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [id, mounted])

  // Idle prefetch after window load.
  useEffect(() => {
    if (mounted) return
    let idleId
    let timeoutId
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setMounted(true), { timeout: PREFETCH_TIMEOUT_MS })
      } else {
        timeoutId = setTimeout(() => setMounted(true), 1)
      }
    }
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => {
      window.removeEventListener('load', schedule)
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [mounted])

  const placeholderProps = { id, minHeight, mobileMinHeight, background }

  if (!mounted) return <Placeholder {...placeholderProps} innerRef={ref} />

  return (
    <Suspense fallback={<Placeholder {...placeholderProps} />}>
      <Mounted id={id}>
        <Component {...componentProps} />
      </Mounted>
    </Suspense>
  )
}
