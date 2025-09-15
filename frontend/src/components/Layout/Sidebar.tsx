// src/components/Layout/Sidebar.tsx
import React from 'react';
import { 
  Map, 
  Activity, 
  Gauge,
  Database,
  Monitor,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const monitoringItems = [
  { id: 'flight-data', label: 'Live Telemetry', icon: Activity },
  { id: 'map-view', label: 'Map View', icon: Map },
  { id: 'instruments', label: 'Flight Instruments', icon: Gauge },
  { id: 'data-logs', label: 'Data Logs', icon: Database },
  { id: 'system-health', label: 'System Health', icon: Monitor },
  { id: 'analytics', label: 'Flight Analytics', icon: TrendingUp },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-gray-800 text-white w-64 p-4 flex flex-col">
      {/* Monitoring Menu */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Monitoring Dashboard
        </h3>
        <nav className="space-y-2">
          {monitoringItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Connection Status */}
      <div className="mt-auto">
        <div className="bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Connection Status</h4>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Live Data Stream</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Real-time telemetry monitoring
          </div>
        </div>
      </div>
    </div>
  );
};