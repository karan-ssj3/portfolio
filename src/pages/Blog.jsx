import { useState, useRef, useEffect } from 'react'

const ACCENT_MAP = {
  accent: { color: '#4F46E5', light: '#EEF2FF', border: 'rgba(79,70,229,.2)' },
  purple: { color: '#8B5CF6', light: '#F5F3FF', border: 'rgba(139,92,246,.2)' },
  teal:   { color: '#0D9488', light: '#F0FDFA', border: 'rgba(13,148,136,.2)' },
}

const STATIC_POSTS = [
  {
    id: 1,
    title: 'Your LangGraph Agent Already Does What You Think MCP Does',
    excerpt: "A developer's journey from confusion to clarity about the Model Context Protocol. I spent an hour yesterday trying to understand MCP and here's what I found.",
    date: '9 Nov 2025',
    readTime: '5 min read',
    categories: ['AI Agents', 'LangGraph'],
    accent: 'accent',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2DD4BF 100%)',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    id: 2,
    title: 'The Unbundling of Apps: Why Your DoorDash Account Might Become Obsolete',
    excerpt: "We laughed at ecommerce. We'll be wrong about AI agents too. Remember when people said nobody would buy shoes online?",
    date: '1 Nov 2025',
    readTime: '5 min read',
    categories: ['AI', 'Future Tech'],
    accent: 'purple',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #DB2777 50%, #F59E0B 100%)',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    id: 3,
    title: "LangSmith's No-Code Builder: The Control Plane vs. The Configuration",
    excerpt: 'Why LangGraph Engineers Must Pay Attention to LangSmith\'s No-Code Builder. For engineers who have embraced the agent revolution.',
    date: '1 Nov 2025',
    readTime: '5 min read',
    categories: ['LangSmith', 'MLOps'],
    accent: 'teal',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #4F46E5 50%, #8B5CF6 100%)',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    id: 4,
    title: 'Building Production RAG Systems: Lessons from the Trenches',
    excerpt: 'After deploying RAG in enterprise settings, here are the patterns that actually work and the anti-patterns that will sink your project.',
    date: 'Oct 2025',
    readTime: '7 min read',
    categories: ['RAG', 'Production ML'],
    accent: 'accent',
    gradient: 'linear-gradient(135deg, #1E40AF 0%, #4F46E5 50%, #0D9488 100%)',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    id: 5,
    title: 'Autonomous Agents Need Guardrails, Not Freedom',
    excerpt: 'The paradox of building reliable autonomous systems: the more constraints you add, the more capable they become.',
    date: 'Sep 2025',
    readTime: '6 min read',
    categories: ['AI Agents', 'Architecture'],
    accent: 'purple',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F97316 100%)',
    link: 'https://medium.com/@karanbhutani477',
  },
  {
    id: 6,
    title: 'From Commerce to Code: My Non-Linear Path into AI',
    excerpt: 'A B.Com graduate\'s journey through data science, machine learning, and eventually building autonomous AI systems at scale.',
    date: 'Aug 2025',
    readTime: '8 min read',
    categories: ['Career', 'Personal'],
    accent: 'teal',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #4F46E5 50%, #A855F7 100%)',
    link: 'https://medium.com/@karanbhutani477',
  },
]

function useVisible(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function FeaturedCard({ post }) {
  const [ref, visible] = useVisible()
  const colors = ACCENT_MAP[post.accent]

  return (
    <a
      ref={ref}
      href={post.link}
      target="_blank"
      rel="noreferrer"
      className={`blog-featured${visible ? ' blog-visible' : ''}`}
      style={{ display: 'grid' }}
    >
      <div className="blog-featured-thumb" style={{ background: post.gradient }}>
        <div className="blog-featured-overlay" />
        <div className="blog-featured-badge">Latest Post</div>
      </div>
      <div className="blog-featured-body">
        <div className="blog-meta">
          <span className="blog-date">{post.date}</span>
          <span className="blog-dot-sep" />
          <span className="blog-read-time">{post.readTime}</span>
        </div>
        <h2 className="blog-featured-title">{post.title}</h2>
        <p className="blog-featured-excerpt">{post.excerpt}</p>
        <div className="blog-categories">
          {post.categories.map(cat => (
            <span key={cat} className="blog-cat" style={{ color: colors.color, background: colors.light, borderColor: colors.border }}>
              {cat}
            </span>
          ))}
        </div>
        <span className="blog-read-link" style={{ color: colors.color }}>
          Read on Medium <span className="blog-arrow">→</span>
        </span>
      </div>
    </a>
  )
}

function BlogCard({ post, index }) {
  const [ref, visible] = useVisible()
  const colors = ACCENT_MAP[post.accent]

  return (
    <a
      ref={ref}
      href={post.link}
      target="_blank"
      rel="noreferrer"
      className={`blog-card${visible ? ' blog-visible' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="blog-card-thumb" style={{ background: post.gradient }}>
        <div className="blog-card-thumb-pattern">
          <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', opacity: 0.2 }}>
            <circle cx="160" cy="60" r="40" fill="none" stroke="white" strokeWidth=".8" />
            <circle cx="160" cy="60" r="20" fill="none" stroke="white" strokeWidth=".5" />
            <line x1="40" y1="90" x2="160" y2="60" stroke="white" strokeWidth=".3" strokeDasharray="4 4" />
          </svg>
        </div>
      </div>
      <div className="blog-card-body">
        <div className="blog-meta">
          <span className="blog-date">{post.date}</span>
          <span className="blog-dot-sep" />
          <span className="blog-read-time">{post.readTime}</span>
        </div>
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <div className="blog-categories">
          {post.categories.map(cat => (
            <span key={cat} className="blog-cat" style={{ color: colors.color, background: colors.light, borderColor: colors.border }}>
              {cat}
            </span>
          ))}
        </div>
      </div>
    </a>
  )
}

const RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@karanbhutani477'
const ACCENTS = ['accent', 'purple', 'teal']
const GRADIENTS = [
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2DD4BF 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #DB2777 50%, #F59E0B 100%)',
  'linear-gradient(135deg, #0D9488 0%, #4F46E5 50%, #8B5CF6 100%)',
]

export default function Blog() {
  const [posts,   setPosts]   = useState(STATIC_POSTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(RSS_URL)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'ok' && d.items?.length) {
          const enriched = d.items.slice(0, 6).map((item, i) => ({
            id: i + 1,
            title: item.title,
            excerpt: item.description?.replace(/<[^>]*>/g, '').slice(0, 180),
            date: new Date(item.pubDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
            readTime: `${Math.max(3, Math.round((item.description?.split(' ').length || 600) / 200))} min read`,
            categories: item.categories?.slice(0, 3) || [],
            accent: ACCENTS[i % 3],
            gradient: GRADIENTS[i % 3],
            link: item.link,
          }))
          setPosts(enriched)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const [featured, ...rest] = posts

  return (
    <>
      <div className="page-hero">
        <div className="page-label">// Writing</div>
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">Thoughts on AI, data science, and the future of technology</p>
        <a href="https://medium.com/@karanbhutani477" target="_blank" rel="noreferrer" className="medium-btn">
          All Posts on Medium →
        </a>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-muted)', padding: '4rem 0' }}>
          // loading posts...
        </p>
      ) : (
        <>
          <div style={{ padding: '0 24px' }}>
            <FeaturedCard post={featured} />
          </div>
          <div className="blog-grid">
            {rest.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)}
          </div>
        </>
      )}
    </>
  )
}
