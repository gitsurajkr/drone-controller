// src/components/System/HealthMonitor.tsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  WifiOff, 
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import type { HealthData } from '../../types';

interface HealthMonitorProps {
  className?: string;
}

export const HealthMonitor: React.FC<HealthMonitorProps> = ({ className = '' }) => {
  const [healthData, setHealthData] = useState<HealthData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      const response = await fetch('http://localhost:3000/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setIsConnected(true);
        setLastUpdate(new Date());
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-400';
    if (value <= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (value <= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center font-mono">
          <Server className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ SYSTEM HEALTH
        </h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          <span className={`text-xs font-mono ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* System Resources */}
        <div className="space-y-3">
          <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-cyan-400/70 font-mono">CPU USAGE</span>
              </div>
              {healthData.cpu_usage !== undefined && 
                getHealthIcon(healthData.cpu_usage, { good: 70, warning: 85 })
              }
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    healthData.cpu_usage !== undefined && healthData.cpu_usage > 85 
                      ? 'bg-red-400' 
                      : healthData.cpu_usage !== undefined && healthData.cpu_usage > 70 
                        ? 'bg-yellow-400' 
                        : 'bg-green-400'
                  }`}
                  style={{ width: `${healthData.cpu_usage || 0}%` }}
                />
              </div>
              <span className={`text-sm font-mono font-bold ${
                healthData.cpu_usage !== undefined ? 
                  getHealthColor(healthData.cpu_usage, { good: 70, warning: 85 }) : 
                  'text-gray-400'
              }`}>
                {healthData.cpu_usage?.toFixed(1) || '--'}%
              </span>
            </div>
          </div>

          <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-cyan-400/70 font-mono">MEMORY</span>
              </div>
              {healthData.memory_usage !== undefined && 
                getHealthIcon(healthData.memory_usage, { good: 80, warning: 90 })
              }
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    healthData.memory_usage !== undefined && healthData.memory_usage > 90 
                      ? 'bg-red-400' 
                      : healthData.memory_usage !== undefined && healthData.memory_usage > 80 
                        ? 'bg-yellow-400' 
                        : 'bg-green-400'
                  }`}
                  style={{ width: `${healthData.memory_usage || 0}%` }}
                />
              </div>
              <span className={`text-sm font-mono font-bold ${
                healthData.memory_usage !== undefined ? 
                  getHealthColor(healthData.memory_usage, { good: 80, warning: 90 }) : 
                  'text-gray-400'
              }`}>
                {healthData.memory_usage?.toFixed(1) || '--'}%
              </span>
            </div>
          </div>

          <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-cyan-400/70 font-mono">DISK</span>
              </div>
              {healthData.disk_usage !== undefined && 
                getHealthIcon(healthData.disk_usage, { good: 80, warning: 90 })
              }
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    healthData.disk_usage !== undefined && healthData.disk_usage > 90 
                      ? 'bg-red-400' 
                      : healthData.disk_usage !== undefined && healthData.disk_usage > 80 
                        ? 'bg-yellow-400' 
                        : 'bg-green-400'
                  }`}
                  style={{ width: `${healthData.disk_usage || 0}%` }}
                />
              </div>
              <span className={`text-sm font-mono font-bold ${
                healthData.disk_usage !== undefined ? 
                  getHealthColor(healthData.disk_usage, { good: 80, warning: 90 }) : 
                  'text-gray-400'
              }`}>
                {healthData.disk_usage?.toFixed(1) || '--'}%
              </span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-3">
          <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-cyan-400/70 font-mono">UPTIME</span>
            </div>
            <div className="text-sm font-mono text-white">
              {healthData.uptime ? formatUptime(healthData.uptime) : '--'}
            </div>
          </div>

          <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-cyan-400/70 font-mono">DRONE CONNECTION</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-mono font-bold ${
                healthData.drone?.connected ? 'text-green-400' : 'text-red-400'
              }`}>
                {healthData.drone?.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
              <span className="text-xs font-mono text-gray-400">
                {healthData.drone?.connection_state || 'UNKNOWN'}
              </span>
            </div>
          </div>

          {healthData.cache && (
            <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-cyan-400/70 font-mono">CACHE STATUS</span>
              </div>
              <div className="text-xs font-mono text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>Entries:</span>
                  <span className="text-white">{healthData.cache.total_entries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="text-white">{healthData.cache.cache_size_estimate_kb.toFixed(1)}KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className="text-white">
                    {healthData.cache.current_size}/{healthData.cache.max_size}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {lastUpdate && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Last Updated:</span>
            <span>{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};