# Portfolio Website — Full Design Brief for Claude Design

This document covers everything needed to understand, modify, or redesign the portfolio website.
Owner: **Karan Bhutani** — Data and AI Consultant based in Sydney, Australia.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 | Functional components, hooks only |
| Build tool | Vite 5 | Dev server on port 5173 |
| Routing | React Router v6 | `BrowserRouter` + `NavLink` for active state |
| Styling | Pure CSS — single file (`src/index.css`) | No Tailwind, no UI libraries |
| Animations | CSS keyframes + Canvas API | No animation libraries |
| Fonts | Inter (body) + JetBrains Mono (code/labels) | Via Google Fonts in `index.html` |
| Chat backend | FastAPI + LangGraph + OpenAI | Runs separately on port 8000 |
| Vector DB | FAISS | Local, rebuilt via `backend/ingest.py` |

**Zero external runtime UI dependencies** — only `react`, `react-dom`, `react-router-dom`.

---

## Visual Design Language

### Theme
Futuristic dark — "deep space cyberpunk." Black/navy background with neon cyan, purple, and magenta accents. Every surface uses glassmorphism.

### Design Tokens (`:root` in `src/index.css`)
```css
--cyan:        #00f5ff       /* primary neon — buttons, active states, highlights */
--purple:      #a855f7       /* secondary — user chat bubbles, project badges */
--magenta:     #ff00ff       /* tertiary accent — third variant of badges */
--green:       #00ff88       /* success — live indicator dot */
--bg:          #050510       /* deep space — page background */
--surface:     rgba(10,15,45,0.72)   /* glassmorphism card background */
--radius:      18px          /* card corners */
--radius-sm:   10px          /* smaller elements */
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1)      /* color/shadow transitions */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)  /* elastic hover lift */
--mono:        'JetBrains Mono', monospace
--sans:        'Inter', system-ui, sans-serif
--text:        #e8eaf6       /* primary text */
--text-dim:    #8892b0       /* secondary text */
--text-muted:  #4a5568       /* placeholder/tertiary text */
```

### Glassmorphism Pattern
All cards use:
```css
background: var(--surface);        /* semi-transparent navy */
backdrop-filter: blur(22px);       /* glass blur */
border: 1px solid rgba(0,245,255,0.12);  /* subtle cyan border */
border-radius: var(--radius);
```
On hover: border brightens to `rgba(0,245,255,0.4)` + neon box-shadow + `translateY(-6px)`.

### Hover Behaviour
All interactive elements:
- `transition: border-color .18s var(--ease-out), box-shadow .18s var(--ease-out), transform .22s var(--ease-spring)`
- `will-change: transform` — GPU layer promotion for zero-lag response
- Spring easing gives an elastic "snap up" feel on hover

### Shapes
- Cards: `border-radius: 18px`
- Buttons: `border-radius: 999px` — full pill shape
- Badges: `border-radius: 999px` — full pill shape

### CRT Overlay
A subtle scanline effect sits over the entire page via `body::after` with `repeating-linear-gradient`. Opacity ~3% — barely perceptible, adds texture.

---

## Animation Inventory

All animations are pure CSS keyframes defined in `src/index.css`.

| Keyframe name | What it does | Where used |
|---|---|---|
| `fade-up` | Fades element up from 20px below | All `.reveal` sections, hero text |
| `text-glow` | Pulses cyan glow on gradient text | Hero name |
| `orb-drift-1/2/3` | Slow floating movement, different paths | Background orbs in hero |
| `particle-drift-1/2` | Subtle up-drift | Dot field overlay in hero |
| `sweep` | Diagonal highlight line crossing hero | Hero section once on load |
| `shooting-star` | Diagonal streak fading out | 5 stars in hero, staggered delays |
| `grid-scroll` | Background grid scrolling upward | Persistent hero background |
| `blink` | Cursor blink | Typewriter cursor, chat live dot |
| `cw-bounce` | Three-dot bounce | Chat typing indicator |

### Scroll Reveal
`src/hooks/useReveal.js` — `IntersectionObserver` watches all `.reveal` elements at `threshold: 0.1`. Adds `.visible` class which triggers `fade-up` + opacity. Delay variants: `.reveal-d1` through `.reveal-d3` add `animation-delay: 0.1s / 0.2s / 0.3s`.

### Particle Canvas (`src/components/ParticleCanvas.jsx`)
- 90 particles, colours randomly picked from cyan/purple/magenta
- Each particle drifts with random velocity (capped at 1.2)
- Mouse repulsion radius: 120px — particles flee the cursor
- Connection lines drawn between particles within 110px — `rgba(0,245,255, opacity)` strokes, opacity fades with distance
- `requestAnimationFrame` loop with full cleanup (`cancelAnimationFrame` + `removeEventListener`) on unmount

