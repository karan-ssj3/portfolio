import { useEffect, useRef } from 'react'

const STYLES = `
.cta {
  position: relative;
  width: 100%;
  padding: 8rem 1.5rem;
  background: #F5F3EE;
  color: #1C1B18;
  overflow: hidden;
  border-top: 1px solid rgba(28, 27, 24, 0.12);
  font-family: 'Inter', system-ui, sans-serif;
}
.cta-canvas {
  position: absolute;
  inset: -10% 0;
  width: 100%;
  height: 120%;
  z-index: 0;
  will-change: transform;
}
.cta-inner {
  position: relative;
  z-index: 1;
  max-width: 64rem;
  margin: 0 auto;
  text-align: center;
}
.cta-eyebrow {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 0.8125rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #9C5636;
  margin: 0 0 1rem;
}
.cta-headline {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 1.5rem;
  color: #1C1B18;
}
.cta-button {
  display: inline-block;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 1rem;
  padding: 0.875rem 2rem;
  border: 1px solid #1C1B18;
  background: #1C1B18;
  color: #F5F3EE;
  text-decoration: none;
  transition: background 160ms ease, color 160ms ease;
}
.cta-button:hover {
  background: #9C5636;
  border-color: #9C5636;
}
.cta-button:focus-visible {
  outline: 2px solid #9C5636;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .cta-button { transition: none; }
}
`

export default function CTA() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    let raf = 0
    let width = 0
    let height = 0
    let particles = []
    let scrollY = window.scrollY
    let lagY = scrollY

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = wrap.offsetWidth
      height = wrap.offsetHeight * 1.2
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(90, Math.floor((width * height) / 14000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.4 + 0.6,
        accent: Math.random() < 0.08,
      }))
    }

    const LINK_DIST = 110

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(28, 27, 24, ${0.14 * (1 - d / LINK_DIST)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = p.accent ? 'rgba(156, 86, 54, 0.7)' : 'rgba(28, 27, 24, 0.55)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduced) {
        // Parallax lag: background drifts behind scroll with easing
        lagY += (window.scrollY - lagY) * 0.06
        const rect = wrap.getBoundingClientRect()
        const offset = (rect.top + window.scrollY - lagY) * 0.08
        canvas.style.transform = `translate3d(0, ${offset}px, 0)`
        raf = requestAnimationFrame(draw)
      }
    }

    const onScroll = () => {
      if (reduced) return
      // value read in draw loop
    }

    resize()
    if (reduced) {
      draw()
    } else {
      raf = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section className="cta" ref={wrapRef} aria-labelledby="cta-heading">
      <style>{STYLES}</style>
      <canvas className="cta-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="cta-inner">
        <p className="cta-eyebrow">Let&rsquo;s build something</p>
        <h2 className="cta-headline" id="cta-heading">
          Have a system in mind?
        </h2>
        <a className="cta-button" href="mailto:karanbhutani.work@gmail.com">
          Start a conversation
        </a>
      </div>
    </section>
  )
}
