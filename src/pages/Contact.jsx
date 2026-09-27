import { useState } from 'react'

const ACCENT = '#9C5636'
const ACCENT_SOFT = 'rgba(156, 86, 54, 0.10)'
const ACCENT_BORDER = 'rgba(156, 86, 54, 0.22)'

const SOCIALS = [
  { platform: 'GitHub',   handle: 'github.com/karan-ssj3',        url: 'https://github.com/karan-ssj3',             icon: 'GH' },
  { platform: 'LinkedIn', handle: 'linkedin.com/in/karan-bhutani', url: 'https://www.linkedin.com/in/karan-bhutani/', icon: 'IN' },
  { platform: 'Medium',   handle: 'medium.com/@karanbhutani477',   url: 'https://medium.com/@karanbhutani477',        icon: 'MD' },
  { platform: 'Email',    handle: 'karanbhutani.work@gmail.com',   url: 'mailto:karanbhutani.work@gmail.com',         icon: '@'  },
]

function validate(fields) {
  const errs = {}
  if (!fields.name.trim()) {
    errs.name = 'Name is required'
  } else if (!/^[a-zA-Z\s]+$/.test(fields.name)) {
    errs.name = 'Letters and spaces only'
  }
  if (!fields.email.trim()) {
    errs.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errs.email = 'Invalid email format'
  }
  if (!fields.message.trim()) {
    errs.message = 'Message is required'
  }
  return errs
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    const subject = encodeURIComponent(`Portfolio Inquiry from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'N/A'}\nCompany: ${form.company || 'N/A'}\n\n${form.message}`
    )
    window.location.href = `mailto:karanbhutani.work@gmail.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <>
      <main className="page-main">
        <header className="page-hero">
          <p className="page-label">// Connect</p>
          <h1 className="page-title">Get In Touch</h1>
          <p className="page-subtitle">Interested in working together? Send a transmission.</p>
        </header>

        <section className="contact-container" aria-label="Contact">
          {/* Left — intro + socials */}
          <div className="contact-intro">
            <h2 className="contact-intro-heading">
              Let's build <em>something</em>
            </h2>
            <p className="contact-intro-text">
              Whether you're looking to build AI systems, explore a data strategy,
              or just want to talk tech — I'm always up for a conversation.
            </p>

            <p className="socials-label">// Find Me</p>

            <ul className="socials-list">
              {SOCIALS.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target={s.url.startsWith('mailto') ? undefined : '_blank'}
                    rel={s.url.startsWith('mailto') ? undefined : 'noreferrer'}
                    className="social-card"
                  >
                    <span className="social-icon-box" aria-hidden="true">{s.icon}</span>
                    <span className="social-info">
                      <span className="social-platform">{s.platform}</span>
                      <span className="social-handle">{s.handle}</span>
                    </span>
                    <span className="social-arrow" aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <div className="contact-form-card">
            {submitted ? (
              <div className="form-success" role="status">
                <div className="form-success-icon" aria-hidden="true">✓</div>
                <h2 className="form-success-title">Message ready</h2>
                <p className="form-success-text">
                  Your email client should have opened with the message pre-filled.
                  If it didn't, reach me directly at{' '}
                  <a href="mailto:karanbhutani.work@gmail.com">karanbhutani.work@gmail.com</a>.
                </p>
              </div>
            ) : (
              <form className="form-grid" onSubmit={submit} noValidate>
                <div className={`form-field${errors.name ? ' form-field-error' : ''}`}>
                  <label className="form-label" htmlFor="contact-name">
                    Name <span className="form-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    className="form-input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={set('name')}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="form-error-msg">{errors.name}</span>}
                </div>

                <div className={`form-field${errors.email ? ' form-field-error' : ''}`}>
                  <label className="form-label" htmlFor="contact-email">
                    Email <span className="form-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    className="form-input"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <span className="form-error-msg">{errors.email}</span>}
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="contact-phone">Phone</label>
                  <input
                    id="contact-phone"
                    className="form-input"
                    type="tel"
                    placeholder="+61 400 000 000"
                    value={form.phone}
                    onChange={set('phone')}
                    autoComplete="tel"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="contact-company">Company</label>
                  <input
                    id="contact-company"
                    className="form-input"
                    placeholder="Your organisation"
                    value={form.company}
                    onChange={set('company')}
                    autoComplete="organization"
                  />
                </div>

                <div className={`form-field form-full${errors.message ? ' form-field-error' : ''}`}>
                  <label className="form-label" htmlFor="contact-message">
                    Message <span className="form-required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    className="form-input form-textarea"
                    placeholder="Describe your project or inquiry..."
                    value={form.message}
                    onChange={set('message')}
                    rows={5}
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && <span className="form-error-msg">{errors.message}</span>}
                </div>

                <div className="form-full">
                  <button type="submit" className="form-submit">
                    Send Message <span className="form-submit-arrow" aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
