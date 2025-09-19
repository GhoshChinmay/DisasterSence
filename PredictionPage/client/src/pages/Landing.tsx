import HeroSection from '@/components/HeroSection';

interface LandingProps {
  onViewPredictions?: () => void;
  onLearnMore?: () => void;
}

export default function Landing({ onViewPredictions, onLearnMore }: LandingProps) {
  return (
    <div className="w-full">
      <HeroSection 
        onViewPredictions={onViewPredictions}
        onLearnMore={onLearnMore}
      />
    </div>
  );
}