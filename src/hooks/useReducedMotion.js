import { useEffect, useState } from 'react'
import { useScrollContext } from '../providers/ScrollProvider'

const QUERY = '(prefers-reduced-motion: reduce)'

// SSR-safe: returns null when window or matchMedia are unavailable.
const getMediaQuery = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY)
    : null

export default function useReducedMotion() {
  const { reducedMotion: providerFlag } = useScrollContext()
  const [mediaMatches, setMediaMatches] = useState(() => {
    const mq = getMediaQuery()
    return mq ? mq.matches : false
  })

  useEffect(() => {
    const mq = getMediaQuery()
    if (!mq) return undefined

    const onChange = (e) => setMediaMatches(e.matches)
    setMediaMatches(mq.matches)

    // Older Safari only supports the deprecated addListener API.
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
    mq.addListener(onChange)
    return () => mq.removeListener(onChange)
  }, [])

  return mediaMatches || providerFlag
}
