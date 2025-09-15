// src/components/Controls/FlightControls.tsx
import React from 'react';
import { 
  Power, 
  Satellite, 
  Battery, 
  Signal,
  MapPin,
  Gauge,
  Activity
} from 'lucide-react';
import type { TelemetryData } from '../../types';

interface TelemetryMonitorProps {
  telemetry: TelemetryData;
}

export const FlightControls: React.FC<TelemetryMonitorProps> = ({ telemetry }) => {
  const formatCoordinate = (value: number, decimals: number = 6) => {
    return value ? value.toFixed(decimals) : '0.000000';
  };

  const formatValue = (value: number | undefined, unit: string = '', decimals: number = 2) => {
    return value !== undefined ? `${value.toFixed(decimals)}${unit}` : 'N/A';
  };

  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Telemetry Monitor</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Status</h3>
          
          {/* Armed State */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Armed Status</span>
              <div className={`flex items-center space-x-2 ${telemetry.state?.armed ? 'text-red-600' : 'text-green-600'}`}>
                <Power className="h-4 w-4" />
                <div className={`w-3 h-3 rounded-full ${telemetry.state?.armed ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="font-medium">{telemetry.state?.armed ? 'ARMED' : 'DISARMED'}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Mode: <span className="font-medium">{telemetry.state?.mode || 'Unknown'}</span></p>
              <p>System Status: <span className="font-medium">{telemetry.state?.system_status || 'Unknown'}</span></p>
            </div>
          </div>

          {/* Battery Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Battery</span>
              <div className="flex items-center space-x-2 text-blue-600">
                <Battery className="h-4 w-4" />
                <span className="font-medium">{telemetry.battery?.level || 0}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <p>Voltage: <span className="font-medium">{formatValue(telemetry.battery?.voltage, 'V')}</span></p>
              <p>Current: <span className="font-medium">{formatValue(telemetry.battery?.current, 'A')}</span></p>
            </div>
          </div>

          {/* GPS Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">GPS Navigation</span>
              <div className="flex items-center space-x-2 text-green-600">
                <Satellite className="h-4 w-4" />
                <span className="font-medium">{telemetry.navigation?.satellites_visible || 0} sats</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <p>Fix Type: <span className="font-medium">{telemetry.navigation?.fix_type || 0}</span></p>
              <p>Heading: <span className="font-medium">{formatValue(telemetry.navigation?.heading, '°')}</span></p>
              <p>EKF OK: <span className="font-medium">{telemetry.navigation?.ekf_ok ? 'Yes' : 'No'}</span></p>
              <p>Armable: <span className="font-medium">{telemetry.navigation?.is_armable ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>

        {/* Position & Motion */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Position & Motion</h3>
          
          {/* Position */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Position</span>
              <div className="flex items-center space-x-2 text-purple-600">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{formatValue(telemetry.position?.altitude, 'm')}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Latitude: <span className="font-mono text-xs">{formatCoordinate(telemetry.position?.latitude || 0)}</span></p>
              <p>Longitude: <span className="font-mono text-xs">{formatCoordinate(telemetry.position?.longitude || 0)}</span></p>
              <p>Altitude: <span className="font-medium">{formatValue(telemetry.position?.altitude, ' m')}</span></p>
            </div>
          </div>

          {/* Velocity */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Velocity</span>
              <div className="flex items-center space-x-2 text-orange-600">
                <Activity className="h-4 w-4" />
                <span className="font-medium">{formatValue(telemetry.navigation?.groundspeed, ' m/s')}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
              <p>X: <span className="font-medium">{formatValue(telemetry.velocity?.vx, ' m/s')}</span></p>
              <p>Y: <span className="font-medium">{formatValue(telemetry.velocity?.vy, ' m/s')}</span></p>
              <p>Z: <span className="font-medium">{formatValue(telemetry.velocity?.vz, ' m/s')}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
              <p>Ground Speed: <span className="font-medium">{formatValue(telemetry.navigation?.groundspeed, ' m/s')}</span></p>
              <p>Air Speed: <span className="font-medium">{formatValue(telemetry.navigation?.airspeed, ' m/s')}</span></p>
            </div>
          </div>

          {/* Attitude */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Attitude</span>
              <div className="flex items-center space-x-2 text-indigo-600">
                <Gauge className="h-4 w-4" />
                <span className="font-medium">{formatValue(telemetry.navigation?.heading, '°')}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
              <p>Roll: <span className="font-medium">{formatValue(telemetry.attitude?.roll, '°')}</span></p>
              <p>Pitch: <span className="font-medium">{formatValue(telemetry.attitude?.pitch, '°')}</span></p>
              <p>Yaw: <span className="font-medium">{formatValue(telemetry.attitude?.yaw, '°')}</span></p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Connection</span>
              <div className={`flex items-center space-x-2 ${
                telemetry.connection_status === 'CONNECTED' ? 'text-green-600' : 
                telemetry.connection_status === 'MOCK_DATA' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                <Signal className="h-4 w-4" />
                <span className="font-medium">{telemetry.connection_status || 'Unknown'}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Last Update: <span className="font-medium">
                {telemetry.timestamp ? new Date(telemetry.timestamp * 1000).toLocaleTimeString() : 'N/A'}
              </span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};