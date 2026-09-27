import { lazy, useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook for coordinating a React.lazy-loaded 3D scene chunk.
 *
 * Returns the lazy component plus an explicit `load` trigger and mount-safe
 * state. Calling `load()` starts fetching the chunk before the component is
 * rendered, while the cleanup flag prevents state updates after unmount.
 *
 * The lazy component is created exactly once per hook instance (stored in a
 * ref) so its internal hook state stays stable across renders — recreating
 * it per render causes React to throw "Invalid hook call" when the chunk
 * resolves.
 */
export default function useLazy3D(importFactory) {
  const lazyRef = useRef(null)
  if (lazyRef.current === null) {
    lazyRef.current = lazy(importFactory)
  }
  const LazyComponent = lazyRef.current

  const mountedRef = useRef(true)
  const loadedRef = useRef(false)
  const errorRef = useRef(null)

  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const load = useCallback(async () => {
    if (loadedRef.current || errorRef.current) return

    try {
      await importFactory()
      loadedRef.current = true
      if (mountedRef.current) {
        setReady(true)
      }
    } catch (err) {
      errorRef.current = err
      if (mountedRef.current) {
        setError(err)
      }
    }
  }, [importFactory])

  return { Component: LazyComponent, load, ready, error }
}
