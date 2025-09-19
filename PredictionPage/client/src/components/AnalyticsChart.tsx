import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RiskLevel } from './RiskBadge';

interface ChartDataPoint {
  day: string;
  date: string;
  cyclone: number;
  flood: number;
  earthquake: number;
  landslide: number;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  wind: {
    speed: number;
  };
  name: string;
  dt: number;
}

interface AnalyticsChartProps {
  title?: string;
  data?: ChartDataPoint[];
  height?: number;
  weatherData?: WeatherData | null;
}

export default function AnalyticsChart({ 
  title = 'Risk Trend Analysis', 
  data,
  height = 300,
  weatherData
}: AnalyticsChartProps) {
  
  // Convert risk levels to numeric values for charting
  const riskToNumber = (risk: RiskLevel): number => {
    const mapping = { 'Low': 1, 'Medium': 2, 'High': 3, 'Extreme': 4 };
    return mapping[risk];
  };

  // Generate chart data based on weather conditions
  const generateChartData = (): ChartDataPoint[] => {
    if (data) return data;
    
    if (!weatherData) {
      // Fallback mock data if no weather data is available
      return [
        { day: 'Today', date: 'Jan 20', cyclone: 2, flood: 3, earthquake: 1, landslide: 1 },
        { day: 'Day 2', date: 'Jan 21', cyclone: 3, flood: 3, earthquake: 1, landslide: 2 },
        { day: 'Day 3', date: 'Jan 22', cyclone: 3, flood: 2, earthquake: 1, landslide: 2 },
        { day: 'Day 4', date: 'Jan 23', cyclone: 2, flood: 2, earthquake: 2, landslide: 1 },
        { day: 'Day 5', date: 'Jan 24', cyclone: 1, flood: 2, earthquake: 2, landslide: 1 },
        { day: 'Day 6', date: 'Jan 25', cyclone: 1, flood: 1, earthquake: 1, landslide: 1 },
        { day: 'Day 7', date: 'Jan 26', cyclone: 1, flood: 1, earthquake: 1, landslide: 1 }
      ];
    }

    // Generate data based on actual weather conditions
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const weatherCondition = weatherData.weather[0].main;
    
    // Base risk levels influenced by weather
    const baseCyclone = windSpeed > 10 ? 3 : windSpeed > 5 ? 2 : 1;
    const baseFlood = humidity > 80 ? 3 : humidity > 60 ? 2 : 1;
    const baseLandslide = weatherCondition === 'Rain' ? 3 : 1;
    
    // Generate 7 days of data with some variation
    const chartData: ChartDataPoint[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Add some realistic variation to the data
      const dayVariation = Math.sin(i * 0.5) * 0.5;
      
      chartData.push({
        day: i === 0 ? 'Today' : `Day ${i + 1}`,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cyclone: Math.max(1, Math.min(4, Math.round(baseCyclone + (i % 3 === 0 ? 0.5 : -0.2) + dayVariation))),
        flood: Math.max(1, Math.min(4, Math.round(baseFlood + (i % 2 === 0 ? 0.3 : -0.1) + dayVariation))),
        earthquake: Math.max(1, Math.min(4, Math.round(1 + (i % 4 === 0 ? 0.5 : 0) + dayVariation * 0.5))),
        landslide: Math.max(1, Math.min(4, Math.round(baseLandslide + (i % 3 === 1 ? 0.4 : 0) + dayVariation)))
      });
    }
    
    return chartData;
  };

  const chartData = generateChartData();

  const formatTooltipValue = (value: number): string => {
    const riskLabels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Extreme' };
    return riskLabels[value as keyof typeof riskLabels] || 'Unknown';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatTooltipValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card data-testid="analytics-chart">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Risk severity trends over the next 7 days
          {weatherData && ` • Based on current conditions in ${weatherData.name}`}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              domain={[0.5, 4.5]}
              ticks={[1, 2, 3, 4]}
              tick={{ fontSize: 12 }}
              tickFormatter={formatTooltipValue}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="cyclone" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="🌀 Cyclone"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="flood" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="🌊 Flood"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="earthquake" 
              stroke="#ffc658" 
              strokeWidth={2}
              name="🗻 Earthquake"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="landslide" 
              stroke="#ff7300" 
              strokeWidth={2}
              name="⛰️ Landslide"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}