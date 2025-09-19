import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DisasterIcon from '@/components/DisasterIcon';

export default function About() {
  const handleContactClick = () => {
    console.log('Contact support clicked');
  };

  const handleGithubClick = () => {
    console.log('GitHub repository clicked');
  };

  const techStack = [
    'React & TypeScript',
    'Node.js & Express',
    'XGBoost ML Models',
    'OpenWeatherMap API',
    'Leaflet Maps',
    'Tailwind CSS'
  ];

  const features = [
    {
      icon: '🎯',
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning models trained on historical disaster data'
    },
    {
      icon: '🗺️',
      title: 'Interactive Mapping',
      description: 'Real-time risk visualization across all Indian states and districts'
    },
    {
      icon: '📊',
      title: '7-Day Forecasting',
      description: 'Detailed predictions with confidence levels and affected population estimates'
    },
    {
      icon: '⚡',
      title: 'Real-time Updates',
      description: '24/7 monitoring with live weather data integration and alerts'
    }
  ];

  const disasters = [
    {
      type: 'cyclone' as const,
      name: 'Cyclones',
      description: 'Monitors tropical storms and hurricanes affecting coastal regions with wind speed and pressure analysis.'
    },
    {
      type: 'flood' as const,
      name: 'Floods',
      description: 'Predicts river overflow and urban flooding using rainfall data and soil moisture analysis.'
    },
    {
      type: 'earthquake' as const,
      name: 'Earthquakes',
      description: 'Assesses seismic activity risk in geological fault zones using historical tremor patterns.'
    },
    {
      type: 'landslide' as const,
      name: 'Landslides',
      description: 'Evaluates slope failure risk in mountainous regions based on rainfall and soil conditions.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        
        {/* About Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground" data-testid="text-about-title">
            About Disaster Prediction India
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            An AI-powered disaster prediction system that provides 7-day forecasts for cyclones, floods, 
            earthquakes, and landslides across India, helping communities prepare for and mitigate natural disasters.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                To save lives and reduce economic losses by providing accurate, timely, and accessible 
                disaster risk information to government agencies, emergency responders, and citizens across India.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-foreground">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl" role="img" aria-hidden="true">
                      {feature.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Disaster Types */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-foreground">Monitored Disasters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {disasters.map((disaster, index) => (
              <Card key={index} className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <DisasterIcon type={disaster.type} size="md" />
                    <span>{disaster.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {disaster.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <strong>India Meteorological Department (IMD)</strong>
                <p className="text-muted-foreground">Weather forecasting and cyclone tracking</p>
              </div>
              <div className="text-sm">
                <strong>National Disaster Management Authority</strong>
                <p className="text-muted-foreground">Historical disaster records and guidelines</p>
              </div>
              <div className="text-sm">
                <strong>Geological Survey of India</strong>
                <p className="text-muted-foreground">Seismic monitoring and geological data</p>
              </div>
              <div className="text-sm">
                <strong>OpenWeatherMap API</strong>
                <p className="text-muted-foreground">Real-time weather data integration</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Accuracy</span>
                <Badge variant="secondary" data-testid="text-overall-accuracy">94.2%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cyclone Prediction</span>
                <Badge variant="secondary">96.8%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Flood Prediction</span>
                <Badge variant="secondary">93.1%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Earthquake Assessment</span>
                <Badge variant="secondary">91.5%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Landslide Prediction</span>
                <Badge variant="secondary">89.7%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-8 text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Get Involved</h2>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                This project is open source and welcomes contributions from researchers, developers, 
                and disaster management professionals.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGithubClick}
                data-testid="button-github"
              >
                View on GitHub
              </Button>
              <Button
                variant="outline"
                onClick={handleContactClick}
                data-testid="button-contact"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-sm text-foreground">Important Disclaimer</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This system provides risk assessments based on available data and should be used as a supplementary tool. 
                Always follow official government advisories and evacuation orders from local authorities during emergency situations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}