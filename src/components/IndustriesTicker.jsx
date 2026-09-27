import { useEffect, useMemo, useState } from 'react'
import { PROJECTS } from '../data/projects'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function deriveIndustries() {
  const seen = new Set()
  const industries = []

  PROJECTS.forEach((project) => {
    const subtitle = project.subtitle || ''
    const segments = subtitle.split('·').map((s) => s.trim())
    const raw = segments[segments.length - 1] || ''
    const cleaned = raw.replace(/\s+Client$/i, '')
    const keyword = cleaned.toUpperCase()

    if (keyword && !seen.has(keyword)) {
      seen.add(keyword)
      industries.push(keyword)
    }
  })

  return industries
}

export default function IndustriesTicker() {
  const reduced = usePrefersReducedMotion()
  const industries = useMemo(() => deriveIndustries(), [])

  if (reduced) {
    return (
      <p
        className="font-['Space_Grotesk'] text-sm tracking-wide text-[#1C1B18]/70 uppercase"
        aria-label="Industries and domains"
      >
        {industries.join(' · ')}
      </p>
    )
  }

  const doubled = [...industries, ...industries]

  return (
    <>
      <div
        className="relative overflow-hidden py-4 border-y border-[#1C1B18]/10"
        aria-label="Industries and domains ticker"
      >
        <div className="flex gap-8 animate-industries-ticker whitespace-nowrap">
          {doubled.map((industry, index) => (
            <span key={`${industry}-${index}`} className="flex items-center gap-8">
              <span className="font-['Space_Grotesk'] text-sm tracking-wide text-[#1C1B18]/70 uppercase">
                {industry}
              </span>
              <span className="text-[#9C5636]" aria-hidden="true">
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes industries-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-industries-ticker {
          animation: industries-ticker 35s linear infinite;
        }
      `}</style>
    </>
  )
}
