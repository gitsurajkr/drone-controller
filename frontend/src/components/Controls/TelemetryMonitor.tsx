// src/components/Controls/TelemetryMonitor.tsx
import React from 'react';
import { 
  Battery, 
  MapPin,
  Activity,
  Compass,
  Plane,
  Target,
  Shield,
  Zap
} from 'lucide-react';
import type { TelemetryData } from '../../types';

interface TelemetryMonitorProps {
  telemetry: TelemetryData;
}

export const TelemetryMonitor: React.FC<TelemetryMonitorProps> = ({ telemetry }) => {
  // const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Format coordinate values
  const formatCoordinate = (value: number, decimals: number = 6) => {
    return value ? value.toFixed(decimals) : '0.000000';
  };

  // Format numeric values
  const formatValue = (value: number | undefined | null, decimals: number = 2, unit: string = '') => {
    if (value === undefined || value === null) return `--${unit}`;
    return `${value.toFixed(decimals)}${unit}`;
  };

  // Get direction from yaw (in radians)
  const getDirectionFromYaw = (yaw: number) => {
    // Convert radians to degrees
    const degrees = (yaw * 180 / Math.PI + 360) % 360;
    
    // Determine cardinal direction
    if (degrees >= 337.5 || degrees < 22.5) return 'N';
    else if (degrees >= 22.5 && degrees < 67.5) return 'NE';
    else if (degrees >= 67.5 && degrees < 112.5) return 'E';
    else if (degrees >= 112.5 && degrees < 157.5) return 'SE';
    else if (degrees >= 157.5 && degrees < 202.5) return 'S';
    else if (degrees >= 202.5 && degrees < 247.5) return 'SW';
    else if (degrees >= 247.5 && degrees < 292.5) return 'W';
    else return 'NW';
  };

  // Get battery status color
  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-400';
    else if (level > 30) return 'text-yellow-400';
    else return 'text-red-400';
  };

  // Get signal strength color
  const getSignalColor = (satellites: number) => {
    if (satellites >= 6) return 'text-green-400';
    else if (satellites >= 3) return 'text-yellow-400';
    else return 'text-red-400';
  };

  // // Mock connect/disconnect function
  // const handleConnection = () => {
  //   if (connectionStatus === 'disconnected') {
  //     setConnectionStatus('connecting');
  //     setTimeout(() => {
  //       setConnectionStatus('connected');
  //     }, 2000);
  //   } else {
  //     setConnectionStatus('disconnected');
  //   }
  // };+

  // useEffect(() => {
  //   // Update connection status based on telemetry
  //   if (telemetry?.connection_status === 'CONNECTED' || telemetry?.connection_status === 'LOCK_TIMEOUT') {
  //     setConnectionStatus('connected');
  //   }
  // }, [telemetry]);

  const yaw = telemetry?.attitude?.yaw || 0;
  const direction = getDirectionFromYaw(yaw);
  const yawDegrees = ((yaw * 180 / Math.PI + 360) % 360).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(6,182,212,0.03)_50%,transparent_51%)] bg-[length:20px_20px]" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse" />
      </div>

      {/* Header */}
      <div className="relative bg-gray-900/80 backdrop-blur-sm border-b-2 border-cyan-400/30 px-6 py-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Plane className="h-8 w-8 text-cyan-400" style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <h1 className="text-2xl font-bold text-white font-mono tracking-wider">
              ► TACTICAL COMMAND CENTER
            </h1>
          </div>
        </div>
      </div>

      <div className="flex h-screen relative">
        <div className="w-3/5 relative bg-gray-900/50 backdrop-blur-sm border-r-2 border-cyan-400/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-cyan-400/30 shadow-2xl">
              <div className="relative mb-6">
                <MapPin className="h-16 w-16 text-cyan-400 mx-auto" style={{ filter: "drop-shadow(0 0 12px #06b6d4)" }} />
                <Target className="h-8 w-8 text-purple-400 absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 font-mono">TACTICAL MAP</h2>
              <p className="text-cyan-400/70 mb-6">Satellite integration online...</p>
              <div className="p-6 bg-gray-800/80 rounded-lg border border-cyan-400/20 shadow-inner">
                <div className="text-sm text-cyan-400 font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-cyan-400/70">TARGET COORDS:</span>
                  </div>
                  <div className="bg-gray-900/60 p-3 rounded border border-cyan-400/20">
                    <p className="text-green-400">LAT: {formatCoordinate(telemetry?.position?.latitude || 0)}</p>
                    <p className="text-green-400">LON: {formatCoordinate(telemetry?.position?.longitude || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Crosshair Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-cyan-400/30">
              <div className="w-px h-20 bg-cyan-400/30 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-10" />
              <div className="w-20 h-px bg-cyan-400/30 absolute left-1/2 top-1/2 transform -translate-x-10 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Telemetry Panel - 40% */}
        <div className="w-2/5 bg-gray-950/90 backdrop-blur-sm overflow-y-auto relative">
          <div className="p-6 space-y-6">
            
            {/* Flight Status */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center font-mono">
                <Activity className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
                ◄ FLIGHT STATUS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">ALTITUDE</div>
                  <div className="text-2xl font-bold text-green-400 font-mono">{formatValue(telemetry?.position?.altitude, 2, 'm')}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">VERTICAL SPD</div>
                  <div className="text-2xl font-bold text-purple-400 font-mono">{formatValue(telemetry?.velocity?.vz, 2, 'm/s')}</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center font-mono">
                <Compass className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
                ◄ NAVIGATION
              </h3>
              
              {/* Compass Heading */}
              <div className="mb-4 text-center">
                <div className="inline-block bg-gray-800/80 rounded-full p-6 mb-2 border border-cyan-400/20 shadow-inner relative">
                  <div className="text-3xl font-bold text-cyan-400 font-mono">{direction}</div>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                </div>
                <div className="text-sm text-cyan-400/70 font-mono">HEADING: {yawDegrees}°</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">GROUND SPD</div>
                  <div className="text-2xl font-bold text-green-400 font-mono">{formatValue(telemetry?.navigation?.groundspeed, 2, 'm/s')}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">SATELLITES</div>
                  <div className={`text-2xl font-bold font-mono ${getSignalColor(telemetry?.navigation?.satellites_visible || 0)}`}>
                    {telemetry?.navigation?.satellites_visible || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Battery System */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center font-mono">
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
                  <div className="text-2xl font-bold text-yellow-400 font-mono">{formatValue(telemetry?.battery?.voltage, 2, 'V')}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">CURRENT</div>
                  <div className="text-2xl font-bold text-orange-400 font-mono">{formatValue(telemetry?.battery?.current, 2, 'A')}</div>
                </div>
              </div>
            </div>

            {/* Position Data */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center font-mono">
                <Target className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
                ◄ COORDINATES
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">LATITUDE</div>
                  <div className="text-lg font-mono text-green-400">{formatCoordinate(telemetry?.position?.latitude || 0)}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-4 border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">LONGITUDE</div>
                  <div className="text-lg font-mono text-green-400">{formatCoordinate(telemetry?.position?.longitude || 0)}</div>
                </div>
              </div>
            </div>

            {/* Speed & Motion */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center font-mono">
                <Zap className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
                ◄ VELOCITY VECTOR
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800/60 rounded-lg p-4 text-center border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">VX</div>
                  <div className="text-lg font-bold text-purple-400 font-mono">{formatValue(telemetry?.velocity?.vx, 2)}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-4 text-center border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">VY</div>
                  <div className="text-lg font-bold text-purple-400 font-mono">{formatValue(telemetry?.velocity?.vy, 2)}</div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-4 text-center border border-cyan-400/10">
                  <div className="text-xs text-cyan-400/70 mb-2 font-mono">VZ</div>
                  <div className="text-lg font-bold text-purple-400 font-mono">{formatValue(telemetry?.velocity?.vz, 2)}</div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/20 shadow-2xl">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center font-mono">
                <Shield className="h-5 w-5 mr-2" style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
                ◄ SYSTEM STATUS
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800/60 rounded-lg border border-cyan-400/10">
                  <span className="text-cyan-400/70 font-mono">MODE</span>
                  <span className="font-bold text-cyan-400 font-mono">{telemetry?.state?.mode || 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/60 rounded-lg border border-cyan-400/10">
                  <span className="text-cyan-400/70 font-mono">ARMED</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${telemetry?.state?.armed ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} 
                         style={{ filter: `drop-shadow(0 0 4px ${telemetry?.state?.armed ? '#f87171' : '#4ade80'})` }} />
                    <span className={`font-bold font-mono ${telemetry?.state?.armed ? 'text-red-400' : 'text-green-400'}`}>
                      {telemetry?.state?.armed ? 'ARMED' : 'DISARMED'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/60 rounded-lg border border-cyan-400/10">
                  <span className="text-cyan-400/70 font-mono">EKF STATUS</span>
                  <span className={`font-bold font-mono ${telemetry?.navigation?.ekf_ok ? 'text-green-400' : 'text-red-400'}`}>
                    {telemetry?.navigation?.ekf_ok ? 'OK' : 'NOT OK'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export const FlightControls = TelemetryMonitor;
