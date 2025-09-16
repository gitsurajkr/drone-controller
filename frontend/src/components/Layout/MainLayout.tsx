// src/components/Layout/MainLayout.tsx
import React, { useState } from 'react';
import Header from './Header';
import { Sidebar } from './Sidebar';
import { FlightDataPage } from '../../pages/FlightDataPage';
import { useDroneData } from '../../hooks/useDroneData';
import { Activity, Database, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = () => {
  const { 
    status, 
    isConnected, 
    connectionStatus, 
    connectDrone, 
    disconnectDrone 
  } = useDroneData();
  const [activeTab, setActiveTab] = useState('flight-data');

  const renderContent = () => {
    switch (activeTab) {
      case 'flight-data':
        return <FlightDataPage />;
      case 'map-view':
        return <FlightDataPage mapFocus={true} />;
      case 'instruments':
        return <FlightDataPage instrumentsFocus={true} />;
      case 'data-logs':
        return (
          <div className="p-6 min-h-full bg-gray-950">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="h-8 w-8 text-cyan-400" />
                <h1 className="text-3xl font-bold text-white">DATA LOGS</h1>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-400/20">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">FLIGHT RECORDS</h3>
                    <p className="text-gray-300">Historical telemetry data archive</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-400/20">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">MISSION LOGS</h3>
                    <p className="text-gray-300">Completed mission reports</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-400/20">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">ERROR LOGS</h3>
                    <p className="text-gray-300">System error diagnostics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'system-health':
        return (
          <div className="p-6 min-h-full bg-gray-950">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-8 w-8 text-green-400" />
                <h1 className="text-3xl font-bold text-white">SYSTEM HEALTH</h1>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-green-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-green-400">CPU</h3>
                      <Activity className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">12%</p>
                    <p className="text-gray-400 text-sm">Normal</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-green-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-green-400">MEMORY</h3>
                      <Activity className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">45%</p>
                    <p className="text-gray-400 text-sm">Optimal</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-yellow-400">TEMP</h3>
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">68°C</p>
                    <p className="text-gray-400 text-sm">Elevated</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-green-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-green-400">NETWORK</h3>
                      <Activity className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">98%</p>
                    <p className="text-gray-400 text-sm">Stable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6 min-h-full bg-gray-950">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-8 w-8 text-purple-400" />
                <h1 className="text-3xl font-bold text-white">FLIGHT ANALYTICS</h1>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-400/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">PERFORMANCE METRICS</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Flight Time</span>
                        <span className="text-white font-bold">2h 34m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Distance</span>
                        <span className="text-white font-bold">45.2 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Max Altitude</span>
                        <span className="text-white font-bold">120m</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-400/20">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">EFFICIENCY STATS</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Battery Usage</span>
                        <span className="text-white font-bold">87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Signal Quality</span>
                        <span className="text-white font-bold">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Success Rate</span>
                        <span className="text-white font-bold">98.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <FlightDataPage />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 relative overflow-hidden">
      <Header 
        status={status} 
        isConnected={isConnected}
        connectionStatus={connectionStatus}
        onConnect={connectDrone}
        onDisconnect={disconnectDrone}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};