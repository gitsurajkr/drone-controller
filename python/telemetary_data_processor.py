import logging
import math

class TelementaryDataProcessor:
    def __init__(self, telemetry_data, logger=None):
        self.telemetry_data = telemetry_data
        self.logger = logger or logging.getLogger(__name__)

    def process_position(self, msg):
        try:
            self.telemetry_data.position['lat'] = getattr(msg, 'lat', None)
            if self.telemetry_data.position['lat'] is not None:
                self.telemetry_data.position['lat'] /= 1e7
            self.telemetry_data.position['lon'] = getattr(msg, 'lon', None)
            if self.telemetry_data.position['lon'] is not None:
                self.telemetry_data.position['lon'] /= 1e7
            self.telemetry_data.position['alt'] = getattr(msg, 'alt', None)
            if self.telemetry_data.position['alt'] is not None:
                self.telemetry_data.position['alt'] /= 1000.0
            self.telemetry_data.timestamp = getattr(msg, 'time_boot_ms', None)
            return self.telemetry_data.position
        except Exception as e:
            self.logger.error(f"Position processing error: {e}")
            return None
    
    def process_velocity(self, msg):
        try:
            self.telemetry_data.velocity['vx'] = getattr(msg, 'vx', None)
            if self.telemetry_data.velocity['vx'] is not None:
                self.telemetry_data.velocity['vx'] /= 100.0
            self.telemetry_data.velocity['vy'] = getattr(msg, 'vy', None)
            if self.telemetry_data.velocity['vy'] is not None:
                self.telemetry_data.velocity['vy'] /= 100.0
            self.telemetry_data.velocity['vz'] = getattr(msg, 'vz', None)
            if self.telemetry_data.velocity['vz'] is not None:
                self.telemetry_data.velocity['vz'] /= 100.0
            self.telemetry_data.timestamp = getattr(msg, 'time_boot_ms', None)
            return self.telemetry_data.velocity
        except Exception as e:
            self.logger.error(f"Velocity processing error: {e}")
            return None

    def process_altitude(self, msg):
        try:
            self.telemetry_data.altitude['roll'] = getattr(msg, 'roll', None)
            self.telemetry_data.altitude['pitch'] = getattr(msg, 'pitch', None)
            self.telemetry_data.altitude['yaw'] = getattr(msg, 'yaw', None)
            self.telemetry_data.timestamp = getattr(msg, 'time_boot_ms', None)
            return self.telemetry_data.altitude
        except Exception as e:
            self.logger.error(f"Altitude processing error: {e}")
            return None
    
    def process_power(self, msg):
        try:
            self.telemetry_data.battery['voltage'] = getattr(msg, 'voltage_battery', None)
            if self.telemetry_data.battery['voltage'] is not None:
                self.telemetry_data.battery['voltage'] /= 1000.0
            self.telemetry_data.battery['current'] = getattr(msg, 'current', None)
            if self.telemetry_data.battery['current'] is not None:
                self.telemetry_data.battery['current'] /= 100.0
            self.telemetry_data.battery['level'] = getattr(msg, 'battery_remaining', None)
            self.telemetry_data.timestamp = getattr(msg, 'time_boot_ms', None)
            return self.telemetry_data.battery
        except Exception as e:
            self.logger.error(f"Power processing error: {e}")
            return None
    
    def process_state(self, msg):
        try:
            self.telemetry_data.state['armed'] = getattr(msg, 'armed', None)
            self.telemetry_data.state['mode'] = getattr(msg, 'mode', None)
            self.telemetry_data.state['system_status'] = getattr(msg, 'system_status', None)
            self.telemetry_data.timestamp = getattr(msg, 'time_boot_ms', None)
            return self.telemetry_data.state
        except Exception as e:
            self.logger.error(f"State processing error: {e}")
            return None
    
    def navigation_status(self, msg):
        try:
            heading = getattr(msg, 'heading', None)
            if heading is not None:
                # centidegrees → degrees
                self.telemetry_data.nav_status['heading'] = (heading / 100.0) % 360
            else:
                self.telemetry_data.nav_status['heading'] = None

            self.telemetry_data.nav_status['fix_type'] = getattr(msg, 'fix_type', None)
            self.telemetry_data.nav_status['satellites_visible'] = getattr(msg, 'satellites_visible', None)

            groundspeed = getattr(msg, 'groundspeed', None)
            if groundspeed is not None:
                # If already m/s, don’t divide; if cm/s, divide
                self.telemetry_data.nav_status['groundspeed'] = groundspeed / 100.0 if groundspeed > 50 else groundspeed
            else:
                self.telemetry_data.nav_status['groundspeed'] = None

            airspeed = getattr(msg, 'airspeed', None)
            if airspeed is not None:
                self.telemetry_data.nav_status['airspeed'] = airspeed / 100.0 if airspeed > 50 else airspeed
            else:
                self.telemetry_data.nav_status['airspeed'] = None

            self.telemetry_data.timestamp = getattr(msg, 'time_boot_ms', None)
            return self.telemetry_data.nav_status
        except Exception as e:
            self.logger.error(f"Navigation status processing error: {e}")
            return None