---

## Project Structure

```
react-portfolio/
├── index.html                  # Google Fonts link tags here
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx                # ReactDOM.createRoot entry
│   ├── App.jsx                 # Router + Navbar + Footer + ChatWidget + ScrollToTop
│   ├── index.css               # ENTIRE design system — ~1300 lines, one file
│   ├── components/
│   │   ├── Navbar.jsx          # Fixed glassmorphism top nav
│   │   ├── Footer.jsx          # Minimal bottom bar
│   │   ├── ParticleCanvas.jsx  # Canvas particle system
│   │   └── ChatWidget.jsx      # Floating AI chat bubble
│   ├── pages/
│   │   ├── Home.jsx            # Landing page (hero + stats + about + skills + explore)
│   │   ├── Experience.jsx      # Work history timeline
│   │   ├── Projects.jsx        # Project card grid
│   │   ├── Blog.jsx            # Medium RSS feed
│   │   └── Contact.jsx         # Contact form + social links
│   ├── hooks/
│   │   └── useReveal.js        # IntersectionObserver scroll-reveal
│   └── data/
│       ├── experience.js       # Work history data
│       └── projects.js         # Project cards data
└── backend/
    ├── main.py                 # FastAPI server (port 8000)
    ├── agent.py                # LangGraph RAG agent
    ├── ingest.py               # Builds FAISS index from docstore/
    ├── docstore/               # Markdown files — edit these to update AI knowledge
    │   ├── about.md
    │   ├── experience.md
    │   ├── projects.md
    │   ├── education.md
    │   └── skills.md
    ├── vectorstore/            # FAISS index (gitignored, rebuilt by ingest.py)
    └── requirements.txt
```

---

## Pages — Detailed Breakdown

### `/` — Home (`src/pages/Home.jsx`)

The most complex page. Contains several stacked sections.

**Hero Section**
- Full-viewport height
- Background layers (bottom to top):
  1. Dark `--bg` base
  2. `grid-scroll` animated grid lines
  3. Three floating orbs (CSS radial gradients, `orb-drift` animations)
  4. Particle dot field overlay
  5. Sweep diagonal highlight (runs once on load)
  6. Five shooting stars with staggered delays
  7. `<ParticleCanvas>` — interactive canvas on top
- Hero content (centred):
  - `// Karan Bhutani` — monospace label
  - Large gradient name (`linear-gradient` white→cyan→purple→magenta, `-webkit-background-clip: text`)
  - `<Typewriter>` cycling through 4 roles: "AI & Data Consultant", "RAG Systems Engineer", "LangGraph Architect", "ML Platform Builder"
  - Sub-tagline paragraph
  - Two CTA buttons: "View My Work →" (cyan, routes to `/projects`) and "Get In Touch" (outline, routes to `/contact`)

**Stats Strip**
Four `<StatCounter>` components in a grid. Each counts up from 0 when scrolled into view (IntersectionObserver). Values:
- 2+ Years Experience
- 10+ Projects Shipped
- 3 Clients (enterprise)
- 2500+ Hours Automated

**About Section**
- Two-column layout: text paragraph left, education card right
- Education card lists: Master of Data Science (UTS), PG Diploma CS & AI (IIIT-Delhi), B.Com Honours (Delhi University)
- Scroll-reveal on entry

**Skills Section**
Badge grid of technologies grouped loosely. Badges use `badge-c` (cyan) / `badge-p` (purple) / `badge-m` (magenta) class variants. Technologies: Python, LangChain, LangGraph, RAG/FAISS, PyTorch, TensorFlow, SQL, Apache Airflow, dbt Cloud, GCP, AWS, Azure, Tableau, Power BI, Docker, Git.

**Explore Cards Strip**
Three glass cards linking to the other main pages: Experience, Projects, Blog. Each has an icon, title, short description, and an arrow link.

---

### `/experience` — Experience (`src/pages/Experience.jsx`)

Timeline of career history. Data lives in `src/data/experience.js`.

Each `<ExpCard>` renders:
- Left neon border (cyan colour)
- Role title + company name
- Date range + location badge
- Bullet-point description list
- Tech stack badges at the bottom (cyan colour)

**Current entries:**
1. **Data and AI Consultant — Deloitte** (Jul 2025–Present)
   - RAG systems, asset health monitoring, AI strategy, stakeholder workshops
   - Stack: Python, Azure OpenAI, LangChain, LangGraph, FAISS, Flask, Azure ML
2. **Data Scientist & AI Engineer — Synogize** (Jan 2025–Jul 2025)
   - Autonomous agent frameworks, tax RAG system, ELT pipelines
   - Stack: Python, LangChain, LangGraph, FAISS, Apache Airflow, dbt Cloud, GCP

