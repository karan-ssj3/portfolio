import { useEffect, useState } from 'react'
import { posts } from 'virtual:rss-posts'
import Section from '../components/Section'
import PillButton from '../components/PillButton'

const MEDIUM_URL = 'https://medium.com/@karanbhutani477'
const STYLE_ID = 'blog-page-styles'

const CSS = `
.blog-header{padding:160px 0 64px}
.blog-header .display{margin:0}
.blog-body{padding:0 0 120px}
.blog-list{list-style:none;margin:0;padding:0;border-top:1px solid rgba(26,26,26,.1)}
.blog-row{position:relative;border-bottom:1px solid rgba(26,26,26,.1)}
.blog-row::before{content:'';position:absolute;left:0;top:16px;bottom:16px;width:3px;border-radius:3px;background:#FF6C4C;opacity:0;transition:opacity 180ms var(--ease-out)}
.blog-row:hover::before,.blog-row:focus-within::before{opacity:1}
.blog-row-link{display:flex;flex-direction:column;gap:8px;padding:28px 0 28px 24px;color:inherit;text-decoration:none}
.blog-row-title{margin:0;font-family:'EB Garamond',Georgia,serif;font-weight:400;font-size:32px;line-height:1.1;letter-spacing:-0.02em;overflow-wrap:anywhere}
.blog-row-date{font-family:'Figtree',system-ui,sans-serif;font-size:14px;color:rgba(26,26,26,.6)}
.blog-skeleton{display:flex;flex-direction:column;gap:12px;padding:28px 0 28px 24px;border-bottom:1px solid rgba(26,26,26,.1)}
.blog-skeleton-bar{display:block;border-radius:8px;background:#E4E4D0;animation:blog-pulse 1.4s var(--ease-inout) infinite alternate}
.blog-skeleton-bar--title{height:32px;width:min(560px,80%)}
.blog-skeleton-bar--date{height:14px;width:120px}
@keyframes blog-pulse{from{opacity:1}to{opacity:.55}}
@media (prefers-reduced-motion: reduce){.blog-skeleton-bar{animation:none}.blog-row::before{transition:none}}
.blog-empty{display:flex;flex-direction:column;align-items:flex-start;gap:20px;padding:40px 0}
.blog-empty p{margin:0;font-size:20px;line-height:26px;font-weight:500}
@media (max-width:640px){.blog-header{padding-bottom:40px}.blog-row-title{font-size:26px}.blog-row-link,.blog-skeleton{padding-left:18px}}
`

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = CSS
  document.head.appendChild(el)
}

const isThenable = (value) => Boolean(value) && typeof value.then === 'function'

// Posts are resolved at build time, but guard against a promise or a
// missing list so the page always lands in a known state.
function toState(value) {
  if (Array.isArray(value) && value.length > 0) return { status: 'ready', items: value }
  return { status: 'error', items: [] }
}

function initialState() {
  if (isThenable(posts)) return { status: 'loading', items: [] }
  return toState(posts)
}

function SkeletonRows() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading posts</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="blog-skeleton" aria-hidden="true">
          <span className="blog-skeleton-bar blog-skeleton-bar--title" />
          <span className="blog-skeleton-bar blog-skeleton-bar--date" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="blog-empty">
      <p>Posts are on Medium.</p>
      <PillButton href={MEDIUM_URL} variant="outline">
        Read on Medium
      </PillButton>
    </div>
  )
}

function PostRow({ post }) {
  return (
    <li className="blog-row">
      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        className="blog-row-link"
      >
        <h2 className="blog-row-title">{post.title}</h2>
        {post.date && (
          <time className="blog-row-date" dateTime={post.isoDate || undefined}>
            {post.date}
          </time>
        )}
      </a>
    </li>
  )
}

export default function Blog() {
  injectStyles()
  const [state, setState] = useState(initialState)

  useEffect(() => {
    if (!isThenable(posts)) return undefined
    let cancelled = false
    posts
      .then((value) => {
        if (!cancelled) setState(toState(value))
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', items: [] })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Section tone="cream" className="blog-header">
        <div className="wrap">
          <h1 className="display d-96">
            Notes on <em>building.</em>
          </h1>
        </div>
      </Section>

      <Section tone="cream" className="blog-body" aria-label="Posts">
        <div className="wrap">
          {state.status === 'loading' && <SkeletonRows />}
          {state.status === 'error' && <EmptyState />}
          {state.status === 'ready' && (
            <ul className="blog-list">
              {state.items.map((post, i) => (
                <PostRow key={post.id ?? post.link ?? i} post={post} />
              ))}
            </ul>
          )}
        </div>
      </Section>
    </>
  )
}
