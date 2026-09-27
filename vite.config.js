import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolvePosts } from './src/lib/rss.js'

function rssBuildPlugin() {
  let resolved = null
  let pending = null

  async function ensureResolved() {
    if (resolved) return resolved
    if (!pending) {
      pending = resolvePosts().then(posts => {
        resolved = posts
        return posts
      })
    }
    return pending
  }

  const VIRTUAL_ID = 'virtual:rss-posts'
  const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID

  return {
    name: 'karan-rss-build',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID
      return null
    },
    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null
      const posts = await ensureResolved()
      return `export const posts = ${JSON.stringify(posts)};\nexport default posts;`
    },
    async buildStart() {
      await ensureResolved()
    },
  }
}

export default defineConfig({
  plugins: [react(), rssBuildPlugin()],
  build: {
    rollupOptions: {
      output: {
        // Group three + R3F into one chunk requested only by lazy 3D modules.
        manualChunks(id) {
          if (
            id.includes('node_modules/three/') ||
            id.includes('node_modules/@react-three/') ||
            id.includes('node_modules/three-stdlib/')
          ) {
            return 'three'
          }
          return undefined
        },
      },
    },
  },
})
