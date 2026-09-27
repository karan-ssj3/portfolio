import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from '../sections/Hero'
import DeepLayers from '../sections/DeepLayers'
import TechStack from '../sections/TechStack'
import CapabilityMorph from '../components/CapabilityMorph'
import ProjectSpace from '../sections/ProjectSpace'
import HowIWork from '../sections/HowIWork'
import ExperienceTimeline from '../sections/ExperienceTimeline'
import FAQ from '../sections/FAQ'
import FooterCTA from '../sections/FooterCTA'

gsap.registerPlugin(ScrollTrigger)

const REFRESH_DELAY_MS = 300

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
      <DeepLayers />
      <TechStack />
      <CapabilityMorph />
      <ProjectSpace />
      <HowIWork />
      <ExperienceTimeline compact />
      <FAQ />
      <FooterCTA />
    </>
  )
}
