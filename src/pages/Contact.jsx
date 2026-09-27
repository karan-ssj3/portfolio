import { useState } from 'react'
import Section from '../components/Section'
import PillButton from '../components/PillButton'

const SOCIALS = [
  { platform: 'GitHub',   handle: 'github.com/karan-ssj3',        url: 'https://github.com/karan-ssj3',             icon: 'github' },
  { platform: 'LinkedIn', handle: 'linkedin.com/in/karan-bhutani', url: 'https://www.linkedin.com/in/karan-bhutani/', icon: 'linkedin' },
  { platform: 'Medium',   handle: 'medium.com/@karanbhutani477',   url: 'https://medium.com/@karanbhutani477',        icon: 'medium' },
  { platform: 'Email',    handle: 'karanbhutani.work@gmail.com',   url: 'mailto:karanbhutani.work@gmail.com',         icon: 'mail' },
]

// Display order for the social cards.
const SOCIAL_ORDER = ['Email', 'GitHub', 'LinkedIn', 'Medium']

// Small inline glyphs, 20px, drawn in currentColor (ink).
const ICONS = {
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>
  ),
  github: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.81c0 .27.18.6.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </svg>
  ),
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-1 1.84-2.05 3.8-2.05 4.06 0 4.82 2.67 4.82 6.15v5.4h-4v-4.79c0-1.14-.02-2.61-1.59-2.61-1.6 0-1.84 1.24-1.84 2.53v4.87h-4v-11Z" />
    </svg>
  ),
  medium: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <ellipse cx="7" cy="12" rx="5.5" ry="5.8" />
      <ellipse cx="16.3" cy="12" rx="2.8" ry="5.4" />
      <ellipse cx="21.2" cy="12" rx="1" ry="4.8" />
    </svg>
  ),
}

const STYLE_ID = 'contact-page-styles'

const CSS = `
.contact-page{padding:160px 0 120px}
.contact-grid{display:grid;grid-template-columns:minmax(0,1fr);grid-template-areas:'lead' 'card' 'socials';gap:clamp(32px,5vw,80px);align-items:start}
.contact-aside{display:contents}
.contact-lead{grid-area:lead}
.contact-card{grid-area:card}
.contact-socials{grid-area:socials}
.contact-lead .display{margin:0 0 24px}
.contact-lead p{margin:0;max-width:30ch;font-size:20px;line-height:26px;font-weight:500}
.contact-card{background:#E4E4D0;color:#1A1A1A;border-radius:24px;padding:clamp(24px,3vw,40px)}
.contact-form{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.contact-field{display:flex;flex-direction:column;gap:8px;min-width:0}
.contact-full{grid-column:1 / -1}
.contact-label{font-size:14px;font-weight:600}
.contact-required{color:#7F1C34;margin-left:0}
.contact-input{width:100%;box-sizing:border-box;background:#FFFFEB;color:#1A1A1A;border:1px solid rgba(26,26,26,.15);border-radius:16px;padding:12px 16px;font-family:'Figtree',system-ui,sans-serif;font-size:16px;line-height:1.5;box-shadow:none;transition:border-color 180ms var(--ease-out)}
.contact-input::placeholder{color:rgba(26,26,26,.6);opacity:1}
.contact-input:focus,.contact-input:focus-visible{outline:3px solid #034F46;outline-offset:2px}
.contact-input[aria-invalid='true']{border-color:#7F1C34}
.contact-textarea{resize:vertical;min-height:140px}
.contact-error{font-size:14px;color:#7F1C34}
.contact-success{display:flex;flex-direction:column;gap:12px}
.contact-success h2{margin:0}
.contact-success p{margin:0}
.contact-success a{color:inherit}
.contact-socials{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.contact-social{display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;padding:24px;border:1px solid rgba(26,26,26,.15);border-radius:24px;background:#FFFFEB;color:#1A1A1A;text-decoration:none;transition:background-color 180ms var(--ease-out)}
.contact-social:hover{background:#F0D7FF}
.contact-social-icon{display:inline-flex;width:20px;height:20px;color:#1A1A1A}
.contact-social-platform{font-family:'EB Garamond',Georgia,serif;font-size:28px;line-height:1}
.contact-social-handle{font-size:14px;color:rgba(26,26,26,.6);overflow-wrap:anywhere}
@media (min-width:900px) and (max-width:1023px){.contact-grid{grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);grid-template-areas:'lead card' 'socials socials'}.contact-socials{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (min-width:1024px){.contact-grid{grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);grid-template-areas:'aside card'}.contact-aside{display:flex;flex-direction:column;gap:48px;grid-area:aside;position:sticky;top:120px}}
@media (max-width:767px){.contact-textarea{resize:none}}
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
          {/* Left: headline, availability and socials (socials drop below the form under 1024px) */}
          <div className="contact-aside">
            <div className="contact-lead">
              <h1 className="display d-75">
                Let’s <em>talk.</em>
              </h1>
              <p>
                He is based in Sydney and open to conversations about AI systems, data strategy,
                consulting engagements, and collaboration.
              </p>
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
                    <span className="contact-social-icon" aria-hidden="true">{ICONS[s.icon]}</span>
                    <span className="contact-social-platform">{s.platform}</span>
                    <span className="contact-social-handle">{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
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
                    Name<span className="contact-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    className="contact-input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={set('name')}
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  />
                  {errors.name && <span id="contact-name-error" className="contact-error">{errors.name}</span>}
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-email">
                    Email<span className="contact-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    className="contact-input"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  />
                  {errors.email && <span id="contact-email-error" className="contact-error">{errors.email}</span>}
                </div>

                <div className="contact-field">
                  <label className="contact-label" htmlFor="contact-phone">Phone (optional)</label>
                  <input
                    id="contact-phone"
                    className="contact-input"
                    type="tel"
                    placeholder="04XX XXX XXX"
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
                    Message<span className="contact-required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    className="contact-input contact-textarea"
                    placeholder="Describe your project or inquiry..."
                    value={form.message}
                    onChange={set('message')}
                    rows={5}
                    aria-required="true"
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
      </div>
    </Section>
  )
}
