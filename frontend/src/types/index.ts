// src/types/index.ts
export interface TelemetryData {
  timestamp?: number;
  connection_status?: string;
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
    ekf_detailed?: {
      ekf_ok: boolean;
      ekf_constposmode: boolean;
      ekf_poshorizabs: boolean;
      ekf_predposhorizabs: boolean;
    };
  };
  valid_modes?: {
    modes: string[];
  };
}

export interface HealthData {
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  uptime?: number;
  timestamp?: string;
  drone?: {
    connected: boolean;
    connection_state: string;
  };
  cache?: {
    total_entries: number;
    oldest_entry_age_ms: number;
    newest_entry_age_ms: number;
    cache_size_estimate_kb: number;
    current_size: number;
    max_size: number;
  };
}

export interface TelemetryHistory {
  entries: {
    timestamp: number;
    data: TelemetryData;
  }[];
  total: number;
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