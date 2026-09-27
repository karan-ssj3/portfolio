import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, createContext, useContext, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollProvider, { useScrollContext } from './providers/ScrollProvider'
import SkipLink from './components/SkipLink'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Experience from './pages/Experience'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import './styles/layout.css'

const ReducedMotionContext = createContext(false)

export function useReducedMotion() {
  return useContext(ReducedMotionContext)
}

function ReducedMotionProvider({ children }) {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  const { getLenis } = useScrollContext()
  useEffect(() => {
    // Reset instantly (never a smooth native scroll) and keep Lenis'
    // internal position in sync so it doesn't pull the page back.
    const lenis = getLenis?.()
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname, getLenis])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollProvider>
        <ReducedMotionProvider>
          <ScrollToTop />
          <style>{`
            :focus-visible {
              outline: 2px solid transparent;
              box-shadow: 0 0 0 2px #9C5636, 0 0 0 4px #1C1B18;
            }
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
              }
            }
            html, body {
              margin: 0;
              padding: 0;
            }
            .app {
              max-width: 100vw;
              overflow-x: clip;
            }
            main {
              outline: none;
              padding: 0 1rem;
            }
            @media (max-width: 480px) {
              main {
                padding: 0 0.5rem;
              }
            }
          `}</style>
          <div className="app">
            <SkipLink />
            <Navbar />
            <main id="main" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/experience" element={<Experience />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
            <ChatWidget />
          </div>
        </ReducedMotionProvider>
      </ScrollProvider>
    </BrowserRouter>
  )
}
