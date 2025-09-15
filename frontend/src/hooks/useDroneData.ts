// src/hooks/useDroneData.ts
import { useState, useEffect, useCallback } from 'react';
import type { TelemetryData, DroneStatus } from '../types';

const BACKEND_URL = 'http://localhost:3000';

export const useDroneData = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({});
  const [status, setStatus] = useState<DroneStatus>({
    connected: false,
    armed: false,
    mode: 'UNKNOWN',
    battery: 0,
    gps_fix: false,
    satellites: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/telemetry`);
      if (response.ok) {
        const data = await response.json();
        setTelemetry(data);
        
        // Update status based on the new telemetry structure
        setStatus({
          connected: data.connection_status === 'CONNECTED' || 
                    data.connection_status === 'MOCK_DATA' || 
                    data.connection_status === 'LOCK_TIMEOUT',
          armed: data.state?.armed || false,
          mode: data.state?.mode || 'UNKNOWN',
          battery: data.battery?.level || 0,
          gps_fix: data.navigation?.fix_type >= 3,
          satellites: data.navigation?.satellites_visible || 0
        });
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to fetch telemetry:', error);
      setIsConnected(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('Backend health:', data);
        return data;
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
    return null;
  }, []);

  const sendCommand = useCallback(async (command: string, params?: any) => {
    // Since this is now a monitoring-only app, we remove command functionality
    console.warn('Command sending disabled in monitoring mode:', command, params);
    return false;
  }, []);

  useEffect(() => {
    // Initial health check
    checkHealth();
    
    // Start fetching telemetry
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [fetchTelemetry, checkHealth]);

  return {
    telemetry,
    status,
    isConnected,
    sendCommand,
    refreshData: fetchTelemetry,
    checkHealth
  };
};