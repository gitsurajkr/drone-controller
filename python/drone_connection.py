# drone_connection.py
import time
import threading
import logging
import random
from datetime import datetime, timedelta
from dronekit import connect
from telemetary_data import TelemetryData
from circuit_breaker import CircuitBreaker, circuit_breaker_registry

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


class DroneConnection:
    def __init__(self, reconnect_interval=5, max_retry_attempts=5, max_cache_size=100, cache_ttl=300):
        self.vehicle = None
        self.is_connected = False
        self.is_arm = False
        self.mode = None
        self.state = None
        self.current_heartbeat = None
        self.monitoring = False
        self.thread = None
        self.telemetry = None

        # Enhanced telemetry caching with memory management
        self.telemetry_snapshot = {}
        self.telemetry_cache = {}  
        self.max_cache_size = max_cache_size
        self.cache_ttl = cache_ttl  
        self.lock = threading.Lock()
        self.reconnect_interval = reconnect_interval 
        self.connection_string = None
        self.baud = None
        
        # Error recovery and retry logic
        self.max_retry_attempts = max_retry_attempts
        self.current_retry_count = 0
        self.last_connection_attempt = None
        self.backoff_multiplier = 2
        self.max_backoff_delay = 60  # Maximum 60 seconds between retries
        self.jitter_range = 0.1  # 10% jitter to prevent thundering herd
        
        # Circuit breakers for different operations
        self.connection_breaker = CircuitBreaker(
            failure_threshold=3,
            timeout=30.0,
            name="drone_connection"
        )
        self.telemetry_breaker = CircuitBreaker(
            failure_threshold=5,
            timeout=15.0,
            name="telemetry_read"
        )
        
        # Register circuit breakers
        circuit_breaker_registry.register_breaker(self.connection_breaker)
        circuit_breaker_registry.register_breaker(self.telemetry_breaker)
        
        # Start cache cleanup thread
        self.cache_cleanup_thread = threading.Thread(target=self._cache_cleanup_worker, daemon=True)
        self.cache_cleanup_thread.start()

    def _cache_cleanup_worker(self):
        """Background worker to clean up expired cache entries"""
        while True:
            try:
                with self.lock:
                    current_time = time.time()
                    expired_keys = []
                    
                    # Find expired entries
                    for key, (timestamp, data) in self.telemetry_cache.items():
                        if current_time - timestamp > self.cache_ttl:
                            expired_keys.append(key)
                    
                    # Remove expired entries
                    for key in expired_keys:
                        del self.telemetry_cache[key]
                    
                    # Enforce cache size limit (remove oldest entries)
                    if len(self.telemetry_cache) > self.max_cache_size:
                        # Sort by timestamp and remove oldest
                        sorted_items = sorted(
                            self.telemetry_cache.items(),
                            key=lambda x: x[1][0]  # Sort by timestamp
                        )
                        excess_count = len(self.telemetry_cache) - self.max_cache_size
                        for i in range(excess_count):
                            key_to_remove = sorted_items[i][0]
                            del self.telemetry_cache[key_to_remove]
                    
                    if expired_keys or len(self.telemetry_cache) > self.max_cache_size:
                        logging.debug(f"Cache cleanup: removed {len(expired_keys)} expired entries, "
                                    f"cache size now: {len(self.telemetry_cache)}")
                
                time.sleep(30)  # Cleanup every 30 seconds
                
            except Exception as e:
                logging.error(f"Cache cleanup error: {e}")
                time.sleep(60)  # Back off on error

    def _store_in_cache(self, data):
        """Store telemetry data in cache with timestamp"""
        try:
            with self.lock:
                timestamp = time.time()
                cache_key = f"telemetry_{timestamp}"
                self.telemetry_cache[cache_key] = (timestamp, data.copy())
                
                # Immediate size check (in case cleanup thread is behind)
                if len(self.telemetry_cache) > self.max_cache_size * 1.2:  # 20% buffer
                    # Emergency cleanup - remove oldest 25% of entries
                    sorted_items = sorted(
                        self.telemetry_cache.items(),
                        key=lambda x: x[1][0]
                    )
                    remove_count = int(len(self.telemetry_cache) * 0.25)
                    for i in range(remove_count):
                        key_to_remove = sorted_items[i][0]
                        del self.telemetry_cache[key_to_remove]
                    
                    logging.warning(f"Emergency cache cleanup: removed {remove_count} entries")
                
        except Exception as e:
            logging.error(f"Error storing in cache: {e}")

    def get_cache_stats(self):
        """Get cache statistics for monitoring"""
        with self.lock:
            current_time = time.time()
            total_entries = len(self.telemetry_cache)
            
            if total_entries == 0:
                return {
                    "total_entries": 0,
                    "oldest_entry_age": 0,
                    "newest_entry_age": 0,
                    "cache_size_mb": 0,
                    "max_cache_size": self.max_cache_size,
                    "cache_ttl": self.cache_ttl
                }
            
            # Calculate age statistics
            timestamps = [item[0] for item in self.telemetry_cache.values()]
            oldest_timestamp = min(timestamps)
            newest_timestamp = max(timestamps)
            
            # Estimate memory usage (rough calculation)
            import sys
            total_size = sys.getsizeof(self.telemetry_cache)
            for key, (timestamp, data) in self.telemetry_cache.items():
                total_size += sys.getsizeof(key) + sys.getsizeof(timestamp) + sys.getsizeof(data)
            
            return {
                "total_entries": total_entries,
                "oldest_entry_age": current_time - oldest_timestamp,
                "newest_entry_age": current_time - newest_timestamp,
                "cache_size_mb": total_size / (1024 * 1024),
                "max_cache_size": self.max_cache_size,
                "cache_ttl": self.cache_ttl
            }

    def _calculate_backoff_delay(self):
        """Calculate exponential backoff delay with jitter"""
        base_delay = self.reconnect_interval * (self.backoff_multiplier ** self.current_retry_count)
        # Cap the delay to max_backoff_delay
        delay = min(base_delay, self.max_backoff_delay)
        # Add jitter to prevent thundering herd
        jitter = delay * self.jitter_range * (2 * random.random() - 1)  # ±10%
        return max(1, delay + jitter)

    def _should_retry_connection(self):
        """Determine if we should attempt to reconnect"""
        if self.current_retry_count >= self.max_retry_attempts:
            return False
        if self.last_connection_attempt:
            min_interval = self._calculate_backoff_delay()
            time_since_last = time.time() - self.last_connection_attempt
            return time_since_last >= min_interval
        return True

    def _reset_retry_state(self):
        """Reset retry counters on successful connection"""
        self.current_retry_count = 0
        self.last_connection_attempt = None

    def _connect_vehicle(self, connection_string, baud):
        """Internal method to connect to vehicle (protected by circuit breaker)"""
        self.vehicle = connect(connection_string, baud=baud, wait_ready=True, timeout=30)
        return self.vehicle

    def connect_with_retry(self, connection_string, baud):
        """Enhanced connect method with retry logic and circuit breaker"""
        self.connection_string = connection_string
        self.baud = baud

        if self.vehicle is not None:
            logging.warning("Already connected to vehicle")
            return True

        while self._should_retry_connection():
            try:
                self.last_connection_attempt = time.time()
                logging.info(f"Attempting connection (attempt {self.current_retry_count + 1}/{self.max_retry_attempts})")
                
                # Use circuit breaker for connection
                vehicle = self.connection_breaker.call(
                    self._connect_vehicle, 
                    connection_string, 
                    baud
                )
                
                self.vehicle = vehicle
                self.is_connected = True
                self.telemetry = TelemetryData(self.vehicle)
                self._reset_retry_state()
                logging.info("Successfully connected to vehicle")
                self.start_monitoring()
                return True
                
            except Exception as e:
                self.current_retry_count += 1
                self.is_connected = False
                logging.error(f"Connection attempt {self.current_retry_count} failed: {e}")
                
                if self.current_retry_count < self.max_retry_attempts:
                    delay = self._calculate_backoff_delay()
                    logging.info(f"Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                else:
                    logging.error("Max retry attempts reached. Connection failed.")
                    return False
        
        return False

    def connect(self, connection_string, baud):
        """Simple connect method (backwards compatibility)"""
        return self.connect_with_retry(connection_string, baud)

    def disconnect(self):
        try:
            if self.vehicle:
                self.stop_monitoring()
                self.vehicle.close()
                self.vehicle = None
                self.is_connected = False
                logging.info("Disconnected from vehicle")
            else:
                logging.warning("No vehicle to disconnect")
        except Exception as e:
            logging.error(f"Error during disconnection: {e}")

    def start_monitoring(self):
        if self.thread is None or not self.thread.is_alive():
            self.monitoring = True
            self.thread = threading.Thread(target=self.monitor_vehicle, daemon=True)
            self.thread.start()
            logging.info("Started vehicle monitoring thread")

    def stop_monitoring(self):
        self.monitoring = False
        if self.thread is not None and threading.current_thread() != self.thread:
            self.thread.join()
        self.thread = None
        logging.info("Stopped vehicle monitoring thread")

    def _get_telemetry_snapshot(self):
        """Internal method to get telemetry (protected by circuit breaker)"""
        if not self.telemetry or not self.is_connected:
            return None
        return self.telemetry.full_snapshot()

    def get_snapshot(self):
        """Thread-safe method to get current telemetry snapshot with fallback and circuit breaker"""
        try:
            with self.lock:
                # Use circuit breaker for telemetry read
                snapshot = self.telemetry_breaker.call(self._get_telemetry_snapshot)
                
                if snapshot:
                    self.telemetry_snapshot = snapshot
                    # Store in historical cache
                    self._store_in_cache(snapshot)
                    return snapshot
                
                # Return cached data if current read fails
                if self.telemetry_snapshot:
                    logging.warning("Using cached telemetry data due to read failure")
                    return self.telemetry_snapshot
                
                # Return safe defaults if no data available
                return self._get_default_telemetry()
                
        except Exception as e:
            logging.error(f"Error getting telemetry snapshot: {e}")
            
            # Return cached data if available, otherwise defaults
            if self.telemetry_snapshot:
                logging.warning("Circuit breaker open or error - using cached telemetry")
                cached_data = self.telemetry_snapshot.copy()
                cached_data["connection_status"] = "CIRCUIT_BREAKER_OPEN"
                return cached_data
            
            return self._get_default_telemetry()

    def get_circuit_breaker_status(self):
        """Get status of all circuit breakers"""
        return {
            "connection": self.connection_breaker.get_state(),
            "telemetry": self.telemetry_breaker.get_state()
        }

    def _get_default_telemetry(self):
        """Return safe default telemetry when vehicle is unavailable"""
        return {
            "timestamp": time.time(),
            "position": {"latitude": 0.0, "longitude": 0.0, "altitude": 0.0},
            "velocity": {"vx": 0.0, "vy": 0.0, "vz": 0.0},
            "attitude": {"roll": 0.0, "pitch": 0.0, "yaw": 0.0},
            "state": {"armed": False, "mode": "UNKNOWN", "system_status": "UNKNOWN"},
            "battery": {"voltage": 0.0, "current": 0.0, "level": -1},
            "control": {"armed": False, "mode": "UNKNOWN", "system_status": "UNKNOWN", "channels": {}},
            "heartbeat": {"last_heartbeat": None, "armed": False},
            "navigation": {"fix_type": 0, "satellites_visible": 0, "heading": 0, "groundspeed": 0, "airspeed": 0},
            "valid_modes": {"modes": []},
            "connection_status": "DISCONNECTED"
        }

    def monitor_vehicle(self):
        """Continuously monitor vehicle status, heartbeat, and cache telemetry"""
        self.monitoring = True
        consecutive_errors = 0
        max_consecutive_errors = 5
        
        while self.monitoring:
            try:
                if not self.vehicle or not self.is_connected:
                    # Try reconnecting if disconnected
                    logging.warning("Vehicle disconnected. Attempting reconnect...")
                    success = self.connect_with_retry(self.connection_string, self.baud)
                    if not success:
                        logging.info(f"Retrying in {self.reconnect_interval}s...")
                        time.sleep(self.reconnect_interval)
                        consecutive_errors += 1
                        if consecutive_errors >= max_consecutive_errors:
                            logging.error("Too many consecutive connection failures. Backing off...")
                            time.sleep(self.reconnect_interval * 3)
                            consecutive_errors = 0
                    continue

                # Reset error counter on successful connection
                consecutive_errors = 0

                # Update state
                state = self._get_vehicle_state()
                if state:
                    logging.info(
                        f"Armed: {state['armed']}, Mode: {state['mode']}, "
                        f"State: {state['state']}, Heartbeat: {state['last_heartbeat']}"
                    )

                    # Update cached telemetry
                    self.get_snapshot()

                time.sleep(1)
                
            except Exception as e:
                consecutive_errors += 1
                logging.error(f"Monitor error ({consecutive_errors}/{max_consecutive_errors}): {e}")
                
                if consecutive_errors >= max_consecutive_errors:
                    logging.error("Too many monitoring errors. Attempting connection reset...")
                    self.disconnect()
                    time.sleep(self.reconnect_interval)
                    consecutive_errors = 0
                else:
                    time.sleep(1)

                # Check heartbeat staleness
                last_hb = self.vehicle.last_heartbeat
                if last_hb and isinstance(last_hb, datetime):
                    if datetime.utcnow() - last_hb > timedelta(seconds=5):
                        logging.error("Stale heartbeat detected! Disconnecting...")
                        self.is_connected = False
                        self.disconnect()
                        continue

            # Update telemetry snapshot
            if self.telemetry:
                snapshot = self.telemetry.full_snapshot()
                with self.lock:
                    self.telemetry_snapshot = snapshot

            time.sleep(1)

    def _get_vehicle_state(self):
        if not self.vehicle:
            return None
        try:
            self.is_arm = self.vehicle.armed
            self.mode = self.vehicle.mode.name
            self.state = self.vehicle.system_status.state
            self.current_heartbeat = self.vehicle.last_heartbeat
            return {
                "armed": self.vehicle.armed,
                "mode": self.mode,
                "state": self.state,
                "last_heartbeat": self.current_heartbeat
            }
        except Exception as e:
            logging.error(f"Error extracting vehicle state: {e}")
            return None


if __name__ == "__main__":
    drone = DroneConnection()
    # Try connecting to SITL simulator first, then physical device
    connection_options = [
        ('udp:127.0.0.1:14550', None),  # SITL UDP
        ('tcp:127.0.0.1:5760', None),   # SITL TCP
        ('/dev/ttyACM0', 115200),       # Physical device
        ('/dev/ttyUSB0', 57600),        # Alternative physical device
    ]
    
    connected = False
    for connection_string, baud in connection_options:
        print(f"Trying to connect to: {connection_string}")
        if drone.connect(connection_string, baud):
            connected = True
            print(f"Successfully connected to {connection_string}")
            break
        else:
            print(f"Failed to connect to {connection_string}")
    
    if connected:
        try:
            while True:
                snap = drone.get_snapshot()
                if snap:
                    print("Latest Snapshot:", snap)
                time.sleep(2)
        except KeyboardInterrupt:
            logging.info("Exiting...")
        finally:
            drone.disconnect()
    else:
        print("Could not connect to any vehicle. Make sure a drone/simulator is running.")
        print("For SITL, run: sim_vehicle.py --console --map")
