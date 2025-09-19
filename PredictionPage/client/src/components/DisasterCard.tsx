import { Card, CardContent, CardHeader } from '@/components/ui/card';
import DisasterIcon from './DisasterIcon';
import RiskBadge, { RiskLevel } from './RiskBadge';

interface DisasterCardProps {
  type: 'cyclone' | 'flood' | 'earthquake' | 'landslide';
  currentRisk: RiskLevel;
  location: string;
  probability: number;
  nextDayRisk: RiskLevel;
  affectedPopulation?: number;
  lastUpdated: string;
  onClick?: () => void;
}

export default function DisasterCard({
  type,
  currentRisk,
  location,
  probability,
  nextDayRisk,
  affectedPopulation,
  lastUpdated,
  onClick
}: DisasterCardProps) {
  const handleClick = () => {
    console.log(`${type} card clicked for ${location}`);
    onClick?.();
  };

  const formatPopulation = (pop?: number) => {
    if (!pop) return 'N/A';
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
    return pop.toString();
  };

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all duration-200 border-card-border"
      onClick={handleClick}
      data-testid={`card-disaster-${type}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DisasterIcon type={type} size="md" />
            <h3 className="font-semibold text-sm capitalize">{type}</h3>
          </div>
          <RiskBadge level={currentRisk} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Location</p>
          <p className="font-medium text-sm" data-testid="text-location">{location}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-muted-foreground">Probability</p>
            <p className="font-semibold text-lg" data-testid="text-probability">{probability}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tomorrow</p>
            <RiskBadge level={nextDayRisk} className="text-xs" />
          </div>
        </div>
        
        {affectedPopulation && (
          <div>
            <p className="text-xs text-muted-foreground">Est. Affected Population</p>
            <p className="font-medium text-sm" data-testid="text-population">
              {formatPopulation(affectedPopulation)}
            </p>
          </div>
        )}
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Updated: {lastUpdated}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}