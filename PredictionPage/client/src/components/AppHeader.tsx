import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface AppHeaderProps {
  onViewChange?: (view: 'dashboard' | 'analytics' | 'about') => void;
  currentView?: string;
}

export default function AppHeader({ onViewChange, currentView = 'dashboard' }: AppHeaderProps) {
  const [selectedView, setSelectedView] = useState(currentView);

  const handleViewChange = (view: 'dashboard' | 'analytics' | 'about') => {
    console.log(`Navigation to ${view} clicked`);
    setSelectedView(view);
    onViewChange?.(view);
  };

  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">🇮🇳</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground" data-testid="text-app-title">
              Disaster Prediction India
            </h1>
            <p className="text-xs text-muted-foreground">AI-powered Risk Forecasting</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant={selectedView === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('dashboard')}
            data-testid="button-nav-dashboard"
          >
            Dashboard
          </Button>
          <Button
            variant={selectedView === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('analytics')}
            data-testid="button-nav-analytics"
          >
            Analytics
          </Button>
          <Button
            variant={selectedView === 'about' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('about')}
            data-testid="button-nav-about"
          >
            About
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Live Data
          </Badge>
        </div>
      </div>
    </header>
  );
}