// src/types/index.ts
export interface TelemetryData {
  timestamp?: number;
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  velocity?: {
    vx: number;
    vy: number;
    vz: number;
  };
  attitude?: {
    roll: number;
    pitch: number;
    yaw: number;
  };
  state?: {
    armed: boolean;
    mode: string;
    system_status: string;
  };
  battery?: {
    voltage: number;
    current: number;
    level: number;
  };
  control?: {
    armed: boolean;
    mode: string;
    system_status: string;
    channels: Record<string, number>;
  };
  heartbeat?: {
    last_heartbeat: number | null;
    armed: boolean;
  };
  navigation?: {
    fix_type: number;
    satellites_visible: number;
    heading: number;
    groundspeed: number;
    airspeed: number;
    home_location?: {
      lat: number | null;
      lon: number | null;
      alt: number | null;
    };
    is_armable: boolean;
    ekf_ok: boolean;
  };
  valid_modes?: {
    modes: string[];
  };
  connection_status?: string;
}

export interface Waypoint {
  id: string;
  lat: number;
  lon: number;
  alt: number;
  command: string;
  param1?: number;
  param2?: number;
  param3?: number;
  param4?: number;
  autocontinue?: boolean;
}

export interface Mission {
  id: string;
  name: string;
  waypoints: Waypoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DroneStatus {
  connected: boolean;
  armed: boolean;
  mode: string;
  battery: number;
  gps_fix: boolean;
  satellites: number;
}

export interface FlightMode {
  id: string;
  name: string;
  description: string;
  available: boolean;
}