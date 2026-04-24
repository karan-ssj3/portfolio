import { useState, useRef, useEffect } from 'react'

const WELCOME = {
  role: 'assistant',
  content: "Hey! I'm Karan's AI assistant. Ask me anything about his experience, projects, or skills.",
}

const SUGGESTED = [
  "What does Karan do at Deloitte?",
  "Tell me about his RAG projects",
  "What are his strongest skills?",
]

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
  const [open,          setOpen]          = useState(true)
  const [messages,      setMessages]      = useState([WELCOME])
  const [input,         setInput]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [showSuggested, setShowSuggested] = useState(true)
  const [error,         setError]         = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

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
        content: '// Waking up the server — this takes ~30s on first load. Hang tight...',
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
        content: "The server didn't respond in time. Please try again — it may have been sleeping.",
      }])
    } finally {
      clearTimeout(wakeTimer)
      setLoading(false)
    }
  }

  return (
    <>
      {/* Panel */}
      <div className={`cw-panel${open ? ' cw-panel-open' : ''}`}>
        <div className="cw-header">
          <div className="cw-header-dot" />
          <div className="cw-header-title">Ask Karan's AI</div>
          <div className="cw-header-badge">RAG-powered</div>
        </div>

        <div className="cw-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`cw-msg cw-msg-${msg.role}`}>
              <div className={`cw-avatar cw-avatar-${msg.role}`}>
                {msg.role === 'assistant' ? 'K' : '↑'}
              </div>
              <div className={`cw-bubble cw-bubble-${msg.role}`}>
                {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="cw-msg cw-msg-assistant">
              <div className="cw-avatar cw-avatar-assistant">K</div>
              <div className="cw-typing">
                {[0, 150, 300].map(d => (
                  <span key={d} className="cw-typing-dot" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {showSuggested && messages.length === 1 && (
          <div className="cw-suggestions">
            {SUGGESTED.map(q => (
              <button key={q} className="cw-suggestion" onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        )}

        {error && <div className="cw-error">{error}</div>}

        <div className="cw-input-bar">
          <input
            ref={inputRef}
            className="cw-input"
            placeholder="Ask something..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            disabled={loading}
          />
          <button
            className="cw-send"
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            →
          </button>
        </div>
      </div>

      {/* Trigger */}
      <button
        className={`cw-trigger${open ? ' cw-trigger-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <span className="cw-trigger-icon">{open ? '+' : '◈'}</span>
      </button>
    </>
  )
}
