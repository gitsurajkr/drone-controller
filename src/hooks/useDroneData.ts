// src/hooks/useDroneData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { TelemetryData, DroneStatus, HealthData, TelemetryHistory } from '../types';

const BACKEND_URL = 'http://localhost:3000';

export const useDroneData = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({});
  const [health, setHealth] = useState<HealthData>({});
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistory>({ entries: [], total: 0 });
  const [status, setStatus] = useState<DroneStatus>({
    connected: false,
    armed: false,
    mode: 'UNKNOWN',
    battery: 0,
    gps_fix: false,
    satellites: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'disconnecting'>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  
  // Use refs to track polling intervals
  const telemetryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/telemetry`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTelemetry(data);
        setLastUpdate(Date.now());
        setLastError(null);
        
        // Update status based on telemetry data
        setStatus({
          connected: data.connection_status === 'CONNECTED' || 
                    data.connection_status === 'MOCK_DATA' || 
                    data.connection_status === 'LOCK_TIMEOUT',
          armed: data.state?.armed || false,
          mode: data.state?.mode || 'UNKNOWN',
          battery: data.battery?.level || 0,
          gps_fix: (data.navigation?.fix_type || 0) >= 3,
          satellites: data.navigation?.satellites_visible || 0
        });
        setIsConnected(true);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch telemetry:', error);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
      setIsConnected(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      } else {
        console.warn('Health check failed:', response.status);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }, []);

  const fetchTelemetryHistory = useCallback(async (limit: number = 50) => {
    try {
      const response = await fetch(`${BACKEND_URL}/telemetry/history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTelemetryHistory(data);
      } else {
        console.warn('Failed to fetch telemetry history:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch telemetry history:', error);
    }
  }, []);

  const connectDrone = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      const response = await fetch(`${BACKEND_URL}/drone/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Connect response:', data);
        if (data.success) {
          setConnectionStatus('connected');
          setIsConnected(true);
          return true;
        } else {
          setConnectionStatus('disconnected');
          setIsConnected(false);
          return false;
        }
      } else {
        setConnectionStatus('disconnected');
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Failed to connect drone:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
      return false;
    }
  }, []);

  const disconnectDrone = useCallback(async () => {
    try {
      setConnectionStatus('disconnecting');
      const response = await fetch(`${BACKEND_URL}/drone/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Disconnect response:', data);
        setConnectionStatus('disconnected');
        setIsConnected(false);
        return true;
      } else {
        setConnectionStatus('disconnected');
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Failed to disconnect drone:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
      return false;
    }
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/drone/status`);
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        setConnectionStatus(data.connected ? 'connected' : 'disconnected');
        return data;
      }
    } catch (error) {
      console.error('Connection status check failed:', error);
    }
    return null;
  }, []);

  // Start polling
  const startPolling = useCallback(() => {
    // Clear existing intervals
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
    }
    if (healthIntervalRef.current) {
      clearInterval(healthIntervalRef.current);
    }

    // Initial fetch
    fetchTelemetry();
    fetchHealth();
    fetchTelemetryHistory();
    
    // Set up polling intervals
    telemetryIntervalRef.current = setInterval(fetchTelemetry, 1000); // Every 1 second
    healthIntervalRef.current = setInterval(fetchHealth, 5000); // Every 5 seconds
  }, [fetchTelemetry, fetchHealth, fetchTelemetryHistory]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (telemetryIntervalRef.current) {
      clearInterval(telemetryIntervalRef.current);
      telemetryIntervalRef.current = null;
    }
    if (healthIntervalRef.current) {
      clearInterval(healthIntervalRef.current);
      healthIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startPolling();
    
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  // Additional helper functions for UI
  const getConnectionStatus = useCallback(() => {
    if (!isConnected) return 'DISCONNECTED';
    return telemetry.connection_status || 'UNKNOWN';
  }, [isConnected, telemetry.connection_status]);

  const getBatteryStatus = useCallback(() => {
    const level = telemetry.battery?.level || 0;
    if (level > 60) return 'GOOD';
    if (level > 30) return 'LOW';
    if (level > 10) return 'CRITICAL';
    return 'EMERGENCY';
  }, [telemetry.battery?.level]);

  const getGPSStatus = useCallback(() => {
    const fixType = telemetry.navigation?.fix_type || 0;
    const satellites = telemetry.navigation?.satellites_visible || 0;
    
    if (fixType >= 3 && satellites >= 6) return 'EXCELLENT';
    if (fixType >= 3 && satellites >= 4) return 'GOOD';
    if (fixType >= 2) return 'POOR';
    return 'NO_FIX';
  }, [telemetry.navigation?.fix_type, telemetry.navigation?.satellites_visible]);

  const getSystemHealth = useCallback(() => {
    if (!health.drone?.connected) return 'DISCONNECTED';
    if (!telemetry.navigation?.ekf_ok) return 'EKF_ERROR';
    if ((telemetry.battery?.level || 0) < 20) return 'LOW_BATTERY';
    if ((telemetry.navigation?.satellites_visible || 0) < 4) return 'GPS_POOR';
    return 'HEALTHY';
  }, [health.drone?.connected, telemetry.navigation?.ekf_ok, telemetry.battery?.level, telemetry.navigation?.satellites_visible]);

  const sendCommand = useCallback(async (command: string, params: any = {}): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/drone/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, params }),
      });

      if (!response.ok) {
        throw new Error(`Command failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Send command error:', error);
      setLastError(error instanceof Error ? error.message : 'Failed to send command');
      return false;
    }
  }, []);

  return {
    // Core data
    telemetry,
    health,
    telemetryHistory,
    status,
    
    // Connection info
    isConnected,
    connectionStatus,
    lastError,
    lastUpdate,
    
    // Actions
    connectDrone,
    disconnectDrone,
    checkConnectionStatus,
    sendCommand,
    refreshData: fetchTelemetry,
    refreshHealth: fetchHealth,
    refreshHistory: fetchTelemetryHistory,
    startPolling,
    stopPolling,
    
    // Helper functions
    getConnectionStatus,
    getBatteryStatus,
    getGPSStatus,
    getSystemHealth,
  };
};