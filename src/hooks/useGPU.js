import { useScrollContext } from '../providers/ScrollProvider'

export default function useGPU() {
  const { gpuTier } = useScrollContext()
  return gpuTier
}
