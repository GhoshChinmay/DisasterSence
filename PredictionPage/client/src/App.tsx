import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";

// Import pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

// Import components
import AppHeader from "@/components/AppHeader";

function Router() {
  const [location, navigate] = useLocation();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'analytics' | 'about'>('landing');

  const handleNavigation = (view: 'dashboard' | 'analytics' | 'about') => {
    console.log(`Navigating to ${view}`);
    setCurrentView(view);
    navigate(`/${view}`);
  };

  const handleViewPredictions = () => {
    console.log('View Predictions - navigating to dashboard');
    setCurrentView('dashboard');
    navigate('/dashboard');
  };

  const handleLearnMore = () => {
    console.log('Learn More - navigating to about');
    setCurrentView('about');
    navigate('/about');
  };

  // Show header only for non-landing pages
  const showHeader = location !== '/';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showHeader && (
        <AppHeader 
          onViewChange={handleNavigation}
          currentView={location.replace('/', '') || 'dashboard'}
        />
      )}
      
      <Switch>
        <Route path="/">
          <Landing 
            onViewPredictions={handleViewPredictions}
            onLearnMore={handleLearnMore}
          />
        </Route>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route path="/analytics">
          <Analytics />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
