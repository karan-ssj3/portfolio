// src/lib/rss.js
// Build-time RSS fetcher/parser for the Medium feed.
//
// This module is consumed at build time via a Vite virtual module
// (`virtual:rss-posts`) wired up in vite.config.js. The Vite plugin
// fetches and parses the Medium feed during `vite build` (and once
// during dev server start) and exposes the result as a static
// array of post objects. The Blog page imports directly from
// `virtual:rss-posts` so the production bundle never performs a
// runtime RSS fetch.
//
// If the feed is unavailable at build time, the plugin falls back
// to a curated manual list so the page still renders real titles,
// dates, and links.

const MEDIUM_FEED = 'https://medium.com/feed/@karanbhutani477'

const ACCENTS = ['accent']
const GRADIENTS = [
  'linear-gradient(135deg, #1C1B18 0%, #4A3F33 50%, #9C5636 100%)',
  'linear-gradient(135deg, #2A2620 0%, #5C4A3A 50%, #9C5636 100%)',
  'linear-gradient(135deg, #1C1B18 0%, #3A322A 50%, #9C5636 100%)',
]

const FALLBACK_POSTS = [
  {
    title: 'Your LangGraph Agent Already Does What You Think MCP Does',
    excerpt:
      "A developer's journey from confusion to clarity about the Model Context Protocol.",
    date: '2025-11-09',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    title:
      'The Unbundling of Apps: Why Your DoorDash Account Might Become Obsolete',
    excerpt:
      "We laughed at ecommerce. We'll be wrong about AI agents too.",
    date: '2025-11-01',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    title:
      "LangSmith's No-Code Builder: The Control Plane vs. The Configuration",
    excerpt:
      "Why LangGraph engineers must pay attention to LangSmith's no-code builder.",
    date: '2025-11-01',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    title: 'Building Production RAG Systems: Lessons from the Trenches',
    excerpt:
      'Patterns that actually work and the anti-patterns that will sink your project.',
    date: '2025-10-15',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    title: 'Autonomous Agents Need Guardrails, Not Freedom',
    excerpt:
      'The paradox of building reliable autonomous systems: more constraints, more capability.',
    date: '2025-09-20',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    title: 'From Commerce to Code: My Non-Linear Path into AI',
    excerpt:
      "A B.Com graduate's journey through data science, ML, and autonomous AI systems.",
    date: '2025-08-10',
    link: 'https://medium.com/@karanbhutani477',
  },
]

function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function formatDate(input) {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return input
  return d.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function estimateReadTime(text) {
  const words = (text || '').split(/\s+/).filter(Boolean).length
  const minutes = Math.max(3, Math.round(words / 200))
  return `${minutes} min read`
}

export function parseMediumFeed(xml) {
  if (!xml || typeof xml !== 'string') return []

  const items = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1]

    const title = stripHtml((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '')
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || ''
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || ''
    const description = stripHtml(
      (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || ''
    )

    const cats = []
    const catRe = /<category>([\s\S]*?)<\/category>/g
    let cm
    while ((cm = catRe.exec(block)) !== null) {
      const c = stripHtml(cm[1])
      if (c) cats.push(c)
    }

    if (!title || !link) continue

    const isoDate = pubDate ? new Date(pubDate).toISOString() : ''

    items.push({
      title,
      link: link.trim(),
      date: formatDate(pubDate),
      isoDate,
      excerpt: description.slice(0, 180),
      readTime: estimateReadTime(description),
      categories: cats.slice(0, 3),
    })

    if (items.length >= 6) break
  }
  return items
}

export function enrichPosts(items) {
  return items.map((p, i) => ({
    id: i + 1,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    isoDate: p.isoDate,
    readTime: p.readTime,
    categories: p.categories || [],
    accent: ACCENTS[i % ACCENTS.length],
    gradient: GRADIENTS[i % GRADIENTS.length],
    link: p.link,
  }))
}

export function fallbackPosts() {
  return enrichPosts(
    FALLBACK_POSTS.map(p => ({
      title: p.title,
      excerpt: p.excerpt,
      date: formatDate(p.date),
      isoDate: p.date, // already ISO
      readTime: '5 min read',
      categories: [],
      link: p.link,
    }))
  )
}

export async function fetchMediumFeed() {
  const res = await fetch(MEDIUM_FEED, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
  })
  if (!res.ok) {
    throw new Error(`Medium feed responded ${res.status}`)
  }
  return res.text()
}

export async function resolvePosts() {
  try {
    const xml = await fetchMediumFeed()
    const parsed = parseMediumFeed(xml)
    if (parsed.length === 0) throw new Error('empty feed')
    return enrichPosts(parsed)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[rss] falling back to manual list:', err.message)
    return fallbackPosts()
  }
}

export default { fallbackPosts, parseMediumFeed, resolvePosts }
