/**
 * trainingStore
 *
 * A tiny mutable store shared between the scroll choreography and the
 * Deep Layers scene. It is deliberately not React state: writers mutate it
 * directly and the scene reads it inside useFrame, so scrolling causes zero
 * React re-renders.
 */

const EPOCHS = 40
const TRAIN_START = 0.1
const TRAIN_SPAN = 0.75

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export const store = {
  progress: 0,
  epoch: 0,
  pointer: { x: 0, y: 0, active: false },
  inView: false,
}

/**
 * Write scroll progress (0..1) into the store and derive the current
 * fractional epoch (0..40). Training runs between 10% and 85% progress.
 */
export function setProgress(p) {
  const progress = clamp(Number.isFinite(p) ? p : 0, 0, 1)
  store.progress = progress
  store.epoch = clamp((progress - TRAIN_START) / TRAIN_SPAN, 0, 1) * EPOCHS
}

export default store
