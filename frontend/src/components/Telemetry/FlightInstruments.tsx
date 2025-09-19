// src/components/Telemetry/FlightInstruments.tsx
import React from 'react';
import { 
  Battery, 
  Activity, 
  Zap, 
  Shield, 
  Satellite,
  MapPin,
  Target,
  Signal,
  Home
} from 'lucide-react';
import type { TelemetryData } from '../../types';

interface FlightInstrumentsProps {
  telemetry: TelemetryData;
}

const FlightInstruments: React.FC<FlightInstrumentsProps> = ({ telemetry }) => {
  const formatValue = (value: number | undefined | null, decimals: number = 2, unit: string = '') => {
    if (value === undefined || value === null) return `--${unit}`;
    return `${value.toFixed(decimals)}${unit}`;
  };

  const formatCoordinate = (value: number | null | undefined, decimals: number = 6) => {
    if (value === null || value === undefined) return '--';
    return value.toFixed(decimals);
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-400';
    else if (level > 30) return 'text-yellow-400';
    else return 'text-red-400';
  };

  const getSignalColor = (satellites: number) => {
    if (satellites >= 6) return 'text-green-400';
    else if (satellites >= 3) return 'text-yellow-400';
    else return 'text-red-400';
  };

  const getEKFColor = (ekfOk: boolean) => {
    return ekfOk ? 'text-green-400' : 'text-red-400';
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

  const getGPSFixType = (fixType: number) => {
    switch (fixType) {
      case 0: return 'NO_FIX';
      case 1: return '2D_FIX';
      case 2: return '3D_FIX';
      case 3: return 'DGPS';
      case 4: return 'RTK_FIXED';
      case 5: return 'RTK_FLOAT';
      default: return 'UNKNOWN';
    }
  };

  const yaw = telemetry?.attitude?.yaw || 0;
  const direction = getDirectionFromYaw(yaw);
  const yawDegrees = ((yaw * 180 / Math.PI + 360) % 360).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6 h-full overflow-y-auto">
      {/* Flight Control Status */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <Activity className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ FLIGHT CONTROL
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">MODE:</span>
            <span className="text-yellow-400 font-bold font-mono">{telemetry?.state?.mode || 'UNKNOWN'}</span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">ARMED:</span>
            <span className={`font-bold font-mono ${telemetry?.state?.armed ? 'text-red-400' : 'text-green-400'}`}>
              {telemetry?.state?.armed ? 'ARMED' : 'DISARMED'}
            </span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">SYSTEM:</span>
            <span className="text-blue-400 font-bold font-mono">{telemetry?.state?.system_status || 'UNKNOWN'}</span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">ARMABLE:</span>
            <span className={`font-bold font-mono ${telemetry?.navigation?.is_armable ? 'text-green-400' : 'text-red-400'}`}>
              {telemetry?.navigation?.is_armable ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>

      {/* Attitude & Position */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <Target className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ ATTITUDE & POSITION
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">PITCH</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">
              {formatValue(telemetry?.attitude?.pitch ? telemetry.attitude.pitch * 180 / Math.PI : 0, 1, '°')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">ROLL</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">
                {formatValue(telemetry?.attitude?.roll ? telemetry.attitude.roll * 180 / Math.PI : 0, 1, '°')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10 col-span-2">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">HEADING</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">
              {direction} {yawDegrees}°
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">ALTITUDE</div>
            <div className="text-xl font-bold text-green-400 font-mono">
              {formatValue(telemetry?.position?.altitude, 2, 'm')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">VERT SPD</div>
            <div className="text-xl font-bold text-purple-400 font-mono">
              {formatValue(telemetry?.velocity?.vz, 2, 'm/s')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & GPS */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <Satellite className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ NAVIGATION
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">GPS FIX:</span>
            <span className={`font-bold font-mono ${getSignalColor(telemetry?.navigation?.satellites_visible || 0)}`}>
              {getGPSFixType(telemetry?.navigation?.fix_type || 0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">SATELLITES:</span>
            <span className={`font-bold font-mono ${getSignalColor(telemetry?.navigation?.satellites_visible || 0)}`}>
              {telemetry?.navigation?.satellites_visible || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">GROUND SPD:</span>
            <span className="text-green-400 font-bold font-mono">
              {formatValue(telemetry?.navigation?.groundspeed, 2, 'm/s')}
            </span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">AIRSPEED:</span>
            <span className="text-blue-400 font-bold font-mono">
              {formatValue(telemetry?.navigation?.airspeed, 2, 'm/s')}
            </span>
          </div>
        </div>
      </div>

      {/* EKF & System Health */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <Shield className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ SYSTEM HEALTH
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">EKF STATUS:</span>
            <span className={`font-bold font-mono ${getEKFColor(telemetry?.navigation?.ekf_ok || false)}`}>
              {telemetry?.navigation?.ekf_ok ? 'OK' : 'ERROR'}
            </span>
          </div>
          
          {telemetry?.navigation?.ekf_detailed && (
            <>
              <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                <span className="text-cyan-400/70 font-mono text-sm">CONST POS:</span>
                <span className={`font-bold font-mono ${telemetry.navigation.ekf_detailed.ekf_constposmode ? 'text-green-400' : 'text-gray-400'}`}>
                  {telemetry.navigation.ekf_detailed.ekf_constposmode ? 'YES' : 'NO'}
                </span>
              </div>
              
              <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                <span className="text-cyan-400/70 font-mono text-sm">POS HORIZ:</span>
                <span className={`font-bold font-mono ${telemetry.navigation.ekf_detailed.ekf_poshorizabs ? 'text-green-400' : 'text-gray-400'}`}>
                  {telemetry.navigation.ekf_detailed.ekf_poshorizabs ? 'ABS' : 'REL'}
                </span>
              </div>
              
              <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                <span className="text-cyan-400/70 font-mono text-sm">PRED POS:</span>
                <span className={`font-bold font-mono ${telemetry.navigation.ekf_detailed.ekf_predposhorizabs ? 'text-green-400' : 'text-gray-400'}`}>
                  {telemetry.navigation.ekf_detailed.ekf_predposhorizabs ? 'ABS' : 'REL'}
                </span>
              </div>
            </>
          )}
          
          <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <span className="text-cyan-400/70 font-mono text-sm">CONNECTION:</span>
            <span className={`font-bold font-mono ${
              telemetry?.connection_status === 'CONNECTED' ? 'text-green-400' : 
              telemetry?.connection_status === 'LOCK_TIMEOUT' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {telemetry?.connection_status || 'UNKNOWN'}
            </span>
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
            <div className="text-xl font-bold text-yellow-400 font-mono">
              {formatValue(telemetry?.battery?.voltage, 2, 'V')}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">CURRENT</div>
            <div className="text-xl font-bold text-orange-400 font-mono">
              {formatValue(telemetry?.battery?.current, 2, 'A')}
            </div>
          </div>
        </div>
      </div>

      {/* Position & Home */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
          <MapPin className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
          ◄ POSITION DATA
        </h3>
        
        <div className="space-y-4">
          <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">LATITUDE</div>
            <div className="text-sm font-mono text-white">
              {formatCoordinate(telemetry?.position?.latitude)}
            </div>
          </div>
          
          <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
            <div className="text-xs text-cyan-400/70 mb-2 font-mono">LONGITUDE</div>
            <div className="text-sm font-mono text-white">
              {formatCoordinate(telemetry?.position?.longitude)}
            </div>
          </div>
          
          {telemetry?.navigation?.home_location && (
            <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
              <div className="flex items-center gap-2 mb-2">
                <Home className="h-4 w-4 text-cyan-400" />
                <div className="text-xs text-cyan-400/70 font-mono">HOME LOCATION</div>
              </div>
              <div className="text-xs font-mono text-gray-300">
                <div>LAT: {formatCoordinate(telemetry.navigation.home_location.lat, 6)}</div>
                <div>LON: {formatCoordinate(telemetry.navigation.home_location.lon, 6)}</div>
                <div>ALT: {formatValue(telemetry.navigation.home_location.alt, 2, 'm')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heartbeat & Channels */}
      {(telemetry?.heartbeat || telemetry?.control?.channels) && (
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
          <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center font-mono">
            <Signal className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
            ◄ SYSTEM STATUS
          </h3>
          
          <div className="space-y-4">
            {telemetry?.heartbeat && (
              <div className="flex justify-between items-center bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                <span className="text-cyan-400/70 font-mono text-sm">HEARTBEAT:</span>
                <span className="text-green-400 font-bold font-mono">
                  {telemetry.heartbeat.last_heartbeat ? 
                    new Date(telemetry.heartbeat.last_heartbeat * 1000).toLocaleTimeString() : 
                    'NO DATA'
                  }
                </span>
              </div>
            )}
            
            {telemetry?.control?.channels && Object.keys(telemetry.control.channels).length > 0 && (
              <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                <div className="text-xs text-cyan-400/70 mb-2 font-mono">RC CHANNELS</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(telemetry.control.channels).slice(0, 8).map(([channel, value]) => (
                    <div key={channel} className="flex justify-between">
                      <span className="text-gray-400">CH{channel}:</span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {telemetry?.valid_modes && (
              <div className="bg-gray-800/60 rounded-lg p-3 border border-cyan-400/10">
                <div className="text-xs text-cyan-400/70 mb-2 font-mono">AVAILABLE MODES</div>
                <div className="flex flex-wrap gap-1">
                  {telemetry.valid_modes.modes.slice(0, 6).map((mode) => (
                    <span key={mode} className="px-2 py-1 text-xs bg-cyan-400/20 text-cyan-400 rounded">
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightInstruments;
