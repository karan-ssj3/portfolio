import { Canvas } from '@react-three/fiber'

/**
 * R3FCanvas
 *
 * Thin re-export of the R3F <Canvas> so @react-three/fiber (and three) are
 * only pulled in when CanvasWrapper lazily loads this module.
 */
export default function R3FCanvas({ children, ...props }) {
  return <Canvas {...props}>{children}</Canvas>
}
