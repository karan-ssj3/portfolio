import { useEffect, useState } from 'react'
import { useScrollContext } from '../providers/ScrollProvider'

export default function useReducedMotion() {
  const { reducedMotion: providerFlag } = useScrollContext()
  const [mediaMatches, setMediaMatches] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setMediaMatches(e.matches)
    mq.addEventListener('change', onChange)
    setMediaMatches(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mediaMatches || providerFlag
}
