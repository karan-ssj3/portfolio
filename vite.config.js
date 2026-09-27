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
})
