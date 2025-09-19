import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import RiskBadge, { RiskLevel } from './RiskBadge';
import DisasterIcon from './DisasterIcon';

interface DayPrediction {
  date: string;
  day: string;
  cyclone: RiskLevel;
  flood: RiskLevel;  
  earthquake: RiskLevel;
  landslide: RiskLevel;
}

interface PredictionTableProps {
  location?: string;
  predictions?: DayPrediction[];
}

export default function PredictionTable({ 
  location = 'India Overview', 
  predictions 
}: PredictionTableProps) {
  
  // Mock 7-day prediction data //todo: replace with real API data
  const mockPredictions: DayPrediction[] = predictions || [
    {
      date: '2024-01-20',
      day: 'Today',
      cyclone: 'Medium',
      flood: 'High',
      earthquake: 'Low',
      landslide: 'Low'
    },
    {
      date: '2024-01-21',
      day: 'Tomorrow',
      cyclone: 'High',
      flood: 'High',
      earthquake: 'Low',
      landslide: 'Medium'
    },
    {
      date: '2024-01-22',
      day: 'Day 3',
      cyclone: 'High',
      flood: 'Medium',
      earthquake: 'Low',
      landslide: 'Medium'
    },
    {
      date: '2024-01-23',
      day: 'Day 4',
      cyclone: 'Medium',
      flood: 'Medium',
      earthquake: 'Medium',
      landslide: 'Low'
    },
    {
      date: '2024-01-24',
      day: 'Day 5',
      cyclone: 'Low',
      flood: 'Medium',
      earthquake: 'Medium',
      landslide: 'Low'
    },
    {
      date: '2024-01-25',
      day: 'Day 6',
      cyclone: 'Low',
      flood: 'Low',
      earthquake: 'Low',
      landslide: 'Low'
    },
    {
      date: '2024-01-26',
      day: 'Day 7',
      cyclone: 'Low',
      flood: 'Low',
      earthquake: 'Low',
      landslide: 'Low'
    }
  ];

  const handleRowClick = (prediction: DayPrediction) => {
    console.log(`Prediction row clicked for ${prediction.day}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>7-Day Disaster Forecast</span>
          <span className="text-sm font-normal text-muted-foreground" data-testid="text-forecast-location">
            {location}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Date</TableHead>
                <TableHead className="w-20">Day</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DisasterIcon type="cyclone" size="sm" />
                    <span className="hidden sm:inline">Cyclone</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DisasterIcon type="flood" size="sm" />
                    <span className="hidden sm:inline">Flood</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DisasterIcon type="earthquake" size="sm" />
                    <span className="hidden sm:inline">Earthquake</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DisasterIcon type="landslide" size="sm" />
                    <span className="hidden sm:inline">Landslide</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPredictions.map((prediction, index) => (
                <TableRow 
                  key={prediction.date}
                  className="hover-elevate cursor-pointer"
                  onClick={() => handleRowClick(prediction)}
                  data-testid={`row-prediction-${index}`}
                >
                  <TableCell className="font-medium text-xs">
                    {new Date(prediction.date).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {prediction.day}
                  </TableCell>
                  <TableCell className="text-center">
                    <RiskBadge level={prediction.cyclone} />
                  </TableCell>
                  <TableCell className="text-center">
                    <RiskBadge level={prediction.flood} />
                  </TableCell>
                  <TableCell className="text-center">
                    <RiskBadge level={prediction.earthquake} />
                  </TableCell>
                  <TableCell className="text-center">
                    <RiskBadge level={prediction.landslide} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Last updated: {new Date().toLocaleString('en-IN')}
        </div>
      </CardContent>
    </Card>
  );
}