# Karan Bhutani — Portfolio

Personal portfolio website built with React and pure CSS. Futuristic dark design with interactive particle animations, neon effects, and smooth spring transitions.

**Live site:** _deploy link here_

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Routing | React Router v6 |
| Build | Vite 5 |
| Styling | Pure CSS (no UI libraries) |
| Animations | CSS keyframes + Canvas API |
| Fonts | Inter · JetBrains Mono (Google Fonts) |

No Tailwind. No component libraries. Every style is handwritten.

---

## Features

- **Interactive particle canvas** — 90 particles with mouse repulsion and proximity connection lines, rendered on a `<canvas>` with `requestAnimationFrame`
- **Typewriter hero** — cycles through roles with realistic typing + delete cadence
- **Animated stat counters** — count up from zero when scrolled into view via `IntersectionObserver`
- **Scroll reveal** — every section fades up on entry
- **Spring hover transitions** — `cubic-bezier(0.34, 1.56, 0.64, 1)` on all cards and buttons for a snappy elastic feel
- **Live Medium RSS** — Blog page fetches posts from Medium via `rss2json`; falls back to static cards if the API is unavailable
- **Glassmorphism cards** — `backdrop-filter: blur(22px)` with neon border glow on hover
- **CRT scanline overlay** — subtle full-page scanline effect via a fixed `body::after`
- **Floating orbs + particle dot fields + shooting stars** — layered CSS animations in the hero
- **Mobile responsive** — hamburger nav, single-column layouts, fluid type with `clamp()`
- **Zero external runtime dependencies** — only `react`, `react-dom`, and `react-router-dom`

---

## Pages

| Route | Description |
|---|---|
| `/` | Hero with particles, stat counters, about, skills, explore cards |
| `/experience` | Deloitte & Synogize timeline with neon left-border cards |
| `/projects` | 6 AI/ML project cards with tech badges and GitHub links |
| `/blog` | Live Medium RSS feed with fallback static posts |
| `/contact` | Two-column layout — social links + validated contact form |

---

## Getting Started

**Requirements:** Node 18+

```bash
# Clone
git clone https://github.com/karan-ssj3/portfolio.git
cd portfolio

# Install
npm install

# Dev server (localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Fixed glassmorphism nav with active link detection
│   ├── Footer.jsx          # Minimal neon footer
│   └── ParticleCanvas.jsx  # Canvas particle system with mouse interaction
├── pages/
│   ├── Home.jsx            # Hero, stats, about, skills, explore
│   ├── Experience.jsx      # Career timeline
│   ├── Projects.jsx        # Project grid
│   ├── Blog.jsx            # Medium RSS + fallback
│   └── Contact.jsx         # Form + social links
├── hooks/
│   └── useReveal.js        # IntersectionObserver scroll-reveal hook
├── data/
│   ├── experience.js       # Career data
│   └── projects.js         # Project data
├── App.jsx                 # Router + layout
├── main.jsx                # React entry point
└── index.css               # Complete design system (1 file, no preprocessor)
```

---

## Design System

All design tokens live in CSS custom properties at `:root`:

```css
--cyan:    #00f5ff   /* primary neon */
--purple:  #a855f7   /* secondary */
--magenta: #ff00ff   /* accent */
--green:   #00ff88   /* success */
--bg:      #050510   /* deep space */
--surface: rgba(10, 15, 45, 0.72)  /* glassmorphism */
--radius:  18px
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

---

## Deployment

The site builds to a standard static bundle (`dist/`) and deploys anywhere:

**Vercel**
```bash
npm i -g vercel && vercel
```

**Netlify**
```bash
npm run build
# drag dist/ into Netlify drop zone, or connect the repo
```

**GitHub Pages**
```bash
npm run build
# push dist/ to gh-pages branch
```

---

## License

MIT — use freely, attribution appreciated.
