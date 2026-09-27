import { getGPUTier as detectGPUTier } from 'detect-gpu'

let cachedTier = null

/**
 * Resolve the device GPU tier as 'high', 'mid', or 'low'.
 * detect-gpu reports numeric tiers 0-3; we collapse them into three buckets
 * and cache the result for the session.
 */
export async function getGPUTier() {
  if (cachedTier) return cachedTier
  try {
    const { tier } = await detectGPUTier()
    if (tier === 3) cachedTier = 'high'
    else if (tier >= 1) cachedTier = 'mid'
    else cachedTier = 'low'
  } catch {
    cachedTier = 'mid'
  }
  return cachedTier
}
