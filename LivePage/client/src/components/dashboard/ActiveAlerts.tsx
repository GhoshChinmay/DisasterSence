import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, MapPin, Clock, Users } from 'lucide-react';
import { DashboardData } from '@/types/disaster';

interface ActiveAlertsProps {
  disasters: DashboardData['disasters'];
}

export function ActiveAlerts({ disasters }: ActiveAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getDisasterIcon = (type: string) => {
    switch (type) {
      case 'flood':
        return '💧';
      case 'earthquake':
        return '🏠';
      case 'fire':
        return '🔥';
      case 'cyclone':
        return '🌀';
      case 'landslide':
        return '🏔️';
      default:
        return '⚠️';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="text-destructive h-5 w-5" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {disasters.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="no-alerts-message">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No active disaster alerts at the moment</p>
            </div>
          ) : (
            disasters.map((disaster) => (
              <div 
                key={disaster.id} 
                className="p-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
                data-testid={`alert-item-${disaster.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${getSeverityColor(disaster.severity)} text-xs px-2 py-1`}>
                        {disaster.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{disaster.source}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getDisasterIcon(disaster.type)}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground text-sm" data-testid={`alert-title-${disaster.id}`}>
                          {disaster.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {disaster.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {disaster.state}{disaster.district ? `, ${disaster.district}` : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(disaster.reportedAt), { addSuffix: true })}
                          </span>
                          {disaster.affectedPopulation && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {disaster.affectedPopulation.toLocaleString()}+ affected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-testid={`button-view-details-${disaster.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
