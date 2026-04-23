import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'

const SOCIALS = [
  { label: 'GitHub',   href: 'https://github.com/karan-ssj3',                icon: '⌥', sub: 'github.com/karan-ssj3' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/karan-bhutani/',    icon: '◈', sub: 'linkedin.com/in/karan-bhutani' },
  { label: 'Medium',   href: 'https://medium.com/@karanbhutani477',           icon: '◉', sub: 'medium.com/@karanbhutani477' },
  { label: 'Email',    href: 'mailto:karanbhutani.work@gmail.com',            icon: '✉', sub: 'karanbhutani.work@gmail.com' },
]

function validate(fields) {
  const errors = {}
  if (!fields.name.trim()) errors.name = 'Name is required'
  else if (!/^[a-zA-Z\s]+$/.test(fields.name)) errors.name = 'Letters and spaces only'
  if (!fields.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = 'Enter a valid email'
  if (!fields.message.trim()) errors.message = 'Message is required'
  return errors
}

export default function Contact() {
  useReveal()

  const [fields, setFields] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent,   setSent]   = useState(false)

  const set = k => e => setFields(f => ({ ...f, [k]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    // Build mailto link
    const body = encodeURIComponent(
      `Name: ${fields.name}\nEmail: ${fields.email}\nPhone: ${fields.phone}\nCompany: ${fields.company}\n\n${fields.message}`
    )
    window.location.href = `mailto:karanbhutani.work@gmail.com?subject=Portfolio%20Enquiry%20from%20${encodeURIComponent(fields.name)}&body=${body}`
    setSent(true)
    setFields({ name: '', email: '', phone: '', company: '', message: '' })
  }

  return (
    <div className="page-bg">
      <div className="page-hero">
        <span className="section-label reveal">// Connect</span>
        <h1 className="section-title gradient-text reveal reveal-d1">Get In Touch</h1>
        <p className="reveal reveal-d2" style={{ color: 'var(--text-dim)', marginTop: '.5rem' }}>
          Interested in working together? Send a transmission.
        </p>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        <div className="contact-grid">
          {/* Info */}
          <div className="reveal">
            <h3 style={{ color: 'var(--text)', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: 700 }}>
              Let's build something
            </h3>
            <p className="contact-info" style={{ color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '.95rem' }}>
              Whether you're looking to build AI systems, explore a data strategy, or just want to talk tech —
              I'm always up for a conversation.
            </p>
            <div className="contact-socials">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} className="social-link" target="_blank" rel="noreferrer">
                  <span className="social-icon">{s.icon}</span>
                  <span>
                    <span style={{ display: 'block', color: 'inherit', fontSize: '.75rem', letterSpacing: '1.5px' }}>{s.label}</span>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '.7rem', letterSpacing: 0, textTransform: 'none', fontFamily: 'var(--sans)' }}>{s.sub}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="reveal reveal-d2">
            {sent ? (
              <div className="form-success">
                ✓ Message sent — your email client should have opened. I'll get back to you soon.
              </div>
            ) : (
              <form className="form-card" onSubmit={submit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input className="form-input" placeholder="Your name" value={fields.name} onChange={set('name')} />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className="form-input" type="email" placeholder="your@email.com" value={fields.email} onChange={set('email')} />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" type="tel" placeholder="+61 400 000 000" value={fields.phone} onChange={set('phone')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input className="form-input" placeholder="Your organisation" value={fields.company} onChange={set('company')} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea className="form-textarea" placeholder="Describe your project or inquiry..." value={fields.message} onChange={set('message')} />
                    {errors.message && <span className="form-error">{errors.message}</span>}
                  </div>

                  <button type="submit" className="btn btn-cyan form-submit">
                    Send Message →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
