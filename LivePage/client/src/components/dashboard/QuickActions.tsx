import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Megaphone, BarChart3, Download, Zap } from 'lucide-react';

interface QuickActionsProps {
  onReportDisaster: () => void;
  onSendAlert: () => void;
  onViewAnalytics: () => void;
  onExportData: () => void;
}

export function QuickActions({ 
  onReportDisaster, 
  onSendAlert, 
  onViewAnalytics, 
  onExportData 
}: QuickActionsProps) {
  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-primary h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={onReportDisaster}
              className="flex flex-col items-center p-4 h-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-report-disaster"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Report Disaster</span>
            </Button>
            
            <Button
              onClick={onSendAlert}
              className="flex flex-col items-center p-4 h-auto gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-send-alert"
            >
              <Megaphone className="h-6 w-6" />
              <span className="text-sm font-medium">Send Alert</span>
            </Button>
            
            <Button
              onClick={onViewAnalytics}
              variant="secondary"
              className="flex flex-col items-center p-4 h-auto gap-2"
              data-testid="button-view-analytics"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Analytics</span>
            </Button>
            
            <Button
              onClick={onExportData}
              variant="secondary"
              className="flex flex-col items-center p-4 h-auto gap-2"
              data-testid="button-export-data"
            >
              <Download className="h-6 w-6" />
              <span className="text-sm font-medium">Export Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
