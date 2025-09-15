// src/components/Layout/Header.tsx
import React from 'react';
import { 
  Plane, 
  Wifi, 
  WifiOff, 
  Battery, 
  Satellite,
  Settings 
} from 'lucide-react';
import type { DroneStatus } from '../../types';

interface HeaderProps {
  status: DroneStatus;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ status, isConnected }) => {
  return (
    <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Plane className="h-8 w-8 text-blue-400" />
        <h1 className="text-xl font-bold">Drone Telemetry Monitor</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-400" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-400" />
          )}
          <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Flight Mode */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${status.armed ? 'bg-red-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm font-medium">{status.mode}</span>
          {status.armed && <span className="text-xs text-red-400 font-bold">ARMED</span>}
        </div>

        {/* Battery */}
        <div className="flex items-center space-x-2">
          <Battery className={`h-5 w-5 ${
            status.battery > 50 ? 'text-green-400' : 
            status.battery > 25 ? 'text-yellow-400' : 'text-red-400'
          }`} />
          <span className="text-sm">{status.battery}%</span>
        </div>

        {/* GPS */}
        <div className="flex items-center space-x-2">
          <Satellite className={`h-5 w-5 ${status.gps_fix ? 'text-green-400' : 'text-red-400'}`} />
          <span className="text-sm">{status.satellites} sats</span>
        </div>

        {/* Settings */}
        <button className="p-2 hover:bg-gray-700 rounded">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};