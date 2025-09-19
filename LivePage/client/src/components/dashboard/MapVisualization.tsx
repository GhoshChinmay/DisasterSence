import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Plus, Minus, Maximize } from 'lucide-react';
import { DisasterMarker } from '@/types/disaster';

interface MapVisualizationProps {
  disasters: DisasterMarker[];
}

export function MapVisualization({ disasters }: MapVisualizationProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet map
    const initializeMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = await import('leaflet');
      
      // Fix marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([20.5937, 78.9629], 5); // Center on India

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      setMapInstance(map);
    };

    initializeMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    mapInstance.eachLayer((layer: any) => {
      if (layer.options && layer.options.isMarker) {
        mapInstance.removeLayer(layer);
      }
    });

    const L = (window as any).L;
    if (!L) return;

    // Add disaster markers
    disasters.forEach((disaster) => {
      if (!disaster.latitude || !disaster.longitude) return;

      const lat = parseFloat(disaster.latitude.toString());
      const lng = parseFloat(disaster.longitude.toString());

      let markerColor = '#3B82F6'; // Default blue
      let iconClass = 'fa-exclamation-triangle';

      // Set color based on severity
      switch (disaster.severity) {
        case 'critical':
          markerColor = '#DC2626';
          break;
        case 'high':
          markerColor = '#EA580C';
          break;
        case 'medium':
          markerColor = '#CA8A04';
          break;
        case 'low':
          markerColor = '#16A34A';
          break;
      }

      // Set icon based on type
      switch (disaster.type) {
        case 'flood':
          iconClass = 'fa-water';
          break;
        case 'earthquake':
          iconClass = 'fa-house-crack';
          break;
        case 'fire':
          iconClass = 'fa-fire';
          break;
        case 'cyclone':
          iconClass = 'fa-hurricane';
          break;
        case 'landslide':
          iconClass = 'fa-mountain';
          break;
      }

      const customIcon = L.divIcon({
        className: 'custom-disaster-marker',
        html: `
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${disaster.severity === 'critical' ? 'animate-pulse' : ''}" style="background-color: ${markerColor}">
            <i class="fas ${iconClass} text-white text-xs"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([lat, lng], { 
        icon: customIcon,
        isMarker: true
      }).addTo(mapInstance);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${disaster.title}</h3>
          <p class="text-xs text-gray-600 mt-1">${disaster.state}${disaster.district ? `, ${disaster.district}` : ''}</p>
          <span class="inline-block mt-1 px-2 py-0.5 text-xs rounded-full" style="background-color: ${markerColor}; color: white;">
            ${disaster.severity.toUpperCase()}
          </span>
        </div>
      `);
    });
  }, [mapInstance, disasters]);

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  const handleFullscreen = () => {
    if (mapRef.current) {
      if (mapRef.current.requestFullscreen) {
        mapRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="text-primary h-5 w-5" />
          Disaster Map - India
        </CardTitle>
        <p className="text-sm text-muted-foreground">Real-time visualization of active disasters</p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative h-96">
          {/* Leaflet CSS */}
          <link 
            rel="stylesheet" 
            href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
            integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
            crossOrigin=""
          />
          <script 
            src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
            integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
            crossOrigin=""
          />
          
          <div ref={mapRef} className="w-full h-full" data-testid="disaster-map" />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-card"
              onClick={handleZoomIn}
              data-testid="button-zoom-in"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-card"
              onClick={handleZoomOut}
              data-testid="button-zoom-out"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-card"
              onClick={handleFullscreen}
              data-testid="button-fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 z-[1000]">
            <h4 className="text-sm font-medium mb-2">Severity Levels</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
