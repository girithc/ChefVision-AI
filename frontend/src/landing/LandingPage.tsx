import { HeroSection } from './sections/HeroSection'
import { PlatformSection } from './sections/PlatformSection'
import { CtaSection } from './sections/CtaSection'

export function LandingPage() {
  return (
    <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
      <HeroSection />
      <PlatformSection />
      <CtaSection />
    </div>
  )
}