---

### `/projects` — Projects (`src/pages/Projects.jsx`)

3-column responsive grid (collapses to 1 on mobile). Data lives in `src/data/projects.js`.

Each project card has:
- Title
- Description paragraph
- Tech stack badges — colour controlled by `accent` field: `'c'` = cyan, `'p'` = purple, `'m'` = magenta
- GitHub link button (colour matches accent)

**Current 6 projects:**
1. Autonomous ML Agents Framework (accent: cyan)
2. Multi-Agent Trading System (accent: purple)
3. Time-Series Forecasting Agentic Workflow (accent: magenta)
4. Classification Agent — Auto-Train/Evaluate/Explain (accent: cyan)
5. Financial Consultant RAG Agent (accent: purple)
6. Autonomous Personal Tax Assistant (accent: magenta)

---

### `/blog` — Blog (`src/pages/Blog.jsx`)

Fetches live posts from Medium via `rss2json` API:
```
https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@karanbhutani477
```
- Shows up to 6 posts
- While fetching: `// loading posts...` in monospace
- If fetch fails: falls back to 3 hardcoded static posts
- Each `<BlogCard>` shows: thumbnail (or `✦` placeholder), date, read time, title, excerpt (160 chars, HTML stripped), category badges, "Read on Medium →" link

---

### `/contact` — Contact (`src/pages/Contact.jsx`)

Two-column layout:
- **Left column:** intro text + 4 social links (GitHub, LinkedIn, Medium, Email) as glass cards with icon + label + handle
- **Right column:** validated contact form

Form fields: Name (required, letters+spaces only), Email (required, regex validated), Phone (optional), Company (optional), Message (required).

On submit: builds a `mailto:karanbhutani.work@gmail.com` link with pre-filled subject and body — opens the user's email client. No server required.

---

## Components

### Navbar (`src/components/Navbar.jsx`)
- Fixed top, full width, glassmorphism background
- Logo: "KB" monogram left-aligned
- Nav links: Home, Experience, Projects, Blog, Contact
- `NavLink` with `isActive` → adds `.active` class → cyan colour + bottom border
- Mobile: hamburger icon (3 animated spans) toggles a full-width dropdown overlay
- Scroll threshold: after 50px scroll, border-bottom appears

### Footer (`src/components/Footer.jsx`)
- Minimal: "© 2025 Karan Bhutani" + GitHub / LinkedIn / Medium icon links
- Neon cyan on hover

### ChatWidget (`src/components/ChatWidget.jsx`)
See full section below.

---

## Chat Feature — Full Scope

### What it is
A floating AI chat assistant embedded in the portfolio. Karan's visitors can ask anything about him — work, skills, projects, availability — and get grounded, accurate answers from a RAG agent that reads Karan's own document store.

### Frontend — `ChatWidget.jsx`

**Trigger:** Fixed `◈` button, bottom-right corner of every page. Always visible across all routes (mounted in `App.jsx` outside `<Routes>`).

**Panel:** Slides up as a glass panel (420px wide, 580px max-height) when button clicked.

**Panel sections:**
1. **Header bar** — "ASK KARAN'S AI" in monospace caps + green pulsing live dot
2. **Messages area** — scrollable, flex column
3. **Welcome message** — auto-shown from the bot on open
4. **Suggested question chips** — 3 quick-start prompts shown until first message is sent:
   - "What does Karan do at Deloitte?"
   - "Tell me about his RAG projects"
   - "What are his strongest skills?"
5. **Conversation history** — user bubbles (purple, right-aligned) + bot bubbles (cyan-tinted, left-aligned with K avatar)
6. **Typing indicator** — three bouncing cyan dots while awaiting response
7. **Error state** — red message if backend unreachable
8. **Input row** — text input + send button (→)

**Markdown rendering:** Bot responses contain markdown (`**bold**`, numbered lists). A lightweight inline `renderMarkdown()` function (no library) handles:
- `**text**` → `<strong>`
- Numbered lines (`1. ...`) → `<ul>` list items
- Bullet lines (`- ...`) → `<ul>` list items
- Blank lines → spacing
- Plain lines → `<p>` tags

**Conversation history** is passed to the API on every request so the agent has full context of the current session.

---

### Backend — FastAPI + LangGraph

**Entry point:** `backend/main.py` — FastAPI server on port 8000.

**Endpoint:** `POST /chat`
```json
Request:  { "question": "string", "history": [{"role": "user|assistant", "content": "string"}] }
Response: { "answer": "string" }
```
CORS is open for `localhost:5173`, `localhost:4000`, `localhost:3000`.

**Agent:** `backend/agent.py` — LangGraph graph with two nodes:

```
START → [retrieve] → [generate] → END
```

