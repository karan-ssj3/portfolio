import { useState } from 'react'

const SOCIALS = [
  { platform: 'GitHub',   handle: 'github.com/karan-ssj3',         url: 'https://github.com/karan-ssj3',               icon: 'GH', accent: '#4F46E5', light: '#EEF2FF', border: 'rgba(79,70,229,.2)' },
  { platform: 'LinkedIn', handle: 'linkedin.com/in/karan-bhutani',  url: 'https://www.linkedin.com/in/karan-bhutani/',   icon: 'IN', accent: '#4F46E5', light: '#EEF2FF', border: 'rgba(79,70,229,.2)' },
  { platform: 'Medium',   handle: 'medium.com/@karanbhutani477',    url: 'https://medium.com/@karanbhutani477',          icon: 'MD', accent: '#8B5CF6', light: '#F5F3FF', border: 'rgba(139,92,246,.2)' },
  { platform: 'Email',    handle: 'karanbhutani.work@gmail.com',    url: 'mailto:karanbhutani.work@gmail.com',           icon: '✉',  accent: '#0D9488', light: '#F0FDFA', border: 'rgba(13,148,136,.2)' },
]

function validate(fields) {
  const errs = {}
  if (!fields.name.trim())    errs.name    = 'Name is required'
  else if (!/^[a-zA-Z\s]+$/.test(fields.name)) errs.name = 'Letters and spaces only'
  if (!fields.email.trim())   errs.email   = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Invalid email format'
  if (!fields.message.trim()) errs.message = 'Message is required'
  return errs
}

export default function Contact() {
  const [form,      setForm]      = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [errors,    setErrors]    = useState({})
  const [submitted, setSubmitted] = useState(false)

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(ev => ({ ...ev, [k]: '' }))
  }

  const submit = e => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    const subject = encodeURIComponent(`Portfolio Inquiry from ${form.name}`)
    const body    = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'N/A'}\nCompany: ${form.company || 'N/A'}\n\n${form.message}`)
    window.open(`mailto:karanbhutani.work@gmail.com?subject=${subject}&body=${body}`, '_self')
    setSubmitted(true)
  }

  return (
    <>
      <div className="page-hero">
        <div className="page-label">// Connect</div>
        <h1 className="page-title">Get In Touch</h1>
        <p className="page-subtitle">Interested in working together? Send a transmission.</p>
      </div>

      <div className="contact-container">
        {/* Left */}
        <div>
          <h2 className="contact-intro-heading">Let's build <em>something</em></h2>
          <p className="contact-intro-text">
            Whether you're looking to build AI systems, explore a data strategy,
            or just want to talk tech — I'm always up for a conversation.
          </p>

          <div className="socials-label">// Find Me</div>

          {SOCIALS.map(s => (
            <a
              key={s.platform}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="social-card"
              style={{ '--sc-border': s.border }}
            >
              <div
                className="social-icon-box"
                style={{ background: s.light, color: s.accent, borderColor: s.border }}
              >
                {s.icon}
              </div>
              <div className="social-info">
                <div className="social-platform">{s.platform}</div>
                <div className="social-handle">{s.handle}</div>
              </div>
              <span className="social-arrow" style={{ color: s.accent }}>→</span>
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="contact-form-card">
          {submitted ? (
            <div className="form-success">
              <div className="form-success-icon">✓</div>
              <div className="form-success-title">Message ready</div>
              <p className="form-success-text">
                Your email client should have opened with the message pre-filled.
                If it didn't, reach me directly at karanbhutani.work@gmail.com
              </p>
            </div>
          ) : (
            <div className="form-grid">
              <div className={`form-field${errors.name ? ' form-field-error' : ''}`}>
                <label className="form-label">Name <span className="form-required">*</span></label>
                <input className="form-input" placeholder="Your name" value={form.name} onChange={set('name')} />
                {errors.name && <span className="form-error-msg">{errors.name}</span>}
              </div>

              <div className={`form-field${errors.email ? ' form-field-error' : ''}`}>
                <label className="form-label">Email <span className="form-required">*</span></label>
                <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} />
                {errors.email && <span className="form-error-msg">{errors.email}</span>}
              </div>

              <div className="form-field">
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" placeholder="+61 400 000 000" value={form.phone} onChange={set('phone')} />
              </div>

              <div className="form-field">
                <label className="form-label">Company</label>
                <input className="form-input" placeholder="Your organisation" value={form.company} onChange={set('company')} />
              </div>

              <div className={`form-field form-full${errors.message ? ' form-field-error' : ''}`}>
                <label className="form-label">Message <span className="form-required">*</span></label>
                <textarea className="form-input form-textarea" placeholder="Describe your project or inquiry..." value={form.message} onChange={set('message')} />
                {errors.message && <span className="form-error-msg">{errors.message}</span>}
              </div>

              <div className="form-full">
                <button className="form-submit" onClick={submit}>
                  Send Message <span className="form-submit-arrow">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
