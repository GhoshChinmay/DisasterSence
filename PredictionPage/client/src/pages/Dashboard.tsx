import { useState } from 'react';
import InteractiveMap from '@/components/InteractiveMap';
import DisasterCard from '@/components/DisasterCard';
import PredictionTable from '@/components/PredictionTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const [selectedLocation, setSelectedLocation] = useState('India Overview');
  const [selectedDisaster, setSelectedDisaster] = useState<'cyclone' | 'flood' | 'earthquake' | 'landslide' | 'all'>('all');

  // Mock current alerts //todo: replace with real API data
  const mockAlerts = [
    {
      type: 'cyclone' as const,
      currentRisk: 'High' as const,
      location: 'Odisha Coast',
      probability: 78,
      nextDayRisk: 'Extreme' as const,
      affectedPopulation: 2500000,
      lastUpdated: '2 hours ago'
    },
    {
      type: 'flood' as const,
      currentRisk: 'Medium' as const,
      location: 'Bihar Plains',
      probability: 45,
      nextDayRisk: 'Medium' as const,
      affectedPopulation: 1200000,
      lastUpdated: '1 hour ago'
    },
    {
      type: 'earthquake' as const,
      currentRisk: 'Medium' as const,
      location: 'Delhi NCR',
      probability: 35,
      nextDayRisk: 'High' as const,
      affectedPopulation: 800000,
      lastUpdated: '3 hours ago'
    },
    {
      type: 'landslide' as const,
      currentRisk: 'High' as const,
      location: 'Himachal Hills',
      probability: 62,
      nextDayRisk: 'Medium' as const,
      affectedPopulation: 150000,
      lastUpdated: '1 hour ago'
    }
  ];

  const handleDisasterFilter = (disaster: string) => {
    setSelectedDisaster(disaster as any);
  };

  const handleCardClick = (location: string) => {
    setSelectedLocation(location);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
              Risk Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time disaster risk assessment across India
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Data Active
          </Badge>
        </div>

        {/* Current Alerts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Current High-Risk Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockAlerts.map((alert, index) => (
              <DisasterCard 
                key={index} 
                {...alert}
                onClick={() => handleCardClick(alert.location)}
              />
            ))}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">India Risk Map</h2>
          <InteractiveMap 
            selectedDisaster={selectedDisaster}
            onDisasterFilter={handleDisasterFilter}
          />
        </div>

        {/* Prediction Table */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">7-Day Forecast</h2>
            <Badge variant="outline" data-testid="text-selected-location">
              {selectedLocation}
            </Badge>
          </div>
          <PredictionTable location={selectedLocation} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-alerts">147</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Risk Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500" data-testid="text-high-risk-areas">12</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Population at Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-population-risk">4.7M</div>
              <p className="text-xs text-muted-foreground">Across all regions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}