import Hero from '../sections/Hero'
import HowIWork from '../sections/HowIWork'
import ProjectSpace from '../sections/ProjectSpace'
import TechStack from '../sections/TechStack'
import Process from '../sections/Process'
import ExperienceTimeline from '../sections/ExperienceTimeline'
import CTA from '../sections/CTA'
import FAQ from '../sections/FAQ'
import FooterCTA from '../sections/FooterCTA'

export default function Home() {
  return (
    <>
      <Hero />
      <HowIWork />
      <ProjectSpace />
      <TechStack />
      <Process />
      <ExperienceTimeline />
      <CTA />
      <FAQ />
      <FooterCTA />
    </>
  )
}
