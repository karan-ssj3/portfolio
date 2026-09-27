import { useState, useRef, useEffect } from 'react'
import { posts } from 'virtual:rss-posts'

const ACCENT = {
  color: '#9C5636',
  light: 'rgba(156, 86, 54, 0.08)',
  border: 'rgba(156, 86, 54, 0.25)',
}

function useVisible(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    if (mq.matches) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible, reducedMotion]
}

function FeaturedCard({ post }) {
  const [ref, visible, reducedMotion] = useVisible()

  return (
    <article
      ref={ref}
      className={`blog-featured${visible ? ' blog-visible' : ''}${reducedMotion ? ' blog-reduced-motion' : ''}`}
      aria-labelledby={`post-${post.id}-title`}
    >
      <a
        href={post.link}
        target="_blank"
        rel="noreferrer"
        className="blog-featured-link"
        aria-label={`Read "${post.title}" on Medium`}
      >
        <div className="blog-featured-thumb" style={{ background: post.gradient }} aria-hidden="true">
          <div className="blog-featured-overlay" />
          <div className="blog-featured-badge">Latest Post</div>
        </div>
        <div className="blog-featured-body">
          <div className="blog-meta">
            <time className="blog-date" dateTime={post.isoDate}>{post.date}</time>
            <span className="blog-dot-sep" aria-hidden="true" />
            <span className="blog-read-time">{post.readTime}</span>
          </div>
          <h2 id={`post-${post.id}-title`} className="blog-featured-title">{post.title}</h2>
          <p className="blog-featured-excerpt">{post.excerpt}</p>
          {post.categories?.length > 0 && (
            <ul className="blog-categories" aria-label="Categories">
              {post.categories.map(cat => (
                <li
                  key={cat}
                  className="blog-cat"
                  style={{
                    color: ACCENT.color,
                    background: ACCENT.light,
                    borderColor: ACCENT.border,
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
          <span className="blog-read-link" style={{ color: ACCENT.color }}>
            Read on Medium <span className="blog-arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </a>
    </article>
  )
}

function BlogCard({ post, index }) {
  const [ref, visible, reducedMotion] = useVisible()

  return (
    <article
      ref={ref}
      className={`blog-card${visible ? ' blog-visible' : ''}${reducedMotion ? ' blog-reduced-motion' : ''}`}
      style={{ animationDelay: reducedMotion ? '0ms' : `${index * 80}ms` }}
      aria-labelledby={`post-${post.id}-title`}
    >
      <a
        href={post.link}
        target="_blank"
        rel="noreferrer"
        className="blog-card-link"
        aria-label={`Read "${post.title}" on Medium`}
      >
        <div className="blog-card-thumb" style={{ background: post.gradient }} aria-hidden="true">
          <svg viewBox="0 0 200 120" className="blog-card-thumb-pattern" aria-hidden="true">
            <circle cx="160" cy="60" r="40" fill="none" stroke="#F5F3EE" strokeWidth=".8" />
            <circle cx="160" cy="60" r="20" fill="none" stroke="#F5F3EE" strokeWidth=".5" />
            <line x1="40" y1="90" x2="160" y2="60" stroke="#F5F3EE" strokeWidth=".3" strokeDasharray="4 4" />
          </svg>
        </div>
        <div className="blog-card-body">
          <div className="blog-meta">
            <time className="blog-date" dateTime={post.isoDate}>{post.date}</time>
            <span className="blog-dot-sep" aria-hidden="true" />
            <span className="blog-read-time">{post.readTime}</span>
          </div>
          <h3 id={`post-${post.id}-title`} className="blog-card-title">{post.title}</h3>
          <p className="blog-card-excerpt">{post.excerpt}</p>
          {post.categories?.length > 0 && (
            <ul className="blog-categories" aria-label="Categories">
              {post.categories.map(cat => (
                <li
                  key={cat}
                  className="blog-cat"
                  style={{
                    color: ACCENT.color,
                    background: ACCENT.light,
                    borderColor: ACCENT.border,
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </a>
    </article>
  )
}

export default function Blog() {
  const [featured, ...rest] = posts

  return (
    <>
      <header className="page-hero">
        <p className="page-label">// Writing</p>
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">
          Thoughts on AI, data science, and the future of technology.
        </p>
        <a
          href="https://medium.com/@karanbhutani477"
          target="_blank"
          rel="noreferrer"
          className="medium-btn"
        >
          All Posts on Medium →
        </a>
      </header>

      {featured && (
        <div className="blog-featured-wrap">
          <FeaturedCard post={featured} />
        </div>
      )}

      {rest.length > 0 && (
        <ul className="blog-grid" aria-label="More posts">
          {rest.map((post, i) => (
            <li key={post.id} className="blog-grid-item">
              <BlogCard post={post} index={i} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
