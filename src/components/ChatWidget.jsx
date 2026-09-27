import { useState, useRef, useEffect, useCallback } from 'react'
import '../styles/chatwidget.css'

const WELCOME = {
  role: 'assistant',
  content: "Hey! I'm Karan's AI assistant. Ask me anything about his experience, projects, or skills.",
}

const SUGGESTED = [
  "What does Karan do at Neilson?",
  "Tell me about his RAG projects",
  "What are his strongest skills?",
]

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function renderMarkdown(text) {
  const lines = text.split('\n')
  const out = []
  let listBuf = []

  const inlineFormat = (str) =>
    str.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="cw-bold">{p.slice(2, -2)}</strong>
        : p
    )

  const flushList = () => {
    if (!listBuf.length) return
    out.push(
      <ul key={out.length} className="cw-list">
        {listBuf.map((item, i) => <li key={i} className="cw-list-item">{inlineFormat(item)}</li>)}
      </ul>
    )
    listBuf = []
  }

  lines.forEach((line, i) => {
    const numbered = line.match(/^\d+\.\s+(.+)/)
    const bulleted  = line.match(/^[-•]\s+(.+)/)
    if (numbered || bulleted) { listBuf.push((numbered || bulleted)[1]); return }
    flushList()
    if (line.trim() === '') { if (i > 0) out.push(<div key={out.length} style={{ height: 8 }} />) }
    else out.push(<p key={out.length} className="cw-paragraph">{inlineFormat(line)}</p>)
  })
  flushList()
  return out
}

export default function ChatWidget() {
  const [open,          setOpen]          = useState(false)
  const [messages,      setMessages]      = useState([WELCOME])
  const [input,         setInput]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [showSuggested, setShowSuggested] = useState(true)
  const [error,         setError]         = useState(null)
  const messagesRef = useRef(null)
  const inputRef  = useRef(null)
  const panelRef  = useRef(null)
  const triggerRef = useRef(null)
  const wasOpenRef = useRef(false)

  // Scroll only the messages panel itself. scrollIntoView would also
  // scroll the page (and fight the page's smooth scroller).
  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    } else {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, loading])

  // Closed panel is inert so it never takes focus or clicks.
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    panel.inert = !open
    if (open) panel.removeAttribute('inert')
    else panel.setAttribute('inert', '')
  }, [open])

  // Focus the input on open; return focus to the launcher on close.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      const id = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
      return () => cancelAnimationFrame(id)
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  const closePanel = useCallback(() => {
    setOpen(false)
  }, [])

  // Focus trap: keep Tab cycling inside the open panel; Escape closes.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closePanel()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) { e.preventDefault(); return }
      const first = focusables[0]
      const last  = focusables[focusables.length - 1]
      if (!panel.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closePanel])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setError(null)
    setShowSuggested(false)

    const userMsg = { role: 'user', content: q }
    const next    = [...messages, userMsg]
    setMessages(next)
    setLoading(true)

    const controller = new AbortController()
    const wakeTimer  = setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '// Waking up the server, this takes ~30s on first load. Hang tight...',
        isSystem: true,
      }])
    }, 6000)

    try {
      const timeoutId = setTimeout(() => controller.abort(), 90000)
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://portfolio-atz1.onrender.com'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: q,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      clearTimeout(timeoutId)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setMessages([...next.filter(m => !m.isSystem), { role: 'assistant', content: data.answer }])
    } catch {
      setMessages([...next, {
        role: 'assistant',
        content: "The server didn't respond in time. Please try again. It may have been sleeping.",
      }])
    } finally {
      clearTimeout(wakeTimer)
      setLoading(false)
    }
  }

  return (
    <>
      {/* Scrim (visible on mobile only, via CSS) */}
      {open && <div className="cw-scrim" onClick={closePanel} aria-hidden="true" />}

      {/* Panel */}
      <div
        ref={panelRef}
        id="chat-panel"
        className={`cw-panel${open ? ' cw-panel-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cw-title"
        aria-hidden={!open}
      >
        <div className="cw-header">
          <div className="cw-header-dot" aria-hidden="true" />
          <div className="cw-header-title" id="cw-title">Ask Karan’s AI</div>
          <div className="cw-header-badge">RAG-powered</div>
          <button
            type="button"
            className="cw-close"
            onClick={closePanel}
            aria-label="Close chat"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="cw-body" data-lenis-prevent>
          <div
            ref={messagesRef}
            className="cw-messages"
            aria-live="polite"
            aria-label="Chat messages"
            data-lenis-prevent
          >
            {messages.map((msg, i) => (
              <div key={i} className={`cw-msg cw-msg-${msg.role}${msg.isSystem ? ' cw-msg-system' : ''}`}>
                <div className={`cw-avatar cw-avatar-${msg.role}`} aria-hidden="true">
                  {msg.role === 'assistant' ? 'K' : '↑'}
                </div>
                <div className={`cw-bubble cw-bubble-${msg.role}`}>
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="cw-msg cw-msg-assistant">
                <div className="cw-avatar cw-avatar-assistant" aria-hidden="true">K</div>
                <div className="cw-typing" aria-hidden="true">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="cw-typing-dot" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {showSuggested && messages.length === 1 && (
            <div className="cw-suggestions">
              {SUGGESTED.map(q => (
                <button key={q} type="button" className="cw-suggestion" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          {error && <div className="cw-error" role="alert">{error}</div>}
        </div>

        <div className="cw-input-bar">
          <input
            ref={inputRef}
            className="cw-input"
            placeholder="Ask something..."
            aria-label="Type your message"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            disabled={loading}
          />
          <button
            type="button"
            className="cw-send"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            →
          </button>
        </div>
      </div>

      {/* Launcher (hidden while open) */}
      <button
        ref={triggerRef}
        type="button"
        className="cw-trigger"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="chat-panel"
        hidden={open}
      >
        <svg className="cw-trigger-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <span>Ask Karan’s AI</span>
      </button>
    </>
  )
}
