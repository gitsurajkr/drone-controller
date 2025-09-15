import time

class TelemetryData:
    def __init__(self, vehicle):
        self.vehicle = vehicle

    def position(self):
        try:
            loc = self.vehicle.location.global_frame
            return {
                "latitude": loc.lat,
                "longitude": loc.lon,
                "altitude": loc.alt
            }
        except Exception as e:
            print(f"Position Error: {e}")
            return None

    def velocity(self):
        try:
            vx, vy, vz = self.vehicle.velocity
            return {"vx": vx, "vy": vy, "vz": vz}
        except Exception as e:
            print(f"Velocity Error: {e}")
            return None

    def attitude(self):
        try:
            att = self.vehicle.attitude
            return {"roll": att.roll, "pitch": att.pitch, "yaw": att.yaw}
        except Exception as e:
            print(f"Attitude Error: {e}")
            return None

    def state(self):
        try:
            return {
                "armed": self.vehicle.armed,
                "mode": self.vehicle.mode.name,
                "system_status": self.vehicle.system_status.state
            }
        except Exception as e:
            print(f"State Error: {e}")
            return None

    def battery_power(self):
        try:
            batt = self.vehicle.battery
            return {
                "voltage" : batt.voltage if batt.voltage is not None else 0.0,
                "current": batt.current if batt.current is not None else 0.0,
                "level": batt.level if batt.level is not None else -1
            }
        except Exception as e:
            print(f"Battery Error: {e}")
            return None

    def control(self):
        try:
            return {
                "armed": self.vehicle.armed,
                "mode": self.vehicle.mode.name,
                "system_status": self.vehicle.system_status.state,
                "channels": dict(self.vehicle.channels)  
            }
        except Exception as e:
            print(f"Control Error: {e}")
            return None

    def heartbeat(self):
        try:
            return {
                "last_heartbeat": self.vehicle.last_heartbeat,
                "armed": self.vehicle.armed
            }
        except Exception as e:
            print(f"Heartbeat Error: {e}")
            return None

    def navigation(self):
        try:
            gps = self.vehicle.gps_0
            return {
                "fix_type": gps.fix_type,
                "satellites_visible": gps.satellites_visible,
                "heading": self.vehicle.heading,
                "groundspeed": self.vehicle.groundspeed,
                "airspeed": self.vehicle.airspeed,
                "home_location": {
                    "lat": self.vehicle.home_location.lat if self.vehicle.home_location else None,
                    "lon": self.vehicle.home_location.lon if self.vehicle.home_location else None,
                    "alt": self.vehicle.home_location.alt if self.vehicle.home_location else None
                },
                "is_armable": self.vehicle.is_armable,
                "ekf_ok": self.vehicle.ekf_ok if hasattr(self.vehicle, 'ekf_ok') else True
            }
        except Exception as e:
            print(f"Navigation Error: {e}")
            return None

    def valid_flight_modes(self):
        try:
            return {"modes": list(self.vehicle.mode_mapping().keys())}
        except Exception as e:
            print(f"Flight Modes Error: {e}")
            return None

    def full_snapshot(self):
        """Return a complete snapshot"""
        return {
            "timestamp": time.time(),
            "position": self.position(),
            "velocity": self.velocity(),
            "attitude": self.attitude(),
            "state": self.state(),
            "battery": self.battery_power(),
            "control": self.control(),
            "heartbeat": self.heartbeat(),
            "navigation": self.navigation(),
            "valid_modes": self.valid_flight_modes()
        }
