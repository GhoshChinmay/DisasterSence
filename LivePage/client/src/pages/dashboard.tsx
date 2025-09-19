import { useState, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Header } from '@/components/dashboard/Header';
import { AlertSummary } from '@/components/dashboard/AlertSummary';
import { FilterControls } from '@/components/dashboard/FilterControls';
import { MapVisualization } from '@/components/dashboard/MapVisualization';
import { ActiveAlerts } from '@/components/dashboard/ActiveAlerts';
import { SocialMediaFeed } from '@/components/dashboard/SocialMediaFeed';
import { DataSources } from '@/components/dashboard/DataSources';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FilterState, DisasterMarker } from '@/types/disaster';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { data: wsData, isConnected, lastUpdated } = useWebSocket();
  const { data: fallbackData, isLoading, refetch } = useDashboardData();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use WebSocket data if available, fallback to REST API data
  const data = wsData || fallbackData;
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    severityFilter: 'all',
    typeFilter: 'all',
    stateFilter: 'all'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const verifyReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/social-reports/${id}/verify`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-reports'] });
      toast({
        title: "Report Updated",
        description: "Social media report verification status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report verification status.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      await apiRequest('POST', '/api/refresh');
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast]);

  const handleVerifyReport = useCallback((id: string, status: string) => {
    verifyReportMutation.mutate({ id, status });
  }, [verifyReportMutation]);

  // Filter data based on current filters
  const filteredDisasters = data?.disasters?.filter(disaster => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!disaster.title.toLowerCase().includes(query) &&
          !disaster.description.toLowerCase().includes(query) &&
          !disaster.state.toLowerCase().includes(query) &&
          !disaster.district?.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    if (filters.severityFilter !== 'all' && disaster.severity !== filters.severityFilter) {
      return false;
    }
    
    if (filters.typeFilter !== 'all' && disaster.type !== filters.typeFilter) {
      return false;
    }
    
    if (filters.stateFilter !== 'all' && disaster.state !== filters.stateFilter) {
      return false;
    }
    
    return true;
  }) || [];

  // Convert disasters to map markers
  const mapMarkers: DisasterMarker[] = filteredDisasters
    .filter(d => d.latitude && d.longitude)
    .map(d => ({
      id: d.id,
      title: d.title,
      type: d.type,
      severity: d.severity,
      latitude: parseFloat(d.latitude!),
      longitude: parseFloat(d.longitude!),
      state: d.state,
      district: d.district,
      reportedAt: d.reportedAt
    }));

  const handleQuickAction = useCallback((action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} functionality will be available in the next update.`,
    });
  }, [toast]);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading disaster data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isConnected={isConnected}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="container mx-auto px-4 py-6">
        {data?.alertSummary && (
          <AlertSummary summary={data.alertSummary} />
        )}

        <FilterControls
          filters={filters}
          onFiltersChange={setFilters}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MapVisualization disasters={mapMarkers} />

          <div className="space-y-6">
            <ActiveAlerts disasters={filteredDisasters} />
            
            <SocialMediaFeed
              reports={data?.socialReports || []}
              onVerifyReport={handleVerifyReport}
            />
          </div>
        </div>

        <DataSources
          apiStatuses={data?.apiStatuses || []}
          totalReportsToday={data?.disasters?.length || 0}
        />

        <QuickActions
          onReportDisaster={() => handleQuickAction("Report Disaster")}
          onSendAlert={() => handleQuickAction("Send Alert")}
          onViewAnalytics={() => handleQuickAction("View Analytics")}
          onExportData={() => handleQuickAction("Export Data")}
        />

        {/* Emergency Contacts Footer */}
        <footer className="bg-card border-t border-border mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Emergency Contacts</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>NDRF: <span className="font-medium">9711077372</span></p>
                  <p>Police: <span className="font-medium">100</span></p>
                  <p>Fire: <span className="font-medium">101</span></p>
                  <p>Medical: <span className="font-medium">108</span></p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Official Sources</h3>
                <div className="space-y-1 text-sm">
                  <a href="https://ndma.gov.in" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    NDMA.gov.in
                  </a>
                  <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    IMD.gov.in
                  </a>
                  <a href="https://bhuvan.nrsc.gov.in" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    ISRO Bhuvan
                  </a>
                  <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
                    Emergency.gov.in
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">System Information</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    API Status: <span className={`font-medium ${(data?.apiStatuses?.every(s => s.status === 'online') ? 'text-green-600' : 'text-yellow-600')}`}>
                      {data?.apiStatuses?.every(s => s.status === 'online') ? 'Operational' : 'Partial'}
                    </span>
                  </p>
                  <p>Data Sources: <span className="font-medium">{data?.apiStatuses?.length || 0} active</span></p>
                  <p>Total Alerts: <span className="font-medium">{data?.alertSummary?.total || 0}</span></p>
                  <p className="text-xs pt-2">© 2024 Disaster Management System India</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
