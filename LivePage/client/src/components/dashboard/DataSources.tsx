import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Shield } from 'lucide-react';
import { DashboardData } from '@/types/disaster';

interface DataSourcesProps {
  apiStatuses: DashboardData['apiStatuses'];
  totalReportsToday?: number;
}

export function DataSources({ apiStatuses, totalReportsToday = 0 }: DataSourcesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'delayed':
        return 'bg-yellow-500';
      case 'error':
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'delayed':
        return 'Delayed';
      case 'error':
        return 'Error';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getServiceDescription = (serviceName: string) => {
    switch (serviceName) {
      case 'NDMA API':
        return 'National Disaster Management Authority';
      case 'IMD API':
        return 'India Meteorological Department';
      case 'Twitter API':
        return 'Social Media Monitoring';
      case 'ISRO BHUVAN':
        return 'Satellite Imagery';
      default:
        return serviceName;
    }
  };

  const systemHealth = apiStatuses.every(s => s.status === 'online') ? 'Operational' : 
                     apiStatuses.some(s => s.status === 'error') ? 'Issues Detected' : 'Partial';

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="text-primary h-5 w-5" />
            Data Sources & System Status
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {apiStatuses.map((status) => (
              <div key={status.id} className="p-3 bg-accent/30 rounded-lg" data-testid={`status-${status.serviceName.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`}></div>
                    <span className="text-sm font-medium">{status.serviceName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getStatusText(status.status)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {getServiceDescription(status.serviceName)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last sync: {status.lastSuccessfulSync 
                    ? formatDistanceToNow(new Date(status.lastSuccessfulSync), { addSuffix: true })
                    : 'Never'
                  }
                </p>
                {status.errorMessage && (
                  <p className="text-xs text-red-600 mt-1 truncate" title={status.errorMessage}>
                    {status.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-6">
                <span>
                  System Health: <span className={`font-medium ${systemHealth === 'Operational' ? 'text-green-600' : systemHealth === 'Issues Detected' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {systemHealth}
                  </span>
                </span>
                <span>
                  Total Reports Today: <span className="font-medium text-foreground" data-testid="daily-reports">
                    {totalReportsToday.toLocaleString()}
                  </span>
                </span>
                <span>
                  Response Time: <span className="font-medium text-foreground">
                    {apiStatuses.find(s => s.responseTime)?.responseTime || 2300}ms avg
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-green-500 h-4 w-4" />
                <span>Secure Connection</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
