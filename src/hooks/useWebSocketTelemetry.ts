// src/hooks/useWebSocketTelemetry.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
}

interface TelemetryData {
  position?: GPSCoordinates;
  navigation?: {
    heading: number;
    groundspeed: number;
    satellites_visible: number;
  };
  battery?: {
    level: number;
    voltage: number;
  };
  state?: {
    mode: string;
    armed: boolean;
  };
}

interface UseWebSocketTelemetryOptions {
  url: string;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export const useWebSocketTelemetry = ({
  url,
  reconnectInterval = 3000,
  onConnect,
  onDisconnect,
  onError
}: UseWebSocketTelemetryOptions) => {
  const [telemetryData, setTelemetryData] = useState<TelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      console.log('Connecting to WebSocket:', url);
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: TelemetryData = JSON.parse(event.data);
          setTelemetryData(data);
          
          // Update position if GPS data is available
          if (data.position?.latitude && data.position?.longitude) {
            setCurrentPosition({
              lat: data.position.latitude,
              lng: data.position.longitude
            });
          }
        } catch (error) {
          console.error('Error parsing telemetry data:', error);
          onError?.('Failed to parse telemetry data');
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();
        
        // Attempt to reconnect
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, reconnectInterval);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        const errorMessage = 'Failed to connect to telemetry server';
        setConnectionError(errorMessage);
        setIsConnected(false);
        onError?.(errorMessage);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      const errorMessage = 'Invalid WebSocket URL';
      setConnectionError(errorMessage);
      onError?.(errorMessage);
    }
  }, [url, reconnectInterval, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnect();
    };
  }, [connectWebSocket, disconnect]);

  return {
    telemetryData,
    currentPosition,
    isConnected,
    connectionError,
    sendMessage,
    disconnect,
    reconnect: connectWebSocket
  };
};