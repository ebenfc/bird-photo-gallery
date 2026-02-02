import HeroSection from "./HeroSection";
import PhotoShowcase from "./PhotoShowcase";
import FeaturesSection from "./FeaturesSection";
import FinalCTA from "./FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PhotoShowcase />
      <FeaturesSection />
      <FinalCTA />
    </div>
  );
}
