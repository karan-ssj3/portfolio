import { useState, useRef, useEffect } from 'react'

function renderMarkdown(text) {
  const lines = text.split('\n')
  const out = []
  let listBuf = []

  const flushList = () => {
    if (!listBuf.length) return
    out.push(
      <ul key={out.length} className="cw-md-list">
        {listBuf.map((item, i) => <li key={i}>{inlineFormat(item)}</li>)}
      </ul>
    )
    listBuf = []
  }

  const inlineFormat = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p
    )
  }

  lines.forEach((line, i) => {
    const numbered = line.match(/^\d+\.\s+(.+)/)
    const bulleted  = line.match(/^[-•]\s+(.+)/)

    if (numbered || bulleted) {
      listBuf.push((numbered || bulleted)[1])
    } else {
      flushList()
      if (line.trim() === '') {
        if (i > 0) out.push(<br key={out.length} />)
      } else {
        out.push(<p key={out.length} className="cw-md-p">{inlineFormat(line)}</p>)
      }
    }
  })
  flushList()
  return out
}

const WELCOME = "Hey! I'm Karan's AI assistant. Ask me anything about his experience, projects, or skills."

const SUGGESTED = [
  "What does Karan do at Deloitte?",
  "Tell me about his RAG projects",
  "What are his strongest skills?",
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`cw-message ${isUser ? 'cw-user' : 'cw-bot'}`}>
      {!isUser && <span className="cw-avatar">K</span>}
      <div className="cw-bubble">{isUser ? msg.content : renderMarkdown(msg.content)}</div>
    </div>
  )
}

export default function ChatWidget() {
  const [open,    setOpen]    = useState(false)
  const [input,   setInput]   = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, open, loading])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setError(null)

    const userMsg = { role: 'user', content: q }
    const next = [...history, userMsg]
    setHistory(next)
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history: history }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setHistory([...next, { role: 'assistant', content: data.answer }])
    } catch (e) {
      setError('Could not reach the chat server. Make sure the backend is running.')
      setHistory(next.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className="cw-fab"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Chat with Karan\'s AI'}
      >
        {open ? '✕' : '◈'}
      </button>

      {/* Panel */}
      {open && (
        <div className="cw-panel">
          <div className="cw-header">
            <span className="cw-header-dot" />
            <span>Ask Karan's AI</span>
          </div>

          <div className="cw-messages">
            <div className="cw-message cw-bot">
              <span className="cw-avatar">K</span>
              <div className="cw-bubble">{WELCOME}</div>
            </div>

            {history.length === 0 && (
              <div className="cw-suggestions">
                {SUGGESTED.map(s => (
                  <button key={s} className="cw-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}

            {history.map((m, i) => <Message key={i} msg={m} />)}

            {loading && (
              <div className="cw-message cw-bot">
                <span className="cw-avatar">K</span>
                <div className="cw-bubble cw-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {error && <p className="cw-error">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <form className="cw-input-row" onSubmit={e => { e.preventDefault(); send() }}>
            <input
              className="cw-input"
              placeholder="Ask something..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button className="cw-send" type="submit" disabled={loading || !input.trim()}>→</button>
          </form>
        </div>
      )}
    </>
  )
}
