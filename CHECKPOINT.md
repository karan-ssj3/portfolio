# Portfolio Checkpoint — 2026-04-23

## Where We Are

React portfolio fully built and pushed to GitHub.

- **Repo:** https://github.com/karan-ssj3/portfolio
- **Local dev:** `cd /Users/karanbhutani/projects/website/react-portfolio && npm run dev` → http://localhost:5173
- **Stack:** React 18 + Vite 5 + pure CSS (no component libraries)

---

## Why We Rebuilt from Scratch

Started with a Python/Reflex portfolio. Two blockers hit that weren't worth fighting:

1. **Gradient text invisible** — `rx.heading` is a Radix UI component that injects its own `color` via CSS custom properties at high specificity, overriding `-webkit-text-fill-color: transparent`. Switching to `rx.box` + `!important` worked partially but was fragile.
2. **No real animations** — Reflex's Python-to-React compilation layer made complex Canvas/JS animations impractical.

Rebuilt the whole thing in React where CSS works without framework interference.

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| Pure CSS, no Tailwind | Full control over design tokens; no utility-class noise |
| Canvas particle system | True mouse-repulsion interactivity — not possible with CSS alone |
| `will-change: transform` on all cards | GPU layer promotion = zero-lag hover response |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` spring easing | Elastic snap feel on hover lift |
| `border-radius: 999px` on buttons/badges | Pill shape — requested after user flagged "too pointy" |
| Transition split (color `.18s` / transform `.22s`) | Avoids animating expensive properties; snappier than `transition: all` |
| `rss2json` for Medium posts | No CORS issues fetching RSS directly; graceful static fallback |
| `mailto:` for contact form | Zero backend required |

---

## File Map

```
react-portfolio/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Glassmorphism nav, NavLink active state, mobile hamburger
│   │   ├── Footer.jsx          # Minimal — copyright + 3 links
│   │   └── ParticleCanvas.jsx  # 90 particles, mouse repulsion r=120, connection lines r=110
│   ├── pages/
│   │   ├── Home.jsx            # Typewriter, StatCounter, hero layers, skills, explore cards
│   │   ├── Experience.jsx      # Deloitte + Synogize timeline cards
│   │   ├── Projects.jsx        # 6 AI/ML project cards, accent-colored badges
│   │   ├── Blog.jsx            # Live Medium RSS → fallback to 3 static posts
│   │   └── Contact.jsx         # Validated form → mailto, social links column
│   ├── hooks/
│   │   └── useReveal.js        # IntersectionObserver scroll-reveal (adds .visible class)
│   ├── data/
│   │   ├── experience.js       # Deloitte (Jul 2025–Present), Synogize (Jan–Jul 2025)
│   │   └── projects.js         # 6 projects with accent field ('c'/'p'/'m')
│   ├── App.jsx                 # Router + layout + ScrollToTop
│   ├── main.jsx                # ReactDOM.createRoot entry
│   └── index.css               # ~700 lines — full design system, all animations
├── index.html                  # Google Fonts: Inter + JetBrains Mono
├── vite.config.js
├── package.json
├── .gitignore
├── README.md
└── CHECKPOINT.md               # ← this file
```

---

## Design Tokens (`:root` in `index.css`)

```css
--cyan:    #00f5ff   /* primary neon */
--purple:  #a855f7   /* secondary */
--magenta: #ff00ff   /* accent */
--green:   #00ff88   /* success */
--bg:      #050510   /* deep space */
--surface: rgba(10, 15, 45, 0.72)
--radius:  18px
--radius-sm: 10px
--ease-out: cubic-bezier(0.23, 1, 0.32, 1)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
--mono: 'JetBrains Mono', 'Fira Code', monospace
--sans: 'Inter', system-ui, sans-serif
```

---

## Animations in `index.css`

| Name | What it does |
|---|---|
| `fade-up` | Sections + hero text entrance |
| `text-glow` | Hero name pulsing cyan glow |
| `orb-drift-1/2/3` | Floating background orbs |
| `particle-drift-1/2` | Subtle dot field movement |
| `sweep` | Diagonal highlight line across hero |
| `shooting-star` | 5 stars on staggered delays |
| `grid-scroll` | Background grid moving upward |
| `blink` | Typewriter cursor |

---

## Potential Next Steps

- **Deploy to Vercel** — `npm i -g vercel && vercel` from the project root
- **Add resume download** — link a PDF in Navbar or Hero CTA
- **Add more projects** — edit `src/data/projects.js`
- **Update experience** — edit `src/data/experience.js` when roles change
- **Custom domain** — set in Vercel/Netlify dashboard after deploy
- **Analytics** — drop in Vercel Analytics or Plausible script tag in `index.html`
- **Blog auto-refresh** — Medium posts already live via RSS; no action needed
