// src/components/Telemetry/FlightInstruments.tsx
import React from 'react';
import { Battery, Gauge, Plane } from 'lucide-react';
import type { TelemetryData } from '../../types';

interface FlightInstrumentsProps {
  telemetry: TelemetryData;
}

const AttitudeIndicator: React.FC<{ pitch: number; roll: number }> = ({ pitch, roll }) => {
  return (
    <div className="relative w-32 h-32 bg-gradient-to-b from-blue-400 to-green-400 rounded-full overflow-hidden border-4 border-gray-700">
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent to-green-600"
        style={{
          transform: `rotate(${roll}deg) translateY(${pitch * 2}px)`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 bg-white rounded-full" />
        <div className="absolute w-8 h-0.5 bg-white" style={{ left: '50%', transform: 'translateX(-50%)' }} />
      </div>
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
        {pitch.toFixed(1)}°
      </div>
    </div>
  );
};

const Compass: React.FC<{ heading: number }> = ({ heading }) => {
  return (
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 bg-gray-800 rounded-full border-4 border-gray-600">
        <div 
          className="absolute inset-2 bg-gray-700 rounded-full flex items-center justify-center"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <div className="absolute top-1 w-0.5 h-4 bg-red-500" />
          <div className="text-white text-xs font-bold">N</div>
        </div>
      </div>
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
        {heading.toFixed(0)}°
      </div>
    </div>
  );
};

const Altimeter: React.FC<{ altitude: number }> = ({ altitude }) => {
  const needleAngle = (altitude % 1000) * 0.36; // 360 degrees per 1000m
  
  return (
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 bg-gray-800 rounded-full border-4 border-gray-600 flex items-center justify-center">
        <div 
          className="absolute w-0.5 h-12 bg-white origin-bottom"
          style={{ 
            transform: `rotate(${needleAngle}deg)`,
            bottom: '50%'
          }}
        />
        <div className="text-white text-center">
          <div className="text-lg font-bold">{altitude.toFixed(0)}</div>
          <div className="text-xs">ALT (m)</div>
        </div>
      </div>
    </div>
  );
};

const SpeedIndicator: React.FC<{ speed: number; label: string }> = ({ speed, label }) => {
  const needleAngle = Math.min(speed * 1.8, 180); // Max 100 units = 180 degrees
  
  return (
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 bg-gray-800 rounded-full border-4 border-gray-600 flex items-center justify-center">
        <div 
          className="absolute w-0.5 h-12 bg-green-400 origin-bottom"
          style={{ 
            transform: `rotate(${needleAngle - 90}deg)`,
            bottom: '50%'
          }}
        />
        <div className="text-white text-center">
          <div className="text-lg font-bold">{speed.toFixed(1)}</div>
          <div className="text-xs">{label}</div>
        </div>
      </div>
    </div>
  );
};

export const FlightInstruments: React.FC<FlightInstrumentsProps> = ({ telemetry }) => {
  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
        <Gauge className="mr-2" />
        Flight Instruments
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attitude Indicator */}
        <div className="flex flex-col items-center">
          <AttitudeIndicator 
            pitch={telemetry.attitude?.pitch || 0} 
            roll={telemetry.attitude?.roll || 0} 
          />
          <span className="text-white text-sm mt-2">Attitude</span>
          <span className="text-gray-400 text-xs">
            P: {(telemetry.attitude?.pitch || 0).toFixed(1)}° R: {(telemetry.attitude?.roll || 0).toFixed(1)}°
          </span>
        </div>

        {/* Compass */}
        <div className="flex flex-col items-center">
          <Compass heading={telemetry.navigation?.heading || 0} />
          <span className="text-white text-sm mt-2">Heading</span>
          <span className="text-gray-400 text-xs">
            {(telemetry.navigation?.heading || 0).toFixed(0)}°
          </span>
        </div>

        {/* Altimeter */}
        <div className="flex flex-col items-center">
          <Altimeter altitude={telemetry.position?.altitude || 0} />
          <span className="text-white text-sm mt-2">Altitude</span>
          <span className="text-gray-400 text-xs">
            GPS: {(telemetry.position?.altitude || 0).toFixed(1)}m
          </span>
        </div>

        {/* Ground Speed */}
        <div className="flex flex-col items-center">
          <SpeedIndicator speed={telemetry.navigation?.groundspeed || 0} label="GS (m/s)" />
          <span className="text-white text-sm mt-2">Ground Speed</span>
          <span className="text-gray-400 text-xs">
            Air: {(telemetry.navigation?.groundspeed || 0).toFixed(1)} m/s
          </span>
        </div>
      </div>

      {/* Additional telemetry data */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-white">
        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center justify-between">
            <Battery className={`h-5 w-5 ${
              (telemetry.battery?.level || 0) > 50 ? 'text-green-400' :
              (telemetry.battery?.level || 0) > 25 ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <span className="text-lg font-semibold">{(telemetry.battery?.level || 0).toFixed(1)}%</span>
          </div>
          <div className="text-sm text-gray-400">Battery</div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center justify-between">
            <Plane className={`h-5 w-5 ${telemetry.state?.armed ? 'text-red-400' : 'text-gray-400'}`} />
            <span className="text-lg font-semibold">{telemetry.state?.mode || 'UNKNOWN'}</span>
          </div>
          <div className="text-sm text-gray-400">Flight Mode</div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className={`w-3 h-3 rounded-full ${telemetry.navigation?.ekf_ok ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-lg font-semibold">{telemetry.navigation?.ekf_ok ? 'OK' : 'ERR'}</span>
          </div>
          <div className="text-sm text-gray-400">EKF Status</div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className={`w-3 h-3 rounded-full ${telemetry.navigation?.is_armable ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-lg font-semibold">{telemetry.navigation?.is_armable ? 'READY' : 'NOT READY'}</span>
          </div>
          <div className="text-sm text-gray-400">Arm Status</div>
        </div>
      </div>
    </div>
  );
};