import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Flag, MapPin, Repeat, Heart } from 'lucide-react';
import { FaTwitter } from 'react-icons/fa';
import { DashboardData } from '@/types/disaster';

interface SocialMediaFeedProps {
  reports: DashboardData['socialReports'];
  onVerifyReport: (id: string, status: string) => void;
}

export function SocialMediaFeed({ reports, onVerifyReport }: SocialMediaFeedProps) {
  const getVerificationBadge = (status?: string, isVerified?: boolean) => {
    if (isVerified) {
      return <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Unverified</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800 text-xs">Flagged</Badge>;
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Dismissed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Unverified</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaTwitter className="text-blue-500 h-5 w-5" />
          Social Media Reports
        </CardTitle>
        <p className="text-sm text-muted-foreground">Crowdsourced disaster reports</p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="no-reports-message">
              <FaTwitter className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No social media reports available</p>
            </div>
          ) : (
            reports.map((report) => (
              <div 
                key={report.id} 
                className="p-4 border-b border-border last:border-b-0"
                data-testid={`social-report-${report.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaTwitter className="text-white text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium" data-testid={`report-author-${report.id}`}>
                        @{report.authorUsername}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.reportedAt), { addSuffix: true })}
                      </span>
                      {getVerificationBadge(report.verificationStatus, report.isVerified)}
                    </div>
                    <p className="text-sm text-foreground mb-2 break-words" data-testid={`report-content-${report.id}`}>
                      {report.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {report.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.location}
                        </span>
                      )}
                      {report.engagementMetrics && (
                        <>
                          <span className="flex items-center gap-1">
                            <Repeat className="h-3 w-3" />
                            {report.engagementMetrics.retweets || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {report.engagementMetrics.likes || 0}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {!report.isVerified && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50 h-8 w-8 p-0"
                        onClick={() => onVerifyReport(report.id, 'verified')}
                        data-testid={`button-verify-${report.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => onVerifyReport(report.id, 'flagged')}
                        data-testid={`button-flag-${report.id}`}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
