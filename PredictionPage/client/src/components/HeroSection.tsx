import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DisasterIcon from './DisasterIcon';

interface HeroSectionProps {
  onViewPredictions?: () => void;
  onLearnMore?: () => void;
}

export default function HeroSection({ onViewPredictions, onLearnMore }: HeroSectionProps) {
  const handleViewPredictions = () => {
    console.log('View Predictions button clicked');
    onViewPredictions?.();
  };

  const handleLearnMore = () => {
    console.log('Learn More button clicked');
    onLearnMore?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Content */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight" data-testid="text-hero-title">
              AI-powered Disaster Prediction 
              <span className="text-primary"> for India</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Real-time risk assessment and 7-day forecasting for cyclones, floods, earthquakes, 
              and landslides across all Indian states using advanced machine learning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={handleViewPredictions}
              data-testid="button-view-predictions"
            >
              View Predictions
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={handleLearnMore}
              data-testid="button-learn-more"
            >
              About Project
            </Button>
          </div>
        </div>

        {/* Disaster Types Grid */}
        <div className="mt-20">
          <h2 className="text-2xl font-semibold text-center text-foreground mb-12">
            Monitored Disaster Types
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { 
                type: 'cyclone' as const, 
                title: 'Cyclones', 
                description: 'Tropical storms and hurricanes affecting coastal regions'
              },
              { 
                type: 'flood' as const, 
                title: 'Floods', 
                description: 'River overflow and urban flooding during monsoons'
              },
              { 
                type: 'earthquake' as const, 
                title: 'Earthquakes', 
                description: 'Seismic activity in high-risk geological zones'
              },
              { 
                type: 'landslide' as const, 
                title: 'Landslides', 
                description: 'Slope failures in mountainous and hilly regions'
              }
            ].map((disaster) => (
              <Card key={disaster.type} className="hover-elevate transition-all duration-300">
                <CardContent className="p-6 text-center space-y-4">
                  <DisasterIcon type={disaster.type} size="lg" />
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{disaster.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {disaster.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary" data-testid="text-stat-states">28</div>
              <div className="text-sm text-muted-foreground">States & UTs Covered</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary" data-testid="text-stat-accuracy">95%</div>
              <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary" data-testid="text-stat-updates">24/7</div>
              <div className="text-sm text-muted-foreground">Real-time Updates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}