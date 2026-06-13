import HeroSection from '../features/landing/HeroSection'
import PhilosophySection from '../features/landing/PhilosophySection'
import IdentitySection from '../features/landing/IdentitySection'
import RoadmapSection from '../features/landing/RoadmapSection'
import WaitlistSection from '../features/landing/WaitlistSection'
import FooterSection from '../features/landing/FooterSection'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PhilosophySection />
      <IdentitySection />
      <RoadmapSection />
      <WaitlistSection />
      <FooterSection />
    </>
  )
}