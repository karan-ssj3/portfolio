import { useState } from 'react'
import Section from '../components/Section'
import PillButton from '../components/PillButton'

const SOCIALS = [
  { platform: 'GitHub',   handle: 'github.com/karan-ssj3',        url: 'https://github.com/karan-ssj3',             icon: 'GH' },
  { platform: 'LinkedIn', handle: 'linkedin.com/in/karan-bhutani', url: 'https://www.linkedin.com/in/karan-bhutani/', icon: 'IN' },
  { platform: 'Medium',   handle: 'medium.com/@karanbhutani477',   url: 'https://medium.com/@karanbhutani477',        icon: 'MD' },
  { platform: 'Email',    handle: 'karanbhutani.work@gmail.com',   url: 'mailto:karanbhutani.work@gmail.com',         icon: '@'  },
]

// Display order for the social cards.
const SOCIAL_ORDER = ['Email', 'GitHub', 'LinkedIn', 'Medium']

const STYLE_ID = 'contact-page-styles'

const CSS = `
.contact-page{padding:160px 0 120px}
.contact-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(32px,5vw,80px);align-items:start}
.contact-lead .display{margin:0 0 24px}
.contact-lead p{margin:0;max-width:30ch;font-size:20px;line-height:26px;font-weight:500}
.contact-card{background:#E4E4D0;color:#1A1A1A;border-radius:24px;padding:clamp(24px,3vw,40px)}
.contact-form{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.contact-field{display:flex;flex-direction:column;gap:8px;min-width:0}
.contact-full{grid-column:1 / -1}
.contact-label{font-size:14px;font-weight:600}
.contact-required{color:#7F1C34}
.contact-input{width:100%;box-sizing:border-box;background:#FFFFEB;color:#1A1A1A;border:1px solid rgba(26,26,26,.15);border-radius:16px;padding:12px 16px;font-family:'Figtree',system-ui,sans-serif;font-size:16px;line-height:1.5;box-shadow:none;transition:border-color 180ms var(--ease-out)}
.contact-input::placeholder{color:rgba(26,26,26,.45)}
.contact-input:focus,.contact-input:focus-visible{outline:3px solid #034F46;outline-offset:2px}
.contact-input[aria-invalid='true']{border-color:#7F1C34}
.contact-textarea{resize:vertical;min-height:140px}
.contact-error{font-size:14px;color:#7F1C34}
.contact-success{display:flex;flex-direction:column;gap:12px}
.contact-success h2{margin:0}
.contact-success p{margin:0}
.contact-success a{color:inherit}
.contact-socials{list-style:none;margin:clamp(48px,6vw,80px) 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.contact-social{display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;padding:24px;border:1px solid rgba(26,26,26,.1);border-radius:24px;background:#FFFFEB;color:#1A1A1A;text-decoration:none;transition:background-color 180ms var(--ease-out)}
.contact-social:hover{background:#F0D7FF}
.contact-social-icon{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;border:1px solid rgba(26,26,26,.15);font-size:13px;font-weight:600}
.contact-social-platform{font-family:'EB Garamond',Georgia,serif;font-size:28px;line-height:1}
.contact-social-handle{font-size:14px;color:rgba(26,26,26,.6);overflow-wrap:anywhere}
@media (max-width:1024px){.contact-socials{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:900px){.contact-grid{grid-template-columns:1fr}}
@media (max-width:640px){.contact-form{grid-template-columns:1fr}.contact-socials{grid-template-columns:1fr}}
@media (prefers-reduced-motion: reduce){.contact-input,.contact-social{transition:none}}
`

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = CSS
  document.head.appendChild(el)
}

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
  injectStyles()
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

  const socials = SOCIAL_ORDER.map((name) => SOCIALS.find((s) => s.platform === name)).filter(Boolean)

  return (
    <Section tone="cream" className="contact-page" aria-label="Contact">
      <div className="wrap">
        <div className="contact-grid">
          {/* Left: headline and availability */}
          <div className="contact-lead">
            <h1 className="display d-75">
              Let’s <em>talk.</em>
            </h1>
            <p>
              He is based in Sydney and open to conversations about AI systems, data strategy,
              consulting engagements, and collaboration.
            </p>
          </div>

          {/* Right: form card */}
          <div className="contact-card">
            {submitted ? (
              <div className="contact-success" role="status">
                <h2 className="display d-32">Message ready</h2>
                <p>
                  Your email client should have opened with the message pre-filled.
                  If it didn't, reach me directly at{' '}
                  <a href="mailto:karanbhutani.work@gmail.com">karanbhutani.work@gmail.com</a>.
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit} noValidate>
                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-name">
                    Name <span className="contact-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    className="contact-input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={set('name')}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  />
                  {errors.name && <span id="contact-name-error" className="contact-error">{errors.name}</span>}
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-email">
                    Email <span className="contact-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    className="contact-input"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  />
                  {errors.email && <span id="contact-email-error" className="contact-error">{errors.email}</span>}
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-phone">Phone</label>
                  <input
                    id="contact-phone"
                    className="contact-input"
                    type="tel"
                    placeholder="+61 400 000 000"
                    value={form.phone}
                    onChange={set('phone')}
                    autoComplete="tel"
                  />
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-company">Company</label>
                  <input
                    id="contact-company"
                    className="contact-input"
                    placeholder="Your organisation"
                    value={form.company}
                    onChange={set('company')}
                    autoComplete="organization"
                  />
                </div>

                <div className="contact-field contact-full">
                  <label className="contact-label" htmlFor="contact-message">
                    Message <span className="contact-required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    className="contact-input contact-textarea"
                    placeholder="Describe your project or inquiry..."
                    value={form.message}
                    onChange={set('message')}
                    rows={5}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  />
                  {errors.message && <span id="contact-message-error" className="contact-error">{errors.message}</span>}
                </div>

                <div className="contact-full">
                  <PillButton type="submit" variant="primary" icon="→">
                    Send Message
                  </PillButton>
                </div>
              </form>
            )}
          </div>
        </div>

        <ul className="contact-socials" aria-label="Find me">
          {socials.map((s) => (
            <li key={s.platform}>
              <a
                href={s.url}
                target={s.url.startsWith('mailto') ? undefined : '_blank'}
                rel={s.url.startsWith('mailto') ? undefined : 'noreferrer'}
                className="contact-social"
              >
                <span className="contact-social-icon" aria-hidden="true">{s.icon}</span>
                <span className="contact-social-platform">{s.platform}</span>
                <span className="contact-social-handle">{s.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
