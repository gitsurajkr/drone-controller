// src/components/Telemetry/FlightInstruments.tsx
import React from 'react';
import { Battery, Activity, Navigation, Zap } from 'lucide-react';
import type { TelemetryData } from '../../types';

interface FlightInstrumentsProps {
  telemetry: TelemetryData;
}

const FlightInstruments: React.FC<FlightInstrumentsProps> = ({ telemetry }) => {
  const formatValue = (value: number | undefined | null, decimals: number = 2, unit: string = '') => {
    if (value === undefined || value === null) return `--${unit}`;
    return `${value.toFixed(decimals)}${unit}`;
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-400';
    else if (level > 30) return 'text-yellow-400';
    else return 'text-red-400';
  };

  const getDirectionFromYaw = (yaw: number) => {
    const degrees = (yaw * 180 / Math.PI + 360) % 360;
    
    if (degrees >= 337.5 || degrees < 22.5) return 'N';
    else if (degrees >= 22.5 && degrees < 67.5) return 'NE';
    else if (degrees >= 67.5 && degrees < 112.5) return 'E';
    else if (degrees >= 112.5 && degrees < 157.5) return 'SE';
    else if (degrees >= 157.5 && degrees < 202.5) return 'S';
    else if (degrees >= 202.5 && degrees < 247.5) return 'SW';
    else if (degrees >= 247.5 && degrees < 292.5) return 'W';
    else return 'NW';
  };

  const yaw = telemetry?.attitude?.yaw || 0;
  const direction = getDirectionFromYaw(yaw);
  const yawDegrees = ((yaw * 180 / Math.PI + 360) % 360).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Flight Status */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <Activity className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ FLIGHT STATUS
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">PITCH</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">
              {formatValue(telemetry?.attitude?.pitch, 1, '°')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">ROLL</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">
              {formatValue(telemetry?.attitude?.roll, 1, '°')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">ALTITUDE</div>
            <div className="text-2xl font-bold text-green-400 font-mono">
              {formatValue(telemetry?.position?.altitude, 2, 'm')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">VERTICAL SPD</div>
            <div className="text-2xl font-bold text-purple-400 font-mono">
              {formatValue(telemetry?.velocity?.vz, 2, 'm/s')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <Navigation className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ NAVIGATION
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">HEADING</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono">
              {direction} {yawDegrees}°
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">GROUND SPD</div>
            <div className="text-2xl font-bold text-green-400 font-mono">
              {formatValue(telemetry?.navigation?.groundspeed, 2, 'm/s')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">AIRSPEED</div>
            <div className="text-2xl font-bold text-blue-400 font-mono">
              {formatValue(telemetry?.navigation?.airspeed, 2, 'm/s')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">SATELLITES</div>
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              {telemetry?.navigation?.satellites_visible || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Velocity Vector */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <Zap className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ VELOCITY VECTOR
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/60 rounded-lg p-4 text-center border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">VX</div>
            <div className="text-xl font-bold text-purple-400 font-mono">
              {formatValue(telemetry?.velocity?.vx, 2)}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 text-center border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">VY</div>
            <div className="text-xl font-bold text-purple-400 font-mono">
              {formatValue(telemetry?.velocity?.vy, 2)}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 text-center border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">VZ</div>
            <div className="text-xl font-bold text-purple-400 font-mono">
              {formatValue(telemetry?.velocity?.vz, 2)}
            </div>
          </div>
        </div>
      </div>

      {/* Power System */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <Battery className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ POWER CORE
        </h3>
        
        {/* Battery Level Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-cyan-400/70 font-mono">ENERGY LEVEL</span>
            <span className={`font-bold font-mono ${getBatteryColor(telemetry?.battery?.level || 0)}`}>
              {telemetry?.battery?.level || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 border border-cyan-400/20 overflow-hidden">
            <div 
              className={`h-4 transition-all duration-300 ${
                (telemetry?.battery?.level || 0) > 60 ? 'bg-green-400' :
                (telemetry?.battery?.level || 0) > 30 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ 
                width: `${telemetry?.battery?.level || 0}%`,
                filter: "drop-shadow(0 0 8px currentColor)"
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">VOLTAGE</div>
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              {formatValue(telemetry?.battery?.voltage, 2, 'V')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">CURRENT</div>
            <div className="text-2xl font-bold text-orange-400 font-mono">
              {formatValue(telemetry?.battery?.current, 2, 'A')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightInstruments;
