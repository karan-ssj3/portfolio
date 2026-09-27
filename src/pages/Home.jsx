import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GrainCanvas from '../components/GrainCanvas'

const ROLES = [
  'AI & Data Consultant',
  'RAG Systems Engineer',
  'LangGraph Architect',
  'ML Platform Builder',
]

const STATS = [
  { value: 2,    suffix: '+',   label: 'Years Consulting',   accent: 'var(--accent)' },
  { value: 10,   suffix: '+',   label: 'AI Systems Built',   accent: 'var(--purple)' },
  { value: 70,   suffix: '%',   label: 'Manual Work Reduced', accent: 'var(--teal)' },
  { value: 280,  suffix: '+',   label: 'Stakeholders Led',   accent: 'var(--accent)' },
]

const SKILLS = {
  accent: ['Python', 'LangChain', 'LangGraph', 'RAG / FAISS'],
  purple: ['PyTorch', 'TensorFlow', 'SQL', 'Apache Airflow'],
  teal:   ['dbt Cloud', 'GCP', 'AWS', 'Azure'],
  accent2:['Tableau', 'Power BI', 'Docker', 'Git'],
}

function Typewriter() {
  const [text,     setText]     = useState('')
  const [roleIdx,  setRoleIdx]  = useState(0)
  const [charIdx,  setCharIdx]  = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [paused,   setPaused]   = useState(false)

  useEffect(() => {
    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true) }, 2200)
      return () => clearTimeout(t)
    }
    const role  = ROLES[roleIdx]
    const speed = deleting ? 40 : 80
    const t = setTimeout(() => {
      if (!deleting) {
        if (charIdx < role.length) { setText(role.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }
        else setPaused(true)
      } else {
        if (charIdx > 0) { setText(role.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }
        else { setDeleting(false); setRoleIdx(i => (i + 1) % ROLES.length) }
      }
    }, speed)
    return () => clearTimeout(t)
  }, [text, charIdx, deleting, paused, roleIdx])

  return <span>{text}<span className="hero-cursor" /></span>
}

function StatCounter({ value, suffix, label, accent, delay }) {
  const [count,   setCount]   = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const dur = 1800
    const startTime = performance.now()
    const t = setTimeout(() => {
      const animate = (now) => {
        const p = Math.min((now - startTime) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 4)
        setCount(Math.floor(eased * value))
        if (p < 1) requestAnimationFrame(animate)
        else setCount(value)
      }
      requestAnimationFrame(animate)
    }, delay)
    return () => clearTimeout(t)
  }, [started, value, delay])

  return (
    <div ref={ref} className="stat-card" style={{ '--stat-accent': accent }}>
      <span className="stat-value">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
      {started && <div className="stat-bar" style={{ animationDelay: `${delay + 600}ms` }} />}
    </div>
  )
}

const EXPLORE = [
  { to: '/projects',   icon: '⬡', title: 'Projects',   desc: 'Production AI systems, RAG pipelines & data engineering', accent: 'var(--accent)' },
  { to: '/experience', icon: '◈', title: 'Experience',  desc: 'My professional journey at Deloitte, Synogize and UTS',   accent: 'var(--purple)' },
  { to: '/blog',       icon: '◉', title: 'Blog',        desc: 'Deep dives on AI, data science and emerging technology',  accent: 'var(--teal)' },
]

export default function Home() {
  return (
    <>
      <GrainCanvas />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            AI & Data Consultant · Deloitte · Sydney, AU
          </div>

          <h1 className="hero-name">
            Karan<br /><em>Bhutani</em>
          </h1>

          <div className="hero-role"><Typewriter /></div>

          <p className="hero-tagline">
            Transforming data into intelligence. Building AI systems that scale
            from prototype to production.
          </p>

          <div className="hero-ctas">
            <Link to="/projects" className="btn btn-primary">
              View Projects <span className="btn-arrow">→</span>
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <StatCounter key={s.label} {...s} delay={i * 120} />
          ))}
        </div>
      </section>

      <div className="section-divider" />

      {/* ── About ── */}
      <section className="about-section">
        <div className="about-container">
          <div>
            <div className="about-label">// About</div>
            <h2 className="about-heading">
              Building <em>intelligent</em> systems<br />at enterprise scale
            </h2>
            <p className="about-text">
              Data and AI Consultant at Deloitte Australia, specialising in production RAG systems,
              autonomous agent frameworks, and ML platform engineering. From asset health prediction
              for mining clients to AI strategy workshops with 280+ stakeholders, I bridge the gap
              between cutting-edge research and real-world deployment.
            </p>
          </div>

          <div className="edu-card">
            <div className="edu-card-title">Education</div>
            <div className="edu-item">
              <div className="edu-dot" style={{ background: 'var(--accent)' }} />
              <div>
                <div className="edu-degree">Master of Data Science & Innovation</div>
                <div className="edu-school">UTS, Sydney · 2025</div>
              </div>
            </div>
            <div className="edu-item">
              <div className="edu-dot" style={{ background: 'var(--purple)' }} />
              <div>
                <div className="edu-degree">PG Diploma, CS & AI</div>
                <div className="edu-school">IIIT-Delhi · 2023</div>
              </div>
            </div>
            <div className="edu-item">
              <div className="edu-dot" style={{ background: 'var(--teal)' }} />
              <div>
                <div className="edu-degree">B.Com Honours</div>
                <div className="edu-school">Delhi University · 2020</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Skills ── */}
      <section className="skills-section">
        <div className="skills-container">
          <div className="skills-header">
            <div className="about-label">// Tech Stack</div>
            <h2 className="section-heading">Tools of the trade</h2>
          </div>
          <div className="skills-grid">
            {SKILLS.accent.map(s  => <span key={s} className="skill-badge badge-accent">{s}</span>)}
            {SKILLS.purple.map(s  => <span key={s} className="skill-badge badge-purple">{s}</span>)}
            {SKILLS.teal.map(s    => <span key={s} className="skill-badge badge-teal">{s}</span>)}
            {SKILLS.accent2.map(s => <span key={s} className="skill-badge badge-accent">{s}</span>)}
          </div>
        </div>
      </section>

      {/* ── Explore ── */}
      <section className="explore-section">
        <div className="explore-container">
          <div className="explore-header">
            <div className="about-label">// Navigate</div>
            <h2 className="section-heading">Explore my work</h2>
          </div>
          <div className="explore-grid">
            {EXPLORE.map(card => (
              <Link
                key={card.to}
                to={card.to}
                className="explore-card"
                style={{ '--card-accent': card.accent }}
              >
                <span className="explore-icon" style={{ color: card.accent }}>{card.icon}</span>
                <div className="explore-card-title">{card.title}</div>
                <div className="explore-card-desc">{card.desc}</div>
                <div className="explore-card-link" style={{ color: card.accent }}>
                  Explore <span className="btn-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
