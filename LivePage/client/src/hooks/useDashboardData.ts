import { useQuery } from '@tanstack/react-query';
import { DashboardData } from '@/types/disaster';

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
    refetchInterval: 60000, // Refetch every minute as fallback
  });
}

export function useDisasters(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `/api/disasters${queryParams ? `?${queryParams}` : ''}`;
  
  return useQuery({
    queryKey: ['/api/disasters', filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch disasters');
      return response.json();
    },
  });
}

export function useSocialReports(filters?: Record<string, string>) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `/api/social-reports${queryParams ? `?${queryParams}` : ''}`;
  
  return useQuery({
    queryKey: ['/api/social-reports', filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch social reports');
      return response.json();
    },
  });
}

export function useApiStatuses() {
  return useQuery({
    queryKey: ['/api/status'],
  });
}

export function useAlertSummary() {
  return useQuery({
    queryKey: ['/api/summary'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
