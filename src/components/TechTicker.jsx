import { useEffect, useMemo, useRef, useState } from 'react'
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

function getTechUnion() {
  const union = new Set()
  PROJECTS.forEach((project) => {
    project.techStack?.forEach((tech) => union.add(tech))
  })
  return Array.from(union).sort((a, b) => a.localeCompare(b))
}

function splitIntoColumns(items, columnCount) {
  const columns = Array.from({ length: columnCount }, () => [])
  items.forEach((item, index) => {
    columns[index % columnCount].push(item)
  })
  return columns
}

function TickerColumn({ items, direction }) {
  const trackRef = useRef(null)
  const [loopHeight, setLoopHeight] = useState(0)
  const doubled = useMemo(() => [...items, ...items], [items])

  useEffect(() => {
    if (!trackRef.current) return
    setLoopHeight(trackRef.current.scrollHeight / 2)
  }, [items])

  const animationClass = direction === 'up' ? 'animate-ticker-up' : 'animate-ticker-down'

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={trackRef}
        className={`flex flex-col gap-3 ${animationClass}`}
        style={{ '--ticker-height': `${loopHeight}px` }}
        aria-hidden="true"
      >
        {doubled.map((tech, index) => (
          <span
            key={`${tech}-${index}`}
            className="block font-['Inter'] text-sm text-[#1C1B18]/80 whitespace-nowrap"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function TechTicker({ techs }) {
  const reduced = usePrefersReducedMotion()
  const list = useMemo(() => techs ?? getTechUnion(), [techs])
  const columns = useMemo(() => splitIntoColumns(list, 2), [list])

  if (reduced) {
    return (
      <div className="grid grid-cols-2 gap-x-8 gap-y-2" role="list" aria-label="Tech stack">
        {columns.map((column, columnIndex) => (
          <ul key={columnIndex} className="space-y-2">
            {column.map((tech) => (
              <li key={tech} className="font-['Inter'] text-sm text-[#1C1B18]/80">
                {tech}
              </li>
            ))}
          </ul>
        ))}
      </div>
    )
  }

  return (
    <>
      <div
        className="relative flex gap-8 h-[480px] overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
        aria-label="Tech stack ticker"
      >
        <TickerColumn items={columns[0]} direction="up" />
        <TickerColumn items={columns[1]} direction="down" />
      </div>
      <style>{`
        @keyframes ticker-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(var(--ticker-height) * -1)); }
        }
        @keyframes ticker-down {
          0% { transform: translateY(calc(var(--ticker-height) * -1)); }
          100% { transform: translateY(0); }
        }
        .animate-ticker-up {
          animation: ticker-up 50s linear infinite;
        }
        .animate-ticker-down {
          animation: ticker-down 50s linear infinite;
        }
      `}</style>
    </>
  )
}
