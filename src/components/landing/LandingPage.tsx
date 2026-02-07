import HeroSection from "./HeroSection";
import PhotoShowcase from "./PhotoShowcase";
import FeaturesSection from "./FeaturesSection";
import SharingSection from "./SharingSection";
import FinalCTA from "./FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PhotoShowcase />
      <FeaturesSection />
      <SharingSection />
      <FinalCTA />
    </div>
  );
}
