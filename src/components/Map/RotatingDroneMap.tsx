// src/components/Map/RotatingDroneMap.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import droneIcon from '../../assets/drone.png';

// WebSocket telemetry interface
interface TelemetryData {
  position?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  navigation?: {
    heading: number;
  };
}

// Initial center coordinates (fallback if no telemetry)
const INITIAL_CENTER: [number, number] = [23.3441, 85.3096];

interface RotatingDroneMapProps {
  className?: string;
}

// Component to handle map centering
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
};

const RotatingDroneMap: React.FC<RotatingDroneMapProps> = ({ className = "" }) => {
  const [telemetryData, setTelemetryData] = useState<TelemetryData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  // Get current position and yaw from telemetry
  const currentPosition: [number, number] = telemetryData?.position 
    ? [telemetryData.position.latitude, telemetryData.position.longitude]
    : INITIAL_CENTER;
  
  const currentYaw = telemetryData?.navigation?.heading || 0;

  // WebSocket connection and telemetry handling
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        setConnectionStatus('connecting');
        wsRef.current = new WebSocket('ws://localhost:4000/telemetry');

        wsRef.current.onopen = () => {
          console.log('Connected to telemetry WebSocket');
          setConnectionStatus('connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setTelemetryData(data);
          } catch (error) {
            console.error('Error parsing telemetry data:', error);
          }
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket connection closed');
          setConnectionStatus('disconnected');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('disconnected');
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnectionStatus('disconnected');
        // Retry connection after 3 seconds
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Create custom drone icon with rotation
  const createDroneIcon = (rotation: number) => {
    return L.divIcon({
      className: 'custom-drone-marker',
      html: `
        <div style="transform: rotate(${rotation}deg); transition: transform 0.3s ease;">
          <img 
            src="${droneIcon}" 
            style="width: 32px; height: 32px; margin-left: -16px; margin-top: -16px;" 
            alt="Drone"
            onerror="this.style.display='none'; this.parentElement.innerHTML='🚁';"
          />
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={currentPosition}
        zoom={15}
        className="w-full h-full"
        zoomControl={true}
      >
        {/* Map Controller for centering */}
        <MapController center={currentPosition} />
        
        {/* Satellite Tile Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
        />
        
        {/* Rotating Drone Marker */}
        <Marker
          position={currentPosition}
          icon={createDroneIcon(currentYaw)}
        />
      </MapContainer>


      {/* Live Telemetry Display */}
      <div className="absolute top-4 right-4 z-[1000] bg-black/80 text-cyan-400 px-3 py-2 rounded-lg font-mono text-sm">
        <div className="text-xs text-cyan-300 mb-1">TELEMETRY</div>
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-cyan-300">LAT:</span> {currentPosition[0].toFixed(6)}
          </div>
          <div className="text-xs">
            <span className="text-cyan-300">LNG:</span> {currentPosition[1].toFixed(6)}
          </div>
          <div className="text-xs">
            <span className="text-cyan-300">YAW:</span> {currentYaw.toFixed(1)}°
          </div>
          {telemetryData?.position?.altitude && (
            <div className="text-xs">
              <span className="text-cyan-300">ALT:</span> {telemetryData.position.altitude.toFixed(1)}m
            </div>
          )}
        </div>
      </div>

      {/* Bottom-Left Simple Compass Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 border border-cyan-400/30 rounded-lg p-2">
        <div className="flex flex-col items-center space-y-1">
          <div className="text-xs text-cyan-300 font-mono">COMPASS</div>
          
          {/* Simple Compass SVG */}
          <div className="relative w-12 h-12">
            {/* Compass Ring */}
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 48 48" 
              className="absolute inset-0"
            >
              {/* Outer Ring */}
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                opacity="0.6"
              />
              
              {/* Cardinal Direction Marks */}
              <g stroke="#06b6d4" strokeWidth="1" opacity="0.8">
                {/* North Mark */}
                <line x1="24" y1="2" x2="24" y2="6" />
                <text x="24" y="12" textAnchor="middle" fontSize="6" fill="#06b6d4" className="font-mono font-bold">N</text>
                
                {/* Other direction marks (smaller) */}
                <line x1="46" y1="24" x2="42" y2="24" opacity="0.5" />
                <line x1="24" y1="46" x2="24" y2="42" opacity="0.5" />
                <line x1="2" y1="24" x2="6" y2="24" opacity="0.5" />
              </g>
            </svg>
            
            {/* Rotating Arrow based on telemetry yaw */}
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${currentYaw}deg)` }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32">
                {/* Simple Arrow Needle */}
                <path
                  d="M16 4 L18 16 L16 15 L14 16 Z"
                  fill="#ef4444"
                  stroke="#dc2626"
                  strokeWidth="0.5"
                />
                <path
                  d="M16 28 L14 16 L16 17 L18 16 Z"
                  fill="#64748b"
                  stroke="#475569"
                  strokeWidth="0.5"
                />
                {/* Center Point */}
                <circle
                  cx="16"
                  cy="16"
                  r="1.5"
                  fill="#06b6d4"
                />
              </svg>
            </div>
          </div>
          
          {/* Real-time Heading Display */}
          <div className="text-xs text-cyan-400 font-mono font-bold">
            {currentYaw.toFixed(1)}°
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatingDroneMap;