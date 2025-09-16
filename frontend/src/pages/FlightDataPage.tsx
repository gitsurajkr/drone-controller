// src/pages/FlightDataPage.tsx
import React, { useState } from 'react';
import { DroneMap } from '../components/Map/DroneMap';
import FlightInstruments from '../components/Telemetry/FlightInstruments';
import { TelemetryMonitor } from '../components/Controls/TelemetryMonitor';
import { HealthMonitor } from '../components/System/HealthMonitor';
import { useDroneData } from '../hooks/useDroneData';
import { 
  Expand, 
  Minimize, 
  Target, 
  Crosshair,
  Activity,
  Gauge,
  Navigation
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
  const [activeView, setActiveView] = useState<'overview' | 'instruments' | 'telemetry' | 'health'>(
    instrumentsFocus ? 'instruments' : 'overview'
  );

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
        <div className="absolute top-24 left-2 z-[1000] flex items-center space-x-4">
          <button
            onClick={() => setIsFullscreenMap(false)}
            className="bg-white backdrop-blur-sm border border-gray-300 rounded-lg p-3 text-black hover:bg-gray-200 transition-all duration-200 shadow-lg"
          >
            <Minimize className="h-5 w-5" />
          </button>
          
        </div>

        {/* Mission Status HUD */}
        <div className="absolute top-6 right-6 z-[1000] bg-white border border-cyan-400/30 rounded-xl p-3 min-w-[340px] max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5" />
            <span className=" font-bold text-xl">Campaign Status </span>
          </div>
          
          {/* Priority 1: Flight Mode & Critical Status */}
          <div className="mb-2 bg-gray-200 rounded-lg p-3 border border-cyan-400/10">
            <div className="text-sm font-bold mb-2 font-mono">◄ FLIGHT CONTROL</div>
            <div className="grid grid-cols-1 text-sm font-mono">
              <div className="flex justify-between">
                <span className="font-semibold">MODE:</span>
                <span className="font-bold">{telemetry?.state?.mode || 'UNKNOWN'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">ARMED:</span>
                <span className={`font-bold ${telemetry?.state?.armed ? 'text-red-400' : 'text-green-500'}`}>
                  {telemetry?.state?.armed ? 'ARMED' : 'DISARMED'}
                </span>
              </div>
            </div>
          </div>

          {/* Priority 2: Power System */}
          <div className="mb-2 bg-gray-200 rounded-lg p-3 border border-cyan-400/10">
            <div className="text-sm font-bold mb-2 font-mono">◄ POWER CORE</div>
            <div className="grid grid-cols-2 text-sm font-mono">
              <div className="font-bold">
                BAT: <span className={`text-lg font-bold ${
                  (telemetry?.battery?.level || 0) > 60 ? 'text-green-400' :
                  (telemetry?.battery?.level || 0) > 30 ? 'text-yellow-400' : 'text-red-400'
                }`}>{telemetry?.battery?.level || 0}%</span>
              </div>
              <div className="font-bold">
                VOLT: <span className="font-bold">{telemetry?.battery?.voltage?.toFixed(2) || '0.00'}V</span>
              </div>
              <div className="font-bold col-span-2">
                AMP: <span className="font-bold">{telemetry?.battery?.current?.toFixed(2) || '0.00'}A</span>
              </div>
            </div>
          </div>

          {/* Priority 3: Position & Attitude */}
          <div className="mb-2 bg-gray-200 rounded-lg p-3 border border-cyan-400/10">
            <div className=" text-sm font-bold mb-2 font-mono">◄ POSITION</div>
            <div className="grid grid-cols-2 text-sm font-mono">
              <div className="font-bold">
                ALT: <span className=" font-bold">{telemetry?.position?.altitude?.toFixed(1) || '0.0'}m</span>
              </div>
              <div className="font-bold">
                YAW: <span className="font-bold">{((telemetry?.attitude?.yaw || 0) * 180 / Math.PI).toFixed(1)}°</span>
              </div>
              <div className="font-bold">
                PITCH: <span className=" font-bold">{((telemetry?.attitude?.pitch || 0) * 180 / Math.PI).toFixed(1)}°</span>
              </div>
              <div className="font-bold">
                ROLL: <span className=" font-bold">{((telemetry?.attitude?.roll || 0) * 180 / Math.PI).toFixed(1)}°</span>
              </div>
            </div>
          </div>

          {/* Priority 4: Navigation */}
          <div className="mb-2 bg-gray-200 rounded-lg p-3 border border-cyan-400/10">
            <div className=" text-sm  font-bold mb-2 font-mono">◄ NAVIGATION</div>
            <div className="grid grid-cols-2 text-sm font-mono">
              <div className="font-bold">
                GPS: <span className={`font-bold ${
                  (telemetry?.navigation?.satellites_visible || 0) >= 6 ? 'text-green-400' :
                  (telemetry?.navigation?.satellites_visible || 0) >= 3 ? 'text-yellow-400' : 'text-red-400'
                }`}>{telemetry?.navigation?.satellites_visible || 0}</span>
              </div>
              <div className="font-bold">
                HDG: <span className=" font-bold">{telemetry?.navigation?.heading?.toFixed(0) || '0'}°</span>
              </div>
              <div className="font-bold col-span-2">
                GS: <span className=" font-bold">{telemetry?.navigation?.groundspeed?.toFixed(1) || '0.0'}m/s</span>
              </div>
            </div>
          </div>

          {/* Priority 5: Velocity Vector */}
          <div className="mb-2 bg-gray-200 rounded-lg p-3 border border-cyan-400/10">
            <div className=" text-sm font-bold mb-2 font-mono">◄ VELOCITY</div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="text-center">
                <div className="font-bold text-sm">VX</div>
                <div className="font-bold">{telemetry?.velocity?.vx?.toFixed(1) || '0.0'}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">VY</div>
                <div className="font-bold">{telemetry?.velocity?.vy?.toFixed(1) || '0.0'}</div>
              </div>
              <div className="text-center text-sm">
                <div className="font-bold">VZ</div>
                <div className="font-bold">{telemetry?.velocity?.vz?.toFixed(1) || '0.0'}</div>
              </div>
            </div>
          </div>

          {/* Additional System Info */}
          <div className="bg-gray-200 rounded-lg p-3 border border-cyan-400/10">
            <div className="text-sm font-bold mb-2 font-mono">◄ SYSTEM</div>
            <div className="grid grid-cols-1 gap-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="font-bold">EKF:</span>
                <span className={`font-bold ${telemetry?.navigation?.ekf_ok ? 'text-green-400' : 'text-red-400'}`}>
                  {telemetry?.navigation?.ekf_ok ? 'OK' : 'ERROR'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">FIX:</span>
                <span className=" font-bold">{telemetry?.navigation?.fix_type || 0}</span>
              </div>
            </div>
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
        {/* <div className="bg-gray-900/80 backdrop-blur-sm border-b border-cyan-400/20 px-6 py-4 z-10"> */}
          {/* <div className="flex items-center justify-between"> */}
            {/* <div className="flex items-center space-x-6"> */}
              {/* <div className="flex items-center space-x-3">
                <Radar className="h-6 w-6 text-cyan-400" />
                <span className="text-lg font-bold text-cyan-400 font-mono">FLIGHT DATA</span>
              </div> */}
              
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
            {/* </div>
          </div>
        </div> */}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'overview' && (
            <div className="h-full grid grid-cols-4 gap-6 p-6">
              {/* Map Section */}
              <div className="col-span-3 bg-gray-900/60 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="h-full relative">
                  <DroneMap telemetry={telemetry} />
                  {/* <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg px-3 py-2">
                    <span className="text-cyan-400 font-bold font-mono text-sm">TACTICAL MAP</span>
                  </div> */}
                  
                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setIsFullscreenMap(true)}
                    className="absolute top-24 left-2 z-[1001] bg-white backdrop-blur-sm border border-gray-300 rounded-lg p-3 text-black hover:bg-gray-200 transition-all duration-200 shadow-lg hover:border-cyan-400/50 hover:shadow-cyan-400/20"
                    title="Enter Fullscreen Mode"
                  >
                    <Expand className="h-5 w-5" />
                  </button>
                  
                  {/* Mission Status HUD */}
                  {/* <div className="absolute top-4 right-16 bg-gray-900/90 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-4 min-w-[380px] max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-cyan-400" />
                      <span className="text-cyan-400 font-bold font-mono">MISSION STATUS HUD</span>
                    </div> */}
                    
                    {/* Priority 1: Flight Mode & Critical Status */}
                    {/* <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                      <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ FLIGHT CONTROL</div>
                      <div className="grid grid-cols-1 gap-2 text-sm font-mono">
                        <div className="flex justify-between">
                          <span className="text-cyan-400/70">MODE:</span>
                          <span className="text-yellow-400 font-bold">{telemetry?.state?.mode || 'UNKNOWN'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-400/70">ARMED:</span>
                          <span className={`font-bold ${telemetry?.state?.armed ? 'text-red-400' : 'text-green-400'}`}>
                            {telemetry?.state?.armed ? 'ARMED' : 'DISARMED'}
                          </span>
                        </div>
                      </div>
                    </div> */}

                    {/* Priority 2: Power System */}
                    {/* <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                      <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ POWER CORE</div>
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        <div className="text-cyan-400/70">
                          BAT: <span className={`font-bold ${
                            (telemetry?.battery?.level || 0) > 60 ? 'text-green-400' :
                            (telemetry?.battery?.level || 0) > 30 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{telemetry?.battery?.level || 0}%</span>
                        </div>
                        <div className="text-cyan-400/70">
                          VOLT: <span className="text-yellow-400 font-bold">{telemetry?.battery?.voltage?.toFixed(2) || '0.00'}V</span>
                        </div>
                        <div className="text-cyan-400/70 col-span-2">
                          AMP: <span className="text-orange-400 font-bold">{telemetry?.battery?.current?.toFixed(2) || '0.00'}A</span>
                        </div>
                      </div>
                    </div> */}

                    {/* Priority 3: Position & Attitude */}
                    {/* <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                      <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ POSITION</div>
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        <div className="text-cyan-400/70">
                          ALT: <span className="text-green-400 font-bold">{telemetry?.position?.altitude?.toFixed(1) || '0.0'}m</span>
                        </div>
                        <div className="text-cyan-400/70">
                          YAW: <span className="text-cyan-400 font-bold">{((telemetry?.attitude?.yaw || 0) * 180 / Math.PI).toFixed(1)}°</span>
                        </div>
                        <div className="text-cyan-400/70">
                          PITCH: <span className="text-cyan-400 font-bold">{((telemetry?.attitude?.pitch || 0) * 180 / Math.PI).toFixed(1)}°</span>
                        </div>
                        <div className="text-cyan-400/70">
                          ROLL: <span className="text-cyan-400 font-bold">{((telemetry?.attitude?.roll || 0) * 180 / Math.PI).toFixed(1)}°</span>
                        </div>
                      </div>
                    </div> */}

                    {/* Priority 4: Navigation */}
                    {/* <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                      <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ NAVIGATION</div>
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        <div className="text-cyan-400/70">
                          GPS: <span className={`font-bold ${
                            (telemetry?.navigation?.satellites_visible || 0) >= 6 ? 'text-green-400' :
                            (telemetry?.navigation?.satellites_visible || 0) >= 3 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{telemetry?.navigation?.satellites_visible || 0}</span>
                        </div>
                        <div className="text-cyan-400/70">
                          HDG: <span className="text-cyan-400 font-bold">{telemetry?.navigation?.heading?.toFixed(0) || '0'}°</span>
                        </div>
                        <div className="text-cyan-400/70 col-span-2">
                          GS: <span className="text-green-400 font-bold">{telemetry?.navigation?.groundspeed?.toFixed(1) || '0.0'}m/s</span>
                        </div>
                      </div>
                    </div> */}

                    {/* Priority 5: Velocity Vector */}
                    {/* <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                      <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ VELOCITY</div>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div className="text-center">
                          <div className="text-cyan-400/70">VX</div>
                          <div className="text-purple-400 font-bold">{telemetry?.velocity?.vx?.toFixed(1) || '0.0'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-cyan-400/70">VY</div>
                          <div className="text-purple-400 font-bold">{telemetry?.velocity?.vy?.toFixed(1) || '0.0'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-cyan-400/70">VZ</div>
                          <div className="text-purple-400 font-bold">{telemetry?.velocity?.vz?.toFixed(1) || '0.0'}</div>
                        </div>
                      </div>
                    </div> */}

                    {/* Additional System Info */}
                    {/* <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                      <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ SYSTEM</div>
                      <div className="grid grid-cols-1 gap-2 text-sm font-mono">
                        <div className="flex justify-between">
                          <span className="text-cyan-400/70">EKF:</span>
                          <span className={`font-bold ${telemetry?.navigation?.ekf_ok ? 'text-green-400' : 'text-red-400'}`}>
                            {telemetry?.navigation?.ekf_ok ? 'OK' : 'ERROR'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyan-400/70">FIX:</span>
                          <span className="text-blue-400 font-bold">{telemetry?.navigation?.fix_type || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Mission Status HUD Panel */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="h-full overflow-y-auto p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-cyan-400" />
                    <span className="text-cyan-400 font-bold font-mono text-lg">Campaign Status</span>
                  </div>
                  
                  {/* Priority 1: Flight Mode & Critical Status */}
                  <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                    <div className="text-cyan-400 text-lg font-bold mb-2 font-mono">◄ FLIGHT CONTROL</div>
                    <div className="grid grid-cols-1 gap-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-cyan-400/70">MODE:</span>
                        <span className="text-yellow-400 font-bold">{telemetry?.state?.mode || 'UNKNOWN'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-400/70">ARMED:</span>
                        <span className={`font-bold ${telemetry?.state?.armed ? 'text-red-400' : 'text-green-400'}`}>
                          {telemetry?.state?.armed ? 'ARMED' : 'DISARMED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Priority 2: Power System */}
                  <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                    <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ POWER CORE</div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      <div className="text-cyan-400/70">
                        BAT: <span className={`font-bold ${
                          (telemetry?.battery?.level || 0) > 60 ? 'text-green-400' :
                          (telemetry?.battery?.level || 0) > 30 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{telemetry?.battery?.level || 0}%</span>
                      </div>
                      <div className="text-cyan-400/70">
                        VOLT: <span className="text-yellow-400 font-bold">{telemetry?.battery?.voltage?.toFixed(2) || '0.00'}V</span>
                      </div>
                      <div className="text-cyan-400/70 col-span-2">
                        AMP: <span className="text-orange-400 font-bold">{telemetry?.battery?.current?.toFixed(2) || '0.00'}A</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority 3: Position & Attitude */}
                  <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                    <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ POSITION</div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      <div className="text-cyan-400/70">
                        ALT: <span className="text-green-400 font-bold">{telemetry?.position?.altitude?.toFixed(1) || '0.0'}m</span>
                      </div>
                      <div className="text-cyan-400/70">
                        YAW: <span className="text-cyan-400 font-bold">{((telemetry?.attitude?.yaw || 0) * 180 / Math.PI).toFixed(1)}°</span>
                      </div>
                      <div className="text-cyan-400/70">
                        PITCH: <span className="text-cyan-400 font-bold">{((telemetry?.attitude?.pitch || 0) * 180 / Math.PI).toFixed(1)}°</span>
                      </div>
                      <div className="text-cyan-400/70">
                        ROLL: <span className="text-cyan-400 font-bold">{((telemetry?.attitude?.roll || 0) * 180 / Math.PI).toFixed(1)}°</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority 4: Navigation */}
                  <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                    <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ NAVIGATION</div>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      <div className="text-cyan-400/70">
                        GPS: <span className={`font-bold ${
                          (telemetry?.navigation?.satellites_visible || 0) >= 6 ? 'text-green-400' :
                          (telemetry?.navigation?.satellites_visible || 0) >= 3 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{telemetry?.navigation?.satellites_visible || 0}</span>
                      </div>
                      <div className="text-cyan-400/70">
                        HDG: <span className="text-cyan-400 font-bold">{telemetry?.navigation?.heading?.toFixed(0) || '0'}°</span>
                      </div>
                      <div className="text-cyan-400/70 col-span-2">
                        GS: <span className="text-green-400 font-bold">{telemetry?.navigation?.groundspeed?.toFixed(1) || '0.0'}m/s</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority 5: Velocity Vector */}
                  <div className="mb-4 bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                    <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ VELOCITY</div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div className="text-center">
                        <div className="text-cyan-400/70">VX</div>
                        <div className="text-purple-400 font-bold">{telemetry?.velocity?.vx?.toFixed(1) || '0.0'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-cyan-400/70">VY</div>
                        <div className="text-purple-400 font-bold">{telemetry?.velocity?.vy?.toFixed(1) || '0.0'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-cyan-400/70">VZ</div>
                        <div className="text-purple-400 font-bold">{telemetry?.velocity?.vz?.toFixed(1) || '0.0'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional System Info */}
                  <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                    <div className="text-cyan-400 text-xs font-bold mb-2 font-mono">◄ SYSTEM</div>
                    <div className="grid grid-cols-1 gap-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-cyan-400/70">EKF:</span>
                        <span className={`font-bold ${telemetry?.navigation?.ekf_ok ? 'text-green-400' : 'text-red-400'}`}>
                          {telemetry?.navigation?.ekf_ok ? 'OK' : 'ERROR'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-400/70">FIX:</span>
                        <span className="text-blue-400 font-bold">{telemetry?.navigation?.fix_type || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

          {activeView === 'health' && (
            <div className="h-full p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <HealthMonitor className="h-fit" />
                <div className="bg-gray-900/60 backdrop-blur-sm border border-cyan-400/20 rounded-xl overflow-hidden shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
                    <Target className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
                    ◄ BACKEND STATUS
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                      <div className="text-sm text-cyan-400/70 mb-2 font-mono">Backend Endpoints:</div>
                      <div className="text-xs font-mono text-gray-300 space-y-1">
                        <div>• GET /telemetry - Real-time telemetry data</div>
                        <div>• GET /health - System health monitoring</div>
                        <div>• GET /telemetry/history - Historical data</div>
                      </div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                      <div className="text-sm text-cyan-400/70 mb-2 font-mono">Data Sources:</div>
                      <div className="text-xs font-mono text-gray-300 space-y-1">
                        <div>• Python DroneKit Backend</div>
                        <div>• WebSocket Server (Port 8765)</div>
                        <div>• Node.js API Server (Port 3000)</div>
                      </div>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                      <div className="text-sm text-cyan-400/70 mb-2 font-mono">Connection Status:</div>
                      <div className="text-sm font-mono">
                        <span className={`font-bold ${
                          telemetry?.connection_status === 'CONNECTED' ? 'text-green-400' : 
                          telemetry?.connection_status === 'LOCK_TIMEOUT' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {telemetry?.connection_status || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
