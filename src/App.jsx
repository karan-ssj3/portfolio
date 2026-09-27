import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, createContext, useContext, useState, lazy, Suspense } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollProvider, { useScrollContext } from './providers/ScrollProvider'
import SkipLink from './components/SkipLink'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import './styles/layout.css'

// Non-home routes and the chat widget ship as separate chunks.
const Projects = lazy(() => import('./pages/Projects'))
const Experience = lazy(() => import('./pages/Experience'))
const Blog = lazy(() => import('./pages/Blog'))
const Contact = lazy(() => import('./pages/Contact'))
const ChatWidget = lazy(() => import('./components/ChatWidget'))

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

function PageFallback() {
  return <div aria-hidden="true" style={{ minHeight: '100svh', background: '#FFFFEB' }} />
}

// Mounts the chat widget only after the window 'load' event.
function DeferredChatWidget() {
  const [ready, setReady] = useState(() => document.readyState === 'complete')
  useEffect(() => {
    if (ready) return undefined
    const onLoad = () => setReady(true)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [ready])
  if (!ready) return null
  return (
    <Suspense fallback={null}>
      <ChatWidget />
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollProvider>
        <ReducedMotionProvider>
          <ScrollToTop />
          <style>{`
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
            /* Slabs run full-bleed; sections own their inner padding. */
            main {
              outline: none;
              padding: 0;
            }
          `}</style>
          <div className="app">
            <SkipLink />
            <Navbar />
            <main id="main" tabIndex={-1}>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/experience" element={<Experience />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <DeferredChatWidget />
          </div>
        </ReducedMotionProvider>
      </ScrollProvider>
    </BrowserRouter>
  )
}
