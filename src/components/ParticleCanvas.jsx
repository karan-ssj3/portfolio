import { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = ['#00f5ff', '#00f5ff', '#a855f7', '#ff00ff']
    const COUNT  = 90

    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.8 + 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.55 + 0.2,
    }))

    let mouse = { x: -9999, y: -9999 }
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('mousemove', onMove)

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update + draw particles
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Gentle mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d  = Math.hypot(dx, dy)
        if (d < 120) {
          p.vx += (dx / d) * 0.025
          p.vy += (dy / d) * 0.025
        }

        // Speed cap
        const speed = Math.hypot(p.vx, p.vy)
        if (speed > 1.2) { p.vx *= 0.97; p.vy *= 0.97 }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.shadowBlur  = 10
        ctx.shadowColor = p.color
        ctx.fillStyle   = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 110) {
            ctx.save()
            ctx.globalAlpha = (1 - d / 110) * 0.14
            ctx.strokeStyle = '#00f5ff'
            ctx.lineWidth   = 0.6
            ctx.shadowBlur  = 4
            ctx.shadowColor = '#00f5ff'
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return <canvas ref={ref} className="hero-canvas" />
}
