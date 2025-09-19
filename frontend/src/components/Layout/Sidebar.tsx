// src/components/Layout/Sidebar.tsx
import React from 'react';
import { 
  Map, 
  Activity, 
  Gauge,
  Database,
  Monitor,
  TrendingUp,
  Radar,
  Target,
  Satellite,
  Shield,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const monitoringItems = [
  { id: 'flight-data', label: 'Live Telemetry', icon: Activity, color: 'cyan' },
  { id: 'data-logs', label: 'Data Archive', icon: Database, color: 'purple' },
  { id: 'system-health', label: 'System Health', icon: Monitor, color: 'emerald' },
  { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp, color: 'violet' },
];

const getColorClasses = (color: string, isActive: boolean) => {
  const colorMap = {
    cyan: isActive 
      ? 'bg-cyan-600/20 border-cyan-400/50 text-cyan-300' 
      : 'border-cyan-400/20 text-gray-300 hover:bg-cyan-600/10 hover:border-cyan-400/30 hover:text-cyan-300',
    green: isActive 
      ? 'bg-green-600/20 border-green-400/50 text-green-300' 
      : 'border-green-400/20 text-gray-300 hover:bg-green-600/10 hover:border-green-400/30 hover:text-green-300',
    blue: isActive 
      ? 'bg-blue-600/20 border-blue-400/50 text-blue-300' 
      : 'border-blue-400/20 text-gray-300 hover:bg-blue-600/10 hover:border-blue-400/30 hover:text-blue-300',
    purple: isActive 
      ? 'bg-purple-600/20 border-purple-400/50 text-purple-300' 
      : 'border-purple-400/20 text-gray-300 hover:bg-purple-600/10 hover:border-purple-400/30 hover:text-purple-300',
    emerald: isActive 
      ? 'bg-emerald-600/20 border-emerald-400/50 text-emerald-300' 
      : 'border-emerald-400/20 text-gray-300 hover:bg-emerald-600/10 hover:border-emerald-400/30 hover:text-emerald-300',
    violet: isActive 
      ? 'bg-violet-600/20 border-violet-400/50 text-violet-300' 
      : 'border-violet-400/20 text-gray-300 hover:bg-violet-600/10 hover:border-violet-400/30 hover:text-violet-300',
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.cyan;
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm text-white w-64 border-r border-gray-700/50 relative overflow-hidden">
      {/* Sidebar Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 via-transparent to-purple-400/5" />
      
  <div className="relative p-6 flex flex-col h-full overflow-y-auto">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative">
              <Radar className="h-8 w-8 text-cyan-400 animate-spin-slow" />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-cyan-400">OPERATIONS</h2>
              <p className="text-xs text-cyan-400 font-mono">CONSOLE</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-cyan-400/50 via-transparent to-transparent" />
        </div>

        {/* Mission Control Menu */}
        <div className="flex-1">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-6 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            MISSION CONTROL
          </h3>
          <nav className="space-y-3">
            {monitoringItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 border ${
                    getColorClasses(item.color, isActive)
                  } backdrop-blur-sm group`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <div className="absolute inset-0 bg-current opacity-20 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Status */}
        <div className="mt-8 space-y-4">
          {/* Connection Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-green-400 flex items-center">
                <Satellite className="h-4 w-4 mr-2" />
                DATA LINK
              </h4>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Signal</span>
                <span className="text-green-400 font-bold">95%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Latency</span>
                <span className="text-green-400 font-bold">12ms</span>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-cyan-400/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-cyan-400 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                SECURITY
              </h4>
              <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Encryption</span>
                <span className="text-cyan-400 font-bold">AES-256</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Auth</span>
                <span className="text-cyan-400 font-bold">SECURE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};