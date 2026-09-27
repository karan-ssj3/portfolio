import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, createContext, useContext, useState } from 'react'
import ScrollProvider from './providers/ScrollProvider'
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
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
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
              overflow-x: hidden;
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
