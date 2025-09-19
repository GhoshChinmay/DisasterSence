export interface DisasterMarker {
  id: string;
  title: string;
  type: string;
  severity: string;
  latitude: number;
  longitude: number;
  state: string;
  district?: string;
  reportedAt: string;
}

export interface DashboardData {
  disasters: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    severity: string;
    state: string;
    district?: string;
    latitude?: string;
    longitude?: string;
    source: string;
    sourceUrl?: string;
    affectedPopulation?: number;
    isVerified: boolean;
    metadata?: any;
    reportedAt: string;
    lastUpdated: string;
    isActive: boolean;
  }>;
  socialReports: Array<{
    id: string;
    platform: string;
    authorUsername: string;
    content: string;
    location?: string;
    engagementMetrics?: any;
    isVerified: boolean;
    verificationStatus?: string;
    reportedAt: string;
  }>;
  apiStatuses: Array<{
    id: string;
    serviceName: string;
    status: string;
    lastSuccessfulSync?: string;
    responseTime?: number;
    errorMessage?: string;
    updatedAt: string;
  }>;
  alertSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  lastUpdated: string;
}

export interface FilterState {
  searchQuery: string;
  severityFilter: string;
  typeFilter: string;
  stateFilter: string;
}
