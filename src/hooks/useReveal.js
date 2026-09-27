import { createElement, useEffect } from 'react'

// Word-reveal CSS is injected once into <head> (style#reveal-styles) the first
// time useReveal() or splitWords() runs. Wrap split words in an element with
// class `reveal`; when it intersects it gets `is-in` (and the legacy `visible`).
const STYLE_ID = 'reveal-styles'
const CSS = `
.reveal-word{display:inline-block;opacity:0;transform:translateY(0.4em);transition:transform 700ms var(--ease-out) calc(var(--i)*40ms),opacity 700ms var(--ease-out) calc(var(--i)*40ms)}
.is-in .reveal-word{opacity:1;transform:none}
@media (prefers-reduced-motion: reduce){.reveal-word{opacity:1;transform:none;transition:none}}
`

function injectRevealStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = CSS
  document.head.appendChild(el)
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function reveal(el) {
  el.classList.add('is-in', 'visible')
}

// Splits text into word spans carrying a --i index for staggered reveals.
export function splitWords(text) {
  injectRevealStyles()
  if (typeof text !== 'string') return text
  const words = text.split(/\s+/).filter(Boolean)
  const out = []
  words.forEach((word, i) => {
    if (i > 0) out.push(' ')
    out.push(
      createElement('span', { key: i, className: 'reveal-word', style: { '--i': i } }, word)
    )
  })
  return out
}

export function useReveal() {
  useEffect(() => {
    injectRevealStyles()
    const targets = Array.from(document.querySelectorAll('.reveal')).filter(
      el => !el.classList.contains('is-in')
    )
    if (!targets.length) return undefined

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      targets.forEach(reveal)
      return undefined
    }

    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) {
            reveal(e.target)
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.1 }
    )
    targets.forEach(el => io.observe(el))
    return () => io.disconnect()
  })
}
