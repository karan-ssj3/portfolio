import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ParticleCanvas from '../components/ParticleCanvas'
import { useReveal } from '../hooks/useReveal'

/* ── Typewriter ─────────────────────────────────────────────── */
const ROLES = [
  'AI & Data Consultant',
  'RAG Systems Engineer',
  'LangGraph Architect',
  'ML Platform Builder',
]

function Typewriter() {
  const [text,      setText]      = useState('')
  const [roleIdx,   setRoleIdx]   = useState(0)
  const [charIdx,   setCharIdx]   = useState(0)
  const [deleting,  setDeleting]  = useState(false)
  const [paused,    setPaused]    = useState(false)

  useEffect(() => {
    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true) }, 1800)
      return () => clearTimeout(t)
    }
    const role  = ROLES[roleIdx]
    const speed = deleting ? 40 : 78
    const t = setTimeout(() => {
      if (!deleting) {
        if (charIdx < role.length) {
          setText(role.slice(0, charIdx + 1)); setCharIdx(c => c + 1)
        } else {
          setPaused(true)
        }
      } else {
        if (charIdx > 0) {
          setText(role.slice(0, charIdx - 1)); setCharIdx(c => c - 1)
        } else {
          setDeleting(false); setRoleIdx(i => (i + 1) % ROLES.length)
        }
      }
    }, speed)
    return () => clearTimeout(t)
  }, [text, charIdx, deleting, paused, roleIdx])

  return (
    <span>
      {text}<span className="tw-cursor">|</span>
    </span>
  )
}

