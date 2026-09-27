import Section from '../components/Section'
import TechTicker from '../components/TechTicker'

export default function TechStack() {
  return (
    <Section id="tech-stack" className="py-24 px-6 md:px-12 lg:px-20 bg-[#F5F3EE]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          <div>
            <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-medium text-[#1C1B18] mb-4">
              Tech stack
            </h2>
            <p className="font-['Inter'] text-lg text-[#1C1B18]/70 max-w-md">
              Tools and frameworks that show up across shipped work.
            </p>
          </div>
          <TechTicker />
        </div>
      </div>
    </Section>
  )
}
