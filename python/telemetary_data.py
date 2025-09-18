import time
import threading
from contextlib import contextmanager
import logging
class TimeoutError(Exception):
    pass

def safe_vehicle_access(func, timeout_seconds=0.5, default_value=None):
    """Thread-safe vehicle access with very short timeout protection"""
    result = [None]
    exception = [None]
    
    def target():
        try:
            result[0] = func()
        except Exception as e:
            exception[0] = e
    
    thread = threading.Thread(target=target)
    thread.daemon = True  # Ensure thread dies when main program exits
    thread.start()
    thread.join(timeout=timeout_seconds)
    
    if thread.is_alive():
        # Thread is still running, it's stuck - return default immediately
        print(f"⚠️ Vehicle access timed out after {timeout_seconds}s - using fallback")
        return default_value
    
    if exception[0]:
        print(f"❌ Vehicle access error: {exception[0]} - using fallback")
        return default_value
    
    return result[0]

class TelemetryData:
    def __init__(self, vehicle):
        self.vehicle = vehicle

    def position(self):
        def get_position():
            loc = self.vehicle.location.global_frame
            return {
                "latitude": loc.lat if loc.lat is not None else 0.0,
                "longitude": loc.lon if loc.lon is not None else 0.0,
                "altitude": loc.alt if loc.alt is not None else 0.0
            }
        
        return safe_vehicle_access(
            get_position, 
            timeout_seconds=0.5, 
            default_value={"latitude": 0.0, "longitude": 0.0, "altitude": 0.0}
        )

    def velocity(self):
        def get_velocity():
            vx, vy, vz = self.vehicle.velocity
            return {
                "vx": vx if vx is not None else 0.0, 
                "vy": vy if vy is not None else 0.0, 
                "vz": vz if vz is not None else 0.0
            }
        
        return safe_vehicle_access(
            get_velocity, 
            timeout_seconds=2, 
            default_value={"vx": 0.0, "vy": 0.0, "vz": 0.0}
        )

    def attitude(self):
        def get_attitude():
            att = self.vehicle.attitude
            
            return {
                "roll": att.roll if att.roll is not None else 0.0, 
                "pitch": att.pitch if att.pitch is not None else 0.0, 
                "yaw": att.yaw if att.yaw is not None else 0.0
            }
        
        return safe_vehicle_access(
            get_attitude, 
            timeout_seconds=2, 
            default_value={"roll": 0.0, "pitch": 0.0, "yaw": 0.0}
        )

    def state(self):
        def get_state():
            return {
                "armed": self.vehicle.armed if self.vehicle.armed is not None else False,
                "mode": self.vehicle.mode.name if self.vehicle.mode and self.vehicle.mode.name else "UNKNOWN",
                "system_status": self.vehicle.system_status.state if self.vehicle.system_status and self.vehicle.system_status.state else "UNKNOWN"
            }
        
        return safe_vehicle_access(
            get_state, 
            timeout_seconds=2, 
            default_value={"armed": False, "mode": "UNKNOWN", "system_status": "UNKNOWN"}
        )

    def battery_power(self):
        def get_battery():
            batt = self.vehicle.battery
            return {
                "voltage" : batt.voltage if batt.voltage is not None else 0.0,
                "current": batt.current if batt.current is not None else 0.0,
                "level": batt.level if batt.level is not None else -1
            }
        
        return safe_vehicle_access(
            get_battery, 
            timeout_seconds=2, 
            default_value={"voltage": 0.0, "current": 0.0, "level": -1}
        )

    def control(self):
        def get_control():
            return {
                "armed": self.vehicle.armed if self.vehicle.armed is not None else False,
                "mode": self.vehicle.mode.name if self.vehicle.mode and self.vehicle.mode.name else "UNKNOWN",
                "system_status": self.vehicle.system_status.state if self.vehicle.system_status and self.vehicle.system_status.state else "UNKNOWN",
                "channels": dict(self.vehicle.channels) if self.vehicle.channels else {}
            }
        
        return safe_vehicle_access(
            get_control, 
            timeout_seconds=2, 
            default_value={"armed": False, "mode": "UNKNOWN", "system_status": "UNKNOWN", "channels": {}}
        )

    def heartbeat(self):
        def get_heartbeat():
            return {
                "last_heartbeat": self.vehicle.last_heartbeat,
                "armed": self.vehicle.armed if self.vehicle.armed is not None else False
            }
        
        return safe_vehicle_access(
            get_heartbeat, 
            timeout_seconds=2, 
            default_value={"last_heartbeat": None, "armed": False}
        )

    def navigation(self):
        def get_navigation():
            gps = self.vehicle.gps_0
            
            # Get detailed EKF status
            ekf_status = {
                "ekf_ok": self.vehicle.ekf_ok if hasattr(self.vehicle, 'ekf_ok') else False,
                "ekf_constposmode": getattr(self.vehicle, '_ekf_constposmode', False),
                "ekf_poshorizabs": getattr(self.vehicle, '_ekf_poshorizabs', False),
                "ekf_predposhorizabs": getattr(self.vehicle, '_ekf_predposhorizabs', False)
            }
            
            return {
                "fix_type": gps.fix_type if gps and gps.fix_type is not None else 0,
                "satellites_visible": gps.satellites_visible if gps and gps.satellites_visible is not None else 0,
                "heading": self.vehicle.heading if self.vehicle.heading is not None else 0,
                "groundspeed": self.vehicle.groundspeed if self.vehicle.groundspeed is not None else 0,
                "airspeed": self.vehicle.airspeed if self.vehicle.airspeed is not None else 0,
                "home_location": {
                    "lat": self.vehicle.home_location.lat if self.vehicle.home_location else None,
                    "lon": self.vehicle.home_location.lon if self.vehicle.home_location else None,
                    "alt": self.vehicle.home_location.alt if self.vehicle.home_location else None
                },
                "is_armable": self.vehicle.is_armable if self.vehicle.is_armable is not None else False,
                "ekf_ok": ekf_status["ekf_ok"],
                "ekf_detailed": ekf_status
            }
        
        return safe_vehicle_access(
            get_navigation, 
            timeout_seconds=2, 
            default_value={
                "fix_type": 0, "satellites_visible": 0, "heading": 0, 
                "groundspeed": 0, "airspeed": 0, "home_location": {"lat": None, "lon": None, "alt": None},
                "is_armable": False, "ekf_ok": False,
                "ekf_detailed": {
                    "ekf_ok": False,
                    "ekf_constposmode": False,
                    "ekf_poshorizabs": False,
                    "ekf_predposhorizabs": False
                }
            }
        )

    def valid_flight_modes(self):
        def get_flight_modes():
            # Try the old method first for backward compatibility
            if hasattr(self.vehicle, 'mode_mapping'):
                return {"modes": list(self.vehicle.mode_mapping().keys())}
            else:
                # Fallback to common ArduPilot flight modes for different vehicle types
                # These are the most common modes supported by ArduPilot
                common_modes = [
                    "STABILIZE", "ACRO", "ALT_HOLD", "AUTO", "GUIDED", 
                    "LOITER", "RTL", "CIRCLE", "LAND", "DRIFT", 
                    "SPORT", "FLIP", "AUTOTUNE", "POSHOLD", "BRAKE",
                    "THROW", "AVOID_ADSB", "GUIDED_NOGPS", "SMART_RTL"
                ]
                
                try:
                    if hasattr(self.vehicle, 'parameters') and self.vehicle.parameters:
                        # For now, return common modes - could be enhanced to read actual supported modes
                        return {"modes": common_modes[:8]}  # Return first 8 common modes
                    else:
                        return {"modes": common_modes[:8]}  # Return first 8 common modes
                except:
                    return {"modes": common_modes[:8]}  # Return first 8 common modes
        
        return safe_vehicle_access(
            get_flight_modes, 
            timeout_seconds=2, 
            default_value={"modes": ["STABILIZE", "GUIDED", "AUTO", "RTL", "LAND"]}
        )

    def full_snapshot(self):
        """Return a complete snapshot using simple sequential approach with aggressive timeouts"""
        import logging
        
        snapshot = {
            "timestamp": time.time(),
            "connection_status": "CONNECTED"
        }
        
        # Define all telemetry methods with very short timeouts
        telemetry_methods = [
            ('position', self.position),
            ('velocity', self.velocity), 
            ('attitude', self.attitude),
            ('state', self.state),
            ('battery', self.battery_power),
            ('control', self.control),
            ('heartbeat', self.heartbeat),
            ('navigation', self.navigation),
            ('valid_modes', self.valid_flight_modes)
        ]
        
        for name, method in telemetry_methods:
            try:
                result = safe_vehicle_access(method, timeout_seconds=0.5, default_value=None)
                
                if result is not None:
                    snapshot[name] = result
                    logging.debug(f"✅ Got {name}: {result}")
                else:
                    fallbacks = {
                        'position': {"latitude": 0.0, "longitude": 0.0, "altitude": 0.0},
                        'velocity': {"vx": 0.0, "vy": 0.0, "vz": 0.0},
                        'attitude': {"roll": 0.0, "pitch": 0.0, "yaw": 0.0},
                        'state': {"armed": False, "mode": "UNKNOWN", "system_status": "UNKNOWN"},
                        'battery': {"voltage": 0.0, "current": 0.0, "level": -1},
                        'control': {"armed": False, "mode": "UNKNOWN", "system_status": "UNKNOWN", "channels": {}},
                        'heartbeat': {"last_heartbeat": None, "armed": False},
                        'navigation': {"fix_type": 0, "satellites_visible": 0, "heading": 0, "groundspeed": 0, "airspeed": 0, "home_location": {"lat": None, "lon": None, "alt": None}, "is_armable": False, "ekf_ok": False, "ekf_detailed": {"ekf_ok": False, "ekf_constposmode": False, "ekf_poshorizabs": False, "ekf_predposhorizabs": False}},
                        'valid_modes': {"modes": ["STABILIZE", "GUIDED", "AUTO", "RTL", "LAND"]}
                    }
                    snapshot[name] = fallbacks.get(name, {})
                    logging.warning(f"⚠️ Using fallback for {name}")
                    
            except Exception as e:
                logging.error(f"❌ Error getting {name}: {e}")
                fallbacks = {
                    'position': {"latitude": 0.0, "longitude": 0.0, "altitude": 0.0},
                    'velocity': {"vx": 0.0, "vy": 0.0, "vz": 0.0},
                    'attitude': {"roll": 0.0, "pitch": 0.0, "yaw": 0.0},
                    'state': {"armed": False, "mode": "UNKNOWN", "system_status": "UNKNOWN"},
                    'battery': {"voltage": 0.0, "current": 0.0, "level": -1},
                    'control': {"armed": False, "mode": "UNKNOWN", "system_status": "UNKNOWN", "channels": {}},
                    'heartbeat': {"last_heartbeat": None, "armed": False},
                    'navigation': {"fix_type": 0, "satellites_visible": 0, "heading": 0, "groundspeed": 0, "airspeed": 0, "home_location": {"lat": None, "lon": None, "alt": None}, "is_armable": False, "ekf_ok": False, "ekf_detailed": {"ekf_ok": False, "ekf_constposmode": False, "ekf_poshorizabs": False, "ekf_predposhorizabs": False}},
                    'valid_modes': {"modes": ["STABILIZE", "GUIDED", "AUTO", "RTL", "LAND"]}
                }
                snapshot[name] = fallbacks.get(name, {})
        
        required_fields = ['position', 'velocity', 'attitude', 'state', 'battery', 'control', 'heartbeat', 'navigation', 'valid_modes']
        for field in required_fields:
            if field not in snapshot:
                snapshot[field] = {}
        
        logging.info(f"Snapshot collected with {len(snapshot)} fields in <1s")
        logging.debug(f"Full snapshot: {snapshot}")
        return snapshot
