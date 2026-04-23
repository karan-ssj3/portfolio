import { useState, useEffect } from 'react'
import { useReveal } from '../hooks/useReveal'

const RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@karanbhutani477'

function BlogCard({ post, delay }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noreferrer"
      className={`blog-card reveal reveal-d${delay}`}
    >
      {post.thumbnail
        ? <img className="blog-img" src={post.thumbnail} alt={post.title} loading="lazy" />
        : <div className="blog-placeholder">✦</div>
      }
      <div className="blog-body">
        <div className="blog-meta">
          <span>{new Date(post.pubDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          <span className="blog-meta-dot">·</span>
          <span>{post.readTime || '5 min read'}</span>
        </div>
        <h3 className="blog-title">{post.title}</h3>
        <p className="blog-excerpt">{post.description?.replace(/<[^>]*>/g, '').slice(0, 160)}…</p>
        {post.categories?.length > 0 && (
          <div className="blog-tags">
            {post.categories.slice(0, 3).map(t => <span key={t} className="badge badge-p">{t}</span>)}
          </div>
        )}
        <span className="blog-read-more">Read on Medium <span>→</span></span>
      </div>
    </a>
  )
}

const FALLBACK = [
  { title: 'Building Production RAG Systems with LangChain', link: 'https://medium.com/@karanbhutani477', pubDate: '2025-01-01', description: 'A deep dive into building retrieval-augmented generation systems that actually work in production, with lessons from real deployments.', categories: ['AI', 'RAG', 'LangChain'] },
  { title: 'Autonomous AI Agents: From Prototype to Production', link: 'https://medium.com/@karanbhutani477', pubDate: '2024-11-01', description: 'How to design, build, and deploy autonomous agent systems that handle real workloads without falling apart.', categories: ['LangGraph', 'Agents', 'Python'] },
  { title: 'Data Engineering with dbt Cloud and Airflow', link: 'https://medium.com/@karanbhutani477', pubDate: '2024-09-01', description: 'Implementing medallion architecture with Apache Airflow orchestration and dbt Cloud transformations at scale.', categories: ['Data Engineering', 'dbt', 'Airflow'] },
]

export default function Blog() {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  useReveal()

  useEffect(() => {
    fetch(RSS_URL)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'ok' && d.items?.length) setPosts(d.items.slice(0, 6))
        else setPosts(FALLBACK)
      })
      .catch(() => setPosts(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-bg">
      <div className="page-hero">
        <span className="section-label reveal">// Writing</span>
        <h1 className="section-title gradient-text reveal reveal-d1">Blog</h1>
        <p className="reveal reveal-d2" style={{ color: 'var(--text-dim)', marginTop: '.5rem' }}>
          Thoughts on AI, data science, and the future of technology
        </p>
        <a
          href="https://medium.com/@karanbhutani477"
          target="_blank"
          rel="noreferrer"
          className="btn btn-cyan reveal reveal-d3"
          style={{ marginTop: '1.5rem', display: 'inline-flex' }}
        >
          All Posts on Medium ↗
        </a>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        {loading ? (
          <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)', textAlign: 'center', letterSpacing: '2px' }}>
            // loading posts...
          </p>
        ) : (
          <div className="blog-grid">
            {posts.map((p, i) => <BlogCard key={i} post={p} delay={(i % 3) + 1} />)}
          </div>
        )}
      </div>
    </div>
  )
}
