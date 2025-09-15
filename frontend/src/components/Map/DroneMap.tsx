// src/components/Map/DroneMap.tsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TelemetryData, Waypoint } from '../../types';

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom drone icon
const droneIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIgMTJIMTJNMTIgMkwxMiAxMk0xMiAxMkwyMiAxMk0xMiAxMkwxMiAyMiIgc3Ryb2tlPSIjMDA3N2ZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

interface DroneMapProps {
  telemetry: TelemetryData;
  waypoints?: Waypoint[];
  flightPath?: LatLng[];
  onMapClick?: (lat: number, lon: number) => void;
}

// Component to update map view when drone moves
const MapUpdater: React.FC<{ position: LatLng | null; follow: boolean }> = ({ position, follow }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position && follow) {
      map.setView(position, map.getZoom());
    }
  }, [map, position, follow]);
  
  return null;
};

export const DroneMap: React.FC<DroneMapProps> = ({ 
  telemetry, 
  waypoints = [], 
  flightPath = [],
  onMapClick 
}) => {
  const [followDrone, setFollowDrone] = React.useState(true);
  const mapRef = useRef<any>(null);
  
  // Default center coordinates (you can change this to your preferred location)
  const defaultCenter: LatLng = new LatLng(37.7749, -122.4194); // San Francisco
  
  const dronePosition = telemetry.position ? 
    new LatLng(telemetry.position.latitude, telemetry.position.longitude) : null;
  
  const center = dronePosition || defaultCenter;

  const handleMapClick = (e: any) => {
    if (onMapClick) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <button
          onClick={() => setFollowDrone(!followDrone)}
          className={`px-3 py-1 text-sm rounded ${
            followDrone 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {followDrone ? 'Following' : 'Free View'}
        </button>
      </div>

      {/* Telemetry Overlay */}
      {telemetry.position && (
        <div className="absolute top-4 left-4 z-[1000] bg-black/75 text-white rounded-lg p-3 text-sm">
          <div>Lat: {telemetry.position.latitude.toFixed(6)}</div>
          <div>Lon: {telemetry.position.longitude.toFixed(6)}</div>
          <div>Alt: {telemetry.position.altitude.toFixed(1)}m</div>
          {telemetry.navigation?.groundspeed !== undefined && (
            <div>Speed: {telemetry.navigation.groundspeed.toFixed(1)} m/s</div>
          )}
          {telemetry.navigation?.heading !== undefined && (
            <div>Heading: {telemetry.navigation.heading.toFixed(0)}°</div>
          )}
        </div>
      )}

      <MapContainer
        ref={mapRef}
        center={center}
        zoom={15}
        className="h-full w-full"
        whenReady={() => {
          if (mapRef.current) {
            mapRef.current.on('click', handleMapClick);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater position={dronePosition} follow={followDrone} />

        {/* Drone Position */}
        {dronePosition && (
          <Marker position={dronePosition} icon={droneIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Drone Position</strong><br />
                Mode: {telemetry.state?.mode}<br />
                Altitude: {telemetry.position?.altitude.toFixed(1)}m<br />
                {telemetry.state?.armed ? 
                  <span className="text-red-600 font-bold">ARMED</span> : 
                  <span className="text-gray-600">DISARMED</span>
                }
              </div>
            </Popup>
          </Marker>
        )}

        {/* Waypoints */}
        {waypoints.map((waypoint, index) => (
          <Marker 
            key={waypoint.id} 
            position={[waypoint.lat, waypoint.lon]}
          >
            <Popup>
              <div className="text-sm">
                <strong>Waypoint {index + 1}</strong><br />
                Lat: {waypoint.lat.toFixed(6)}<br />
                Lon: {waypoint.lon.toFixed(6)}<br />
                Alt: {waypoint.alt}m<br />
                Command: {waypoint.command}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Flight Path */}
        {flightPath.length > 1 && (
          <Polyline 
            positions={flightPath} 
            color="blue" 
            weight={3}
            opacity={0.7}
          />
        )}

        {/* Planned Mission Path */}
        {waypoints.length > 1 && (
          <Polyline 
            positions={waypoints.map(wp => [wp.lat, wp.lon])} 
            color="red" 
            weight={2}
            opacity={0.8}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
    </div>
  );
};