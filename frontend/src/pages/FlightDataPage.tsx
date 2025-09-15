// src/pages/FlightDataPage.tsx
import React, { useState } from 'react';
import { DroneMap } from '../components/Map/DroneMap';
import { FlightInstruments } from '../components/Telemetry/FlightInstruments';
import { FlightControls } from '../components/Controls/FlightControls';
import { DroneCompass } from '../components/Map/DroneCompass';
import { useDroneData } from '../hooks/useDroneData';
import { ChevronLeft, ChevronRight, Expand, Minimize } from 'lucide-react';

interface FlightDataPageProps {
  mapFocus?: boolean;
  instrumentsFocus?: boolean;
}

export const FlightDataPage: React.FC<FlightDataPageProps> = ({ 
  mapFocus = false, 
  instrumentsFocus = false 
}) => {
  const { telemetry, sendCommand } = useDroneData();
  const [isFullscreenMap, setIsFullscreenMap] = useState(mapFocus);
  const [showInstruments, setShowInstruments] = useState(true);
  const [showControls, setShowControls] = useState(!instrumentsFocus); // Hide controls in instruments focus mode

  if (isFullscreenMap) {
    return (
      <div className="h-full relative">
        {/* Fullscreen Map */}
        <DroneMap telemetry={telemetry} />
        
        {/* Floating Controls */}
        <div className="absolute top-4 left-4 z-[1000] space-y-4">
          {/* Exit Fullscreen */}
          <button
            onClick={() => setIsFullscreenMap(false)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
            title="Exit Fullscreen"
          >
            <Minimize className="h-5 w-5 text-gray-700" />
          </button>
          
          {/* Compass */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
            <DroneCompass 
              heading={telemetry.navigation?.heading || 0}
              size={80}
            />
          </div>
        </div>

        {/* Floating Telemetry Summary */}
        <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-sm text-white rounded-lg p-4 max-w-xs">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="font-medium">{telemetry.state?.mode || 'UNKNOWN'}</span>
            </div>
            <div className="flex justify-between">
              <span>Armed:</span>
              <span className={`font-medium ${telemetry.state?.armed ? 'text-red-400' : 'text-gray-400'}`}>
                {telemetry.state?.armed ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Battery:</span>
              <span className="font-medium">{telemetry.battery?.level || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>Altitude:</span>
              <span className="font-medium">{(telemetry.position?.altitude || 0).toFixed(1)}m</span>
            </div>
            <div className="flex justify-between">
              <span>Speed:</span>
              <span className="font-medium">{(telemetry.navigation?.groundspeed || 0).toFixed(1)} m/s</span>
            </div>
            <div className="flex justify-between">
              <span>Heading:</span>
              <span className="font-medium">{(telemetry.navigation?.heading || 0).toFixed(0)}°</span>
            </div>
            <div className="flex justify-between">
              <span>Satellites:</span>
              <span className="font-medium">{telemetry.navigation?.satellites_visible || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="absolute bottom-4 right-4 z-[1000] flex space-x-2">
          <button
            onClick={() => sendCommand('arm')}
            disabled={telemetry.state?.armed}
            className="bg-orange-600/90 backdrop-blur-sm hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ARM
          </button>
          <button
            onClick={() => sendCommand('takeoff', { altitude: 10 })}
            disabled={!telemetry.state?.armed}
            className="bg-green-600/90 backdrop-blur-sm hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            TAKEOFF
          </button>
          <button
            onClick={() => sendCommand('land')}
            className="bg-blue-600/90 backdrop-blur-sm hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            LAND
          </button>
          <button
            onClick={() => sendCommand('rtl')}
            className="bg-yellow-600/90 backdrop-blur-sm hover:bg-yellow-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            RTL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main Map Area - Takes up 2/3 of the screen */}
      <div className="flex-1 relative">
        <DroneMap telemetry={telemetry} />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
          <button
            onClick={() => setIsFullscreenMap(true)}
            className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-lg transition-colors"
            title="Fullscreen Map"
          >
            <Expand className="h-5 w-5 text-gray-700" />
          </button>
          
          <button
            onClick={() => setShowInstruments(!showInstruments)}
            className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-lg transition-colors"
            title="Toggle Instruments"
          >
            {showInstruments ? <ChevronRight className="h-5 w-5 text-gray-700" /> : <ChevronLeft className="h-5 w-5 text-gray-700" />}
          </button>
        </div>

        {/* Floating Compass */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
          <DroneCompass 
            heading={telemetry.navigation?.heading || 0}
            size={100}
          />
        </div>
      </div>
      
      {/* Right Panel - Instruments and Controls */}
      {showInstruments && (
        <div className="w-96 flex flex-col bg-gray-50 border-l border-gray-200">
          {/* Flight Instruments */}
          <div className="flex-1 overflow-y-auto">
            <FlightInstruments telemetry={telemetry} />
          </div>
          
          {/* Toggle Controls Button */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="w-full text-sm text-gray-600 hover:text-gray-800 py-1"
            >
              {showControls ? 'Hide Controls' : 'Show Controls'}
            </button>
          </div>
          
          {/* Flight Controls */}
          {showControls && (
            <div className="border-t border-gray-200 max-h-80 overflow-y-auto">
              <FlightControls telemetry={telemetry} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};