/* ── Animated stat counter ──────────────────────────────────── */
function StatCounter({ value, suffix = '', label, color, rgb, delay = 0 }) {
  const [count,   setCount]   = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const steps = 60, dur = 1600
    let n = 0
    const inc = value / steps
    const timer = setInterval(() => {
      n += inc
      if (n >= value) { setCount(value); clearInterval(timer) }
      else setCount(Math.floor(n))
    }, dur / steps)
    return () => clearInterval(timer)
  }, [started, value])

  return (
    <div
      ref={ref}
      className="stat-box reveal"
      style={{
        '--stat-color': color,
        '--stat-glow':  `${color}80`,
        '--stat-rgb':   rgb,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

/* ── Skills ─────────────────────────────────────────────────── */
const SKILLS = [
  { label: 'Python',             cls: 'badge badge-c' },
  { label: 'LangChain',          cls: 'badge badge-c' },
  { label: 'LangGraph',          cls: 'badge badge-c' },
  { label: 'RAG Systems',        cls: 'badge badge-c' },
  { label: 'Azure OpenAI',       cls: 'badge badge-c' },
  { label: 'FAISS',              cls: 'badge badge-c' },
  { label: 'Autonomous Agents',  cls: 'badge badge-p' },
  { label: 'Machine Learning',   cls: 'badge badge-p' },
  { label: 'NLP',                cls: 'badge badge-p' },
  { label: 'Apache Airflow',     cls: 'badge badge-p' },
  { label: 'dbt Cloud',          cls: 'badge badge-p' },
  { label: 'Google Cloud',       cls: 'badge badge-m' },
  { label: 'Azure ML',           cls: 'badge badge-m' },
  { label: 'Strategic Consulting', cls: 'badge badge-m' },
  { label: 'SHAP / LIME',        cls: 'badge badge-g' },
  { label: 'Vector DBs',         cls: 'badge badge-g' },
]

/* ── Explore cards ──────────────────────────────────────────── */
const EXPLORE = [
  { to: '/projects',   icon: '⬡', title: 'Projects',   desc: 'Production AI systems, RAG pipelines & data engineering',        accent: 'var(--cyan)'    },
  { to: '/experience', icon: '◈', title: 'Experience',  desc: 'My professional journey at Deloitte, Synogize and beyond',       accent: 'var(--purple)'  },
  { to: '/blog',       icon: '◉', title: 'Blog',        desc: 'Deep dives on AI, data science and emerging technology',         accent: 'var(--magenta)' },
]

/* ── Page ───────────────────────────────────────────────────── */
export default function Home() {
  useReveal()

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="particles" />
        <div className="sweep" />
        <div className="star star-c star-1" />
        <div className="star star-p star-2" />
        <div className="star star-c star-3" />
        <div className="star star-m star-4" />
        <div className="star star-c star-5" />
        <ParticleCanvas />

        <div className="hero-content">
          <span className="hero-label">// AI & Data Consultant · Deloitte · Sydney, AU</span>
          <h1 className="hero-name">Karan Bhutani</h1>
          <p className="hero-role"><Typewriter /></p>
          <p className="hero-tagline">
            Transforming data into intelligence. Building AI systems that scale from prototype to production.
          </p>
          <div className="hero-ctas">
            <Link to="/projects" className="btn btn-cyan">View Projects</Link>
            <Link to="/contact"  className="btn btn-purple">Contact Me</Link>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="stats-grid" style={{ paddingTop: '3rem' }}>
        <StatCounter value={2}   suffix="+"  label="years consulting"    color="#00f5ff" rgb="0,245,255"   delay={0.1} />
        <StatCounter value={10}  suffix="+"  label="AI systems built"    color="#a855f7" rgb="168,85,247"  delay={0.2} />
        <StatCounter value={70}  suffix="%"  label="manual work reduced" color="#ff00ff" rgb="255,0,255"   delay={0.3} />
        <StatCounter value={280} suffix="+"  label="stakeholders led"    color="#00ff88" rgb="0,255,136"   delay={0.4} />
      </div>

      {/* ── About ──────────────────────────────────────────── */}
      <div className="section-alt">
        <div className="section" style={{ textAlign: 'center' }}>
          <span className="section-label reveal">// About Me</span>
          <h2 className="section-title reveal reveal-d1">Who I Am</h2>
          <p className="reveal reveal-d2" style={{ color: 'var(--text-dim)', maxWidth: 760, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.85 }}>
            I'm a Data and AI Consultant at Deloitte, specialising in production-ready RAG systems, autonomous AI agents,
            and cloud data engineering. With experience across ASX 200 clients in financial services, manufacturing, and
            technology, I bridge the gap between cutting-edge AI research and real-world business value.
          </p>

          {/* Education */}
          <div className="glass reveal reveal-d3" style={{ maxWidth: 700, margin: '2.5rem auto 0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ textAlign: 'left' }}>
                <p className="neon-c" style={{ fontWeight: 700, fontSize: '1.05rem' }}>Masters in Data Science &amp; Innovation</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '.95rem', marginTop: '.25rem' }}>University of Technology Sydney</p>
                <p className="neon-p" style={{ fontFamily: 'var(--mono)', fontSize: '.85rem', marginTop: '.25rem' }}>CGPA: 6.11 / 7.0</p>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', color: 'rgba(0,245,255,.55)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                2023 – 2025
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills ─────────────────────────────────────────── */}
      <div className="section" style={{ textAlign: 'center' }}>
        <span className="section-label reveal">// Core Competencies</span>
        <h2 className="section-title reveal reveal-d1">Skills &amp; Technologies</h2>
        <div className="skills-grid reveal reveal-d2" style={{ marginTop: '1.5rem' }}>
          {SKILLS.map(s => <span key={s.label} className={s.cls}>{s.label}</span>)}
        </div>
      </div>

      {/* ── Explore ────────────────────────────────────────── */}
      <div className="section-alt">
        <div className="section" style={{ textAlign: 'center' }}>
          <span className="section-label reveal">// Navigate</span>
          <h2 className="section-title reveal reveal-d1">Explore My Work</h2>
          <div className="explore-grid reveal reveal-d2" style={{ marginTop: '2rem' }}>
            {EXPLORE.map(c => (
              <Link key={c.to} to={c.to} className="explore-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="explore-icon">{c.icon}</span>
                <span className="explore-title" style={{ color: c.accent, textShadow: `0 0 8px ${c.accent}55` }}>{c.title}</span>
                <span className="explore-desc">{c.desc}</span>
                <span className="explore-arrow" style={{ color: c.accent }}>→ explore</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