- **retrieve node:** FAISS similarity search, returns top 5 chunks relevant to the question
- **generate node:** GPT-4o-mini with system prompt instructing it to answer as "Karan's AI assistant" using only the retrieved context. Full conversation history is injected as `HumanMessage`/`AIMessage` turns.

**System prompt persona:** Helpful, concise, professional. Answers questions about Karan grounded in retrieved context. Honest when context doesn't cover something.

**Model:** `gpt-4o-mini` at `temperature=0.3` (factual, low creativity).

**Embeddings:** `text-embedding-3-small` (OpenAI).

**Vector store:** FAISS, saved locally in `backend/vectorstore/`. Loaded once on first request, cached in module scope.

---

### Document Store — `backend/docstore/`

Five markdown files that define what the AI knows about Karan. Edit these, then run `python ingest.py` to rebuild the FAISS index.

| File | Contents |
|---|---|
| `about.md` | Personal bio, contact info, location, personality, availability |
| `experience.md` | Full Deloitte + Synogize roles with project-level detail |
| `projects.md` | All 6 portfolio projects with tech and impact |
| `education.md` | Three degrees + 7 certifications |
| `skills.md` | Full taxonomy: languages, ML, GenAI, data engineering, cloud, DevOps |

**Chunking:** `RecursiveCharacterTextSplitter` with `chunk_size=600`, `chunk_overlap=80`. Separators: `\n## `, `\n### `, `\n\n`, `\n`, ` ` — respects markdown heading hierarchy.

**To update knowledge:**
1. Edit any `.md` file in `backend/docstore/`
2. Run: `cd backend && .venv/bin/python ingest.py`
3. Restart the API server (or it auto-reloads with `--reload` flag)

---

## How to Run Locally

```bash
# React frontend
cd react-portfolio
npm install
npm run dev          # → http://localhost:5173

# Backend (separate terminal)
cd react-portfolio/backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt unstructured markdown
cp .env.example .env             # add OPENAI_API_KEY
python ingest.py                 # build FAISS index (once)
.venv/bin/uvicorn main:app --reload --port 8000
```

---

## CSS Architecture

Everything lives in `src/index.css` — one file, no preprocessor, ~1300 lines.

**Sections in order:**
1. Google Fonts `@import`
2. `:root` — design tokens
3. Reset / base styles
4. Typography utilities (`.gradient-text`, `.section-label`, `.section-title`)
5. Layout (`.app`, `.page-bg`, `.section`, `.page-hero`)
6. Navbar styles
7. Button styles (`.btn`, `.btn-cyan`, `.btn-outline`)
8. Badge styles (`.badge`, `.badge-c`, `.badge-p`, `.badge-m`)
9. Glass card (`.glass`)
10. Home page — hero layers, stat counters, about, skills, explore cards
11. Experience page — timeline cards
12. Projects page — project grid
13. Blog page — blog grid + blog cards
14. Contact page — contact grid, social links, form
15. Footer
16. Keyframe animations
17. Responsive breakpoints (`@media`)
18. Chat widget styles (`.cw-*`)

**Naming convention:** BEM-lite — page-scoped prefixes (`hero-`, `exp-`, `proj-`, `blog-`, `cw-`) with flat modifier classes (`.active`, `.visible`, `.btn-cyan`).

---

## Data Files

### `src/data/projects.js`
Array of project objects. Each has:
```js
{ id, title, description, techStack: [], github, demo, accent: 'c'|'p'|'m' }
```
`accent` controls badge and button colour: `'c'` = cyan, `'p'` = purple, `'m'` = magenta.

### `src/data/experience.js`
Array of experience objects. Each has:
```js
{ id, title, company, location, startDate, endDate, description: [], techStack: [] }
```

---

## Key Constraints and Decisions

| Decision | Reason |
|---|---|
| No Tailwind | Full design control, no utility-class specificity wars |
| No component library | Previous attempt with Reflex/Radix broke gradient text — Radix injects `color` at high specificity, overriding `-webkit-text-fill-color: transparent` |
| Pure CSS over Framer Motion | Zero dependency weight; CSS keyframes are sufficient for the animation complexity needed |
| Canvas for particles | Mouse repulsion is not possible with CSS alone |
| `will-change: transform` on all cards | Promotes to GPU compositing layer — eliminates hover lag |
| `transition` split by property | Avoids animating expensive layout properties; snappier than `transition: all` |
| `mailto:` for contact form | Zero backend required for contact; keeps the frontend fully static |
| `rss2json` for Medium | Avoids CORS issues fetching RSS directly from Medium |
| `gpt-4o-mini` for chat | Cost-effective; the retrieval grounds the answers so a smaller model works well |
| FAISS local (not cloud vector DB) | Simple, free, fast for this data size (~30 chunks); no external service dependency |
