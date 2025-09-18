// src/components/Layout/Header.tsx
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Satellite,
  Zap,
  Activity
} from 'lucide-react';
import droneImage from '../../assets/drone.png';
import type { DroneStatus } from '../../types';

interface HeaderProps {
  status: DroneStatus;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
  onConnect: () => Promise<boolean>;
  onDisconnect: () => Promise<boolean>;
}

export default function Header({ status, isConnected, connectionStatus, onConnect, onDisconnect }: HeaderProps) {
  const handleConnectionToggle = async () => {
    if (connectionStatus === 'connecting' || connectionStatus === 'disconnecting') return;
    
    try {
      if (isConnected) {
        await onDisconnect();
      } else {
        await onConnect();
      }
    } catch (error) {
      console.error('Connection operation failed:', error);
    }
  };

  const getConnectionButtonText = () => {
    if (connectionStatus === 'connecting') return 'Connecting...';
    if (connectionStatus === 'disconnecting') return 'Disconnecting...';
    return isConnected ? 'Disconnect' : 'Connect';
  };

  const getConnectionButtonClass = () => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg";
    
    if (connectionStatus === 'connecting' || connectionStatus === 'disconnecting') {
      return `${baseClass} bg-yellow-600 text-yellow-100 cursor-not-allowed opacity-75`;
    }
    
    if (isConnected) {
      return `${baseClass} bg-red-600 hover:bg-red-700 text-red-100 border border-red-500`;
    }
    
    return `${baseClass} bg-green-600 hover:bg-green-700 text-green-100 border border-green-500`;
  };

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
            <img src={droneImage} alt="Drone" className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SkyCommand
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

          {/* Connection Control */}
          <button
            onClick={handleConnectionToggle}
            disabled={connectionStatus === 'connecting' || connectionStatus === 'disconnecting'}
            className={getConnectionButtonClass()}
          >
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connecting' || connectionStatus === 'disconnecting' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isConnected ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              <span className="text-sm font-bold">{getConnectionButtonText()}</span>
            </div>
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