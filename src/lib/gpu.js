let cachedTier = null

/**
 * Resolve the device GPU tier as 'high', 'mid', or 'low'.
 *
 * Purely local heuristic: no network requests. Combines the WebGL renderer
 * string with navigator.hardwareConcurrency and navigator.deviceMemory to
 * bucket devices, and caches the result for the session.
 */
export async function getGPUTier() {
  if (cachedTier) return cachedTier

  let score = 0

  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')

    if (gl) {
      const renderer = (
        gl.getParameter(gl.RENDERER) || ''
      ).toString()
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      const unmaskedRenderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : null
      const rendererString = (unmaskedRenderer || renderer).toLowerCase()

      if (rendererString) {
        // Known software renderers are always low tier.
        if (
          rendererString.includes('swiftshader') ||
          rendererString.includes('software') ||
          rendererString.includes('basic render') ||
          rendererString.includes('llvmpipe')
        ) {
          cachedTier = 'low'
          return cachedTier
        }

        // Common discrete GPUs indicate higher capability.
        if (
          rendererString.includes('nvidia') ||
          rendererString.includes('radeon') ||
          rendererString.includes('amd') ||
          rendererString.includes('geforce') ||
          rendererString.includes('quadro')
        ) {
          score += 2
        } else if (
          rendererString.includes('intel') ||
          rendererString.includes('apple') ||
          rendererString.includes('mali') ||
          rendererString.includes('adreno') ||
          rendererString.includes('powervr')
        ) {
          score += 1
        }
      }
    } else {
      // No WebGL support at all.
      cachedTier = 'low'
      return cachedTier
    }
  } catch {
    // WebGL access failed; assume mid so we don't block capable devices.
    cachedTier = 'mid'
    return cachedTier
  }

  const cores = navigator.hardwareConcurrency || 2
  if (cores >= 8) score += 2
  else if (cores >= 4) score += 1

  const deviceMemory = navigator.deviceMemory
  if (deviceMemory >= 8) score += 2
  else if (deviceMemory >= 4) score += 1

  cachedTier = score >= 4 ? 'high' : score >= 2 ? 'mid' : 'low'
  return cachedTier
}
