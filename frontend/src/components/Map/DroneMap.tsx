// src/components/Map/DroneMap.tsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TelemetryData, Waypoint } from '../../types';
import { DroneCompass } from './DroneCompass';
// import GoogleMapTracker from './GoogleMapTracker'; // Available for future use

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom futuristic drone icon
const droneIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMwMGZmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIiBzdHJva2U9IiMwMGZmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMTYgNkwxNiAyNk04IDhMMjQgMjRNOCAyNEwyNCA4IiBzdHJva2U9IiMwMGZmZmYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjQiIGZpbGw9IiMwMGZmZmYiLz4KPC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
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
  const [mapType, setMapType] = React.useState<'satellite' | 'street' | 'dark' | 'terrain'>('satellite');
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

  // Map tile configurations
  const mapConfigs = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
    },
    street: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    }
  };

  // Handle map type change
  const handleMapTypeChange = (newMapType: string) => {
    setMapType(newMapType as any);
  };

  // Get drone heading for compass
  const droneHeading = telemetry.navigation?.heading || 0;

  return (
    <div className="relative h-full w-full" style={{ minHeight: '400px' }}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2 space-y-2">
        {/* Map Type Selector */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-semibold text-gray-700">Map Type</label>
          <select
            value={mapType}
            onChange={(e) => handleMapTypeChange(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white"
          >
            <option value="satellite">🛰️ Satellite</option>
            <option value="street">🗺️ Street</option>
            <option value="dark">🌙 Dark</option>
            <option value="terrain">🏔️ Terrain</option>
          </select>
        </div>
        
        {/* Follow Drone Toggle */}
        <button
          onClick={() => setFollowDrone(!followDrone)}
          className={`px-3 py-1 text-sm rounded w-full ${
            followDrone 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {followDrone ? 'Following' : 'Free View'}
        </button>
      </div>

      {/* Telemetry Overlay */}
      {/* {telemetry.position && (
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
      )} */}

      <MapContainer
        ref={mapRef}
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        whenReady={() => {
          if (mapRef.current) {
            mapRef.current.on('click', handleMapClick);
          }
        }}
      >
        <TileLayer
          attribution={mapConfigs[mapType as keyof typeof mapConfigs]?.attribution || mapConfigs.satellite.attribution}
          url={mapConfigs[mapType as keyof typeof mapConfigs]?.url || mapConfigs.satellite.url}
          maxZoom={18}
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

      {/* Advanced Drone Compass Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000]">
        <DroneCompass 
          heading={droneHeading} 
          size={120} 
          showLabel={true}
        />
      </div>
    </div>
  );
};