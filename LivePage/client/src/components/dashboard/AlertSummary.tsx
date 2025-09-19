import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface AlertSummaryProps {
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

export function AlertSummary({ summary }: AlertSummaryProps) {
  const summaryItems = [
    { 
      label: 'Critical', 
      value: summary.critical, 
      color: 'text-red-600', 
      bgColor: 'bg-red-600',
      pulse: summary.critical > 0 
    },
    { 
      label: 'High', 
      value: summary.high, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-600',
      pulse: false 
    },
    { 
      label: 'Medium', 
      value: summary.medium, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-600',
      pulse: false 
    },
    { 
      label: 'Low', 
      value: summary.low, 
      color: 'text-green-600', 
      bgColor: 'bg-green-600',
      pulse: false 
    },
    { 
      label: 'Total Active', 
      value: summary.total, 
      color: 'text-primary', 
      bgColor: 'bg-primary',
      pulse: false,
      icon: AlertTriangle 
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryItems.map((item, index) => (
          <Card key={item.label} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${item.color}`} data-testid={`alert-count-${item.label.toLowerCase().replace(' ', '-')}`}>
                    {item.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
                {item.icon ? (
                  <item.icon className="text-primary h-5 w-5" />
                ) : (
                  <div className={`w-3 h-3 ${item.bgColor} rounded-full ${item.pulse ? 'animate-pulse' : ''}`}></div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
