import { lazy, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from '../sections/Hero'
import LazySection from '../components/LazySection'

const DeepLayers = lazy(() => import('../sections/DeepLayers'))
const TechStack = lazy(() => import('../sections/TechStack'))
const CapabilityMorph = lazy(() => import('../components/CapabilityMorph'))
const ProjectSpace = lazy(() => import('../sections/ProjectSpace'))
const HowIWork = lazy(() => import('../sections/HowIWork'))
const ExperienceTimeline = lazy(() => import('../sections/ExperienceTimeline'))
const FAQ = lazy(() => import('../sections/FAQ'))
const FooterCTA = lazy(() => import('../sections/FooterCTA'))

gsap.registerPlugin(ScrollTrigger)

const REFRESH_DELAY_MS = 300

const CREAM = '#FFFFEB'
const INK = '#1A1A1A'
const TEAL = '#034F46'

// Slab sequence: cream, ink, ink, cream, teal, cream, cream, cream, ink.
export default function Home() {
  // Sticky sections change layout after mount, so recompute trigger positions once.
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), REFRESH_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <Hero />
      <LazySection id="deep-layers" component={DeepLayers} minHeight="500vh" mobileMinHeight="320vh" background={INK} />
      <LazySection id="stack" component={TechStack} minHeight="320px" background={INK} />
      <LazySection id="capabilities" component={CapabilityMorph} minHeight="420vh" mobileMinHeight="300vh" background={CREAM} />
      <LazySection id="projects" component={ProjectSpace} minHeight="340vh" mobileMinHeight="220vh" background={TEAL} />
      <LazySection id="how-i-work" component={HowIWork} minHeight="260vh" mobileMinHeight="200vh" background={CREAM} />
      <LazySection id="experience" component={ExperienceTimeline} componentProps={{ compact: true }} minHeight="120vh" background={CREAM} />
      <LazySection id="faq" component={FAQ} minHeight="100vh" background={CREAM} />
      <LazySection id="contact" component={FooterCTA} minHeight="80vh" background={INK} />
    </>
  )
}
