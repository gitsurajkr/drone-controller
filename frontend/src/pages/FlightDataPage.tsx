// src/pages/FlightDataPage.tsx
import React, { useState } from 'react';
import { DroneMap } from '../components/Map/DroneMap';
import FlightInstruments from '../components/Telemetry/FlightInstruments';
import { TelemetryMonitor } from '../components/Controls/TelemetryMonitor';
import { useDroneData } from '../hooks/useDroneData';
import { 
  Expand, 
  Minimize, 
  Target, 
  Radar, 
  Crosshair,
  Activity,
  Navigation,
  Gauge
} from 'lucide-react';

interface FlightDataPageProps {
  mapFocus?: boolean;
  instrumentsFocus?: boolean;
}

export const FlightDataPage: React.FC<FlightDataPageProps> = ({ 
  mapFocus = false, 
  instrumentsFocus = false 
}) => {
  const { telemetry } = useDroneData();
  const [isFullscreenMap, setIsFullscreenMap] = useState(mapFocus);
  const [activeView, setActiveView] = useState<'overview' | 'instruments' | 'telemetry'>('overview');

  if (isFullscreenMap) {
    return (
      <div className="h-full relative bg-gray-950 overflow-hidden">
        {/* Tactical Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.1),transparent_50%)]" />
        
        {/* Fullscreen Map */}
        <DroneMap telemetry={telemetry} />
        
        {/* HUD Grid Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        {/* Crosshair Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Crosshair className="h-8 w-8 text-cyan-400/50" />
        </div>

        {/* Top Controls */}
        <div className="absolute top-6 left-6 z-[1000] flex items-center space-x-4">
          <button
            onClick={() => setIsFullscreenMap(false)}
            className="bg-gray-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 text-cyan-400 hover:bg-gray-800/80 transition-all duration-200 shadow-lg"
          >
            <Minimize className="h-5 w-5" />
          </button>
          
          <div className="bg-gray-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-400 font-mono text-sm">
            TACTICAL MAP - FULL SCREEN
          </div>
        </div>

        {/* Mission Status HUD */}
        <div className="absolute top-6 right-6 z-[1000] bg-gray-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 min-w-[300px]">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-cyan-400" />
            <span className="text-cyan-400 font-bold font-mono">MISSION STATUS</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm font-mono">
            <div className="text-cyan-400/70">ALT: <span className="text-green-400">{telemetry?.position?.altitude?.toFixed(1) || '0.0'}m</span></div>
            <div className="text-cyan-400/70">SPD: <span className="text-green-400">{telemetry?.navigation?.groundspeed?.toFixed(1) || '0.0'}m/s</span></div>
            <div className="text-cyan-400/70">SAT: <span className="text-yellow-400">{telemetry?.navigation?.satellites_visible || 0}</span></div>
            <div className="text-cyan-400/70">BAT: <span className="text-green-400">{telemetry?.battery?.level || 0}%</span></div>
          </div>
        </div>
      </div>
    );
  }

  // Main Layout with consistent design
  return (
    <div className="h-full bg-gray-950 text-gray-100 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(6,182,212,0.03)_50%,transparent_51%)] bg-[length:20px_20px]" />
      
      <div className="relative flex flex-col h-full">
        {/* Control Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-cyan-400/20 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Radar className="h-6 w-6 text-cyan-400" />
                <span className="text-lg font-bold text-cyan-400 font-mono">FLIGHT DATA</span>
              </div>
              
              {/* View Selector */}
              <div className="flex items-center space-x-2 bg-gray-800/60 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeView === 'overview' 
                      ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-400/30' 
                      : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  <Activity className="h-4 w-4 mr-2 inline" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveView('instruments')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeView === 'instruments' 
                      ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-400/30' 
                      : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  <Gauge className="h-4 w-4 mr-2 inline" />
                  Instruments
                </button>
                <button
                  onClick={() => setActiveView('telemetry')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeView === 'telemetry' 
                      ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-400/30' 
                      : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  <Navigation className="h-4 w-4 mr-2 inline" />
                  Telemetry
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFullscreenMap(true)}
                className="bg-gray-800/60 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-400 hover:bg-gray-700/60 transition-all duration-200 flex items-center space-x-2"
              >
                <Expand className="h-4 w-4" />
                <span className="text-sm font-medium">Fullscreen Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'overview' && (
            <div className="h-full grid grid-cols-3 gap-6 p-6">
              {/* Map Section */}
              <div className="col-span-2 bg-gray-900/60 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="h-full relative">
                  <DroneMap telemetry={telemetry} />
                  <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg px-3 py-2">
                    <span className="text-cyan-400 font-bold font-mono text-sm">TACTICAL MAP</span>
                  </div>
                </div>
              </div>

              {/* Instruments Panel */}
              {/* <div className="bg-gray-900/60 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="h-full overflow-y-auto">
                  <FlightInstruments telemetry={telemetry} />
                </div>
              </div> */}
            </div>
          )}

          {activeView === 'instruments' && (
            <div className="h-full p-6">
              <div className="h-full bg-gray-900/60 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden shadow-2xl">
                <FlightInstruments telemetry={telemetry} />
              </div>
            </div>
          )}

          {activeView === 'telemetry' && (
            <div className="h-full">
              <TelemetryMonitor telemetry={telemetry} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
