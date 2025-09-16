// src/components/Layout/Header.tsx
import React from 'react';
import { 
  Plane, 
  Wifi, 
  WifiOff, 
  Battery, 
  Satellite,
  Settings,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import type { DroneStatus } from '../../types';

interface HeaderProps {
  status: DroneStatus;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ status, isConnected }) => {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="bg-gray-900/90 backdrop-blur-sm text-white border-b border-cyan-400/30 shadow-2xl relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-purple-400/5 animate-pulse" />
      
      <div className="relative p-4 flex items-center justify-between">
        {/* Left Side - Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Plane className="h-10 w-10 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              TACTICAL DRONE CONTROL
            </h1>
            <p className="text-xs text-gray-400 font-mono">{getCurrentTime()}</p>
          </div>
        </div>
        
        {/* Center - Status Indicators */}
        <div className="hidden lg:flex items-center space-x-8">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-green-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs text-green-400 font-bold">ONLINE</span>
                  <span className="text-xs text-gray-400">Secured</span>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-red-400 font-bold">OFFLINE</span>
                  <span className="text-xs text-gray-400">No Signal</span>
                </div>
              </>
            )}
          </div>

          {/* Flight Mode */}
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
            <div className={`relative w-4 h-4 rounded-full ${status.armed ? 'bg-red-500' : 'bg-gray-500'}`}>
              {status.armed && <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${status.armed ? 'text-red-400' : 'text-gray-400'}`}>
                {status.armed ? 'ARMED' : 'SAFE'}
              </span>
              <span className="text-xs text-gray-400">{status.mode}</span>
            </div>
          </div>

          {/* Battery */}
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
            <Battery className={`h-5 w-5 ${
              status.battery > 60 ? 'text-green-400' : 
              status.battery > 30 ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${
                status.battery > 60 ? 'text-green-400' : 
                status.battery > 30 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {status.battery}%
              </span>
              <span className="text-xs text-gray-400">
                {status.battery > 60 ? 'Good' : status.battery > 30 ? 'Low' : 'Critical'}
              </span>
            </div>
          </div>

          {/* GPS */}
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
            <Satellite className={`h-5 w-5 ${status.gps_fix ? 'text-green-400' : 'text-red-400'}`} />
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${status.gps_fix ? 'text-green-400' : 'text-red-400'}`}>
                {status.satellites} SATS
              </span>
              <span className="text-xs text-gray-400">
                {status.gps_fix ? 'Fixed' : 'Searching'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - System Controls */}
        <div className="flex items-center space-x-4">
          {/* System Status */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-green-400/30">
            <Shield className="h-5 w-5 text-green-400" />
            <div className="flex flex-col">
              <span className="text-xs text-green-400 font-bold">SECURE</span>
              <span className="text-xs text-gray-400">All Systems</span>
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="hidden xl:flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-blue-400/30">
            <Activity className="h-5 w-5 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-xs text-blue-400 font-bold">98%</span>
              <span className="text-xs text-gray-400">Efficiency</span>
            </div>
          </div>

          {/* Settings */}
          <button className="p-3 hover:bg-gray-700/50 rounded-lg transition-all duration-200 border border-gray-700/50 hover:border-cyan-400/30 group">
            <Settings className="h-6 w-6 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200" />
          </button>

          {/* Emergency Button */}
          <button className="bg-red-600/20 hover:bg-red-600/30 border border-red-400/30 text-red-400 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 hover:glow-red">
            <Zap className="h-4 w-4 inline mr-2" />
            EMERGENCY
          </button>
        </div>
      </div>
    </header>
  );
};