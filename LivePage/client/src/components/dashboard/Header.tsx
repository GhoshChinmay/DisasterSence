import { formatDistanceToNow } from 'date-fns';
import { Shield, Bell, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({ isConnected, lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Disaster Watch India</h1>
              <p className="text-sm text-muted-foreground">Real-time Emergency Monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`}></div>
                <span data-testid="connection-status">{isConnected ? 'Live' : 'Offline'}</span>
              </div>
              <span data-testid="last-updated">
                {lastUpdated ? `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}` : 'Never updated'}
              </span>
            </div>
            
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="default"
              size="sm"
              className="flex items-center space-x-2"
              data-testid="button-refresh"
            >
              <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            
            <Button variant="ghost" size="sm" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
