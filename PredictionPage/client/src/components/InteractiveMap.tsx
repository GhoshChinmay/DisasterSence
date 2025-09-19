import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DisasterIcon from './DisasterIcon';
import RiskBadge, { RiskLevel } from './RiskBadge';

// Mock map data since we can't use actual Leaflet in this prototype
interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  state: string;
  city: string;
  risks: {
    cyclone: RiskLevel;
    flood: RiskLevel;
    earthquake: RiskLevel;
    landslide: RiskLevel;
  };
}

interface InteractiveMapProps {
  selectedDisaster?: 'cyclone' | 'flood' | 'earthquake' | 'landslide' | 'all';
  onDisasterFilter?: (disaster: string) => void;
}

export default function InteractiveMap({ selectedDisaster = 'all', onDisasterFilter }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Mock data for Indian states //todo: replace with real data
  const mockMarkers: MapMarker[] = [
    {
      id: '1',
      lat: 20.9517,
      lng: 85.0985,
      state: 'Odisha',
      city: 'Bhubaneswar',
      risks: { cyclone: 'High', flood: 'Medium', earthquake: 'Low', landslide: 'Low' }
    },
    {
      id: '2', 
      lat: 25.5941,
      lng: 85.1376,
      state: 'Bihar',
      city: 'Patna',
      risks: { cyclone: 'Low', flood: 'High', earthquake: 'Medium', landslide: 'Low' }
    },
    {
      id: '3',
      lat: 13.0827,
      lng: 80.2707,
      state: 'Tamil Nadu',
      city: 'Chennai',
      risks: { cyclone: 'Medium', flood: 'Medium', earthquake: 'Low', landslide: 'Low' }
    },
    {
      id: '4',
      lat: 28.7041,
      lng: 77.1025,
      state: 'Delhi',
      city: 'New Delhi',
      risks: { cyclone: 'Low', flood: 'Medium', earthquake: 'High', landslide: 'Low' }
    }
  ];

  const handleMarkerClick = (marker: MapMarker) => {
    console.log(`Map marker clicked: ${marker.city}, ${marker.state}`);
    setSelectedMarker(marker);
  };

  const handleFilterClick = (disaster: string) => {
    console.log(`Disaster filter clicked: ${disaster}`);
    onDisasterFilter?.(disaster);
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedDisaster === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterClick('all')}
          data-testid="button-filter-all"
        >
          All Disasters
        </Button>
        {(['cyclone', 'flood', 'earthquake', 'landslide'] as const).map((disaster) => (
          <Button
            key={disaster}
            variant={selectedDisaster === disaster ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterClick(disaster)}
            className="flex items-center gap-1"
            data-testid={`button-filter-${disaster}`}
          >
            <DisasterIcon type={disaster} size="sm" />
            <span className="capitalize">{disaster}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>India Risk Map</span>
                <span className="text-sm text-muted-foreground">Interactive View</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef}
                className="w-full h-96 bg-muted rounded-lg relative overflow-hidden border border-border"
                data-testid="map-container"
              >
                {/* Mock India Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 opacity-50">
                  <div className="absolute top-4 left-4 text-xs text-muted-foreground">
                    📍 India - Disaster Risk Assessment
                  </div>
                </div>

                {/* Mock Map Markers */}
                {mockMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    className="absolute w-6 h-6 transform -translate-x-3 -translate-y-3 hover-elevate cursor-pointer"
                    style={{
                      left: `${((marker.lng - 68) / (98 - 68)) * 100}%`,
                      top: `${((37 - marker.lat) / (37 - 6)) * 100}%`
                    }}
                    onClick={() => handleMarkerClick(marker)}
                    data-testid={`map-marker-${marker.id}`}
                  >
                    <div className="w-full h-full bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Details Panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedMarker ? (
                <>
                  <div>
                    <h3 className="font-semibold text-lg" data-testid="text-selected-location">
                      {selectedMarker.city}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedMarker.state}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Current Risk Levels</h4>
                    {Object.entries(selectedMarker.risks).map(([disaster, risk]) => (
                      <div key={disaster} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DisasterIcon 
                            type={disaster as 'cyclone' | 'flood' | 'earthquake' | 'landslide'} 
                            size="sm" 
                          />
                          <span className="text-sm capitalize">{disaster}</span>
                        </div>
                        <RiskBadge level={risk} />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Click on a map marker to view location details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}