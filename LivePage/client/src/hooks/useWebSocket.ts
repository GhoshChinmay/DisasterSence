import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '@/types/disaster';

export function useWebSocket() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'dashboard_update') {
          setData(message.data);
          setLastUpdated(new Date(message.timestamp));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return socket;
  }, []);

  useEffect(() => {
    const socket = connect();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  return { data, isConnected, lastUpdated };
}